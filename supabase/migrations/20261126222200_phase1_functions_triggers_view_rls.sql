-- Phase 1.3: Security Helpers, Auth Trigger, Atomic RPCs, Availability Generator, Audit Triggers, View & RLS

-- ============================================================
-- 1. Security & Utility Functions
-- ============================================================

CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' FROM regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
      AND account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_account()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_session_confirmed_count(p_session_id uuid)
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int
  FROM public.bookings
  WHERE session_id = p_session_id
    AND status IN ('confirmed', 'checked_in');
$$;

CREATE OR REPLACE FUNCTION public.get_session_waitlist_count(p_session_id uuid)
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int
  FROM public.bookings
  WHERE session_id = p_session_id
    AND status = 'waitlisted';
$$;

-- ============================================================
-- 2. Auth User Provisioning & Privilege Escalation Guard
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_locale text;
  v_base_slug text;
  v_slug text;
BEGIN
  v_name := coalesce(
    nullif(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(NEW.raw_user_meta_data->>'name'), ''),
    nullif(split_part(coalesce(NEW.email, ''), '@', 1), ''),
    'member'
  );

  v_locale := CASE
    WHEN lower(coalesce(NEW.raw_user_meta_data->>'locale', 'en')) = 'es' THEN 'es'
    ELSE 'en'
  END;

  v_base_slug := nullif(public.slugify(v_name), '');
  v_slug := coalesce(v_base_slug, 'member') || '-' || substr(replace(NEW.id::text, '-', ''), 1, 6);

  INSERT INTO public.profiles (
    id,
    slug,
    role,
    account_status,
    full_name,
    email,
    phone,
    locale,
    avatar_url
  )
  VALUES (
    NEW.id,
    v_slug,
    'user',
    'active',
    v_name,
    coalesce(NEW.email, ''),
    nullif(trim(NEW.raw_user_meta_data->>'phone'), ''),
    v_locale,
    nullif(trim(NEW.raw_user_meta_data->>'avatar_url'), '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();

  -- Allow service-role / SQL migrations, active admins, or controlled internal RPC role upgrade
  IF v_uid IS NULL
     OR public.is_admin()
     OR current_setting('app.allow_profile_role_upgrade', true) = 'true' THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.account_status IS DISTINCT FROM OLD.account_status
     OR NEW.moderation_reason IS DISTINCT FROM OLD.moderation_reason
     OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
     OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
     OR NEW.first_booked_at IS DISTINCT FROM OLD.first_booked_at THEN
    RAISE EXCEPTION 'FORBIDDEN_PROFILE_FIELD_UPDATE'
      USING ERRCODE = '42501',
            DETAIL = 'Only administrators or system workflows may modify role or moderation fields.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- ============================================================
-- 3. Public Availability View (Zero Bookings PII Exposure)
-- ============================================================

CREATE OR REPLACE VIEW public.sessions_with_availability
WITH (security_invoker = true) AS
SELECT
  s.id,
  s.slug,
  s.session_type_id,
  s.availability_rule_id,
  s.location_id,
  s.title,
  s.description,
  s.focus,
  s.place,
  s.starts_at,
  s.ends_at,
  s.duration_min,
  s.max_slots,
  s.price_eur,
  s.level,
  s.equipment,
  s.status,
  s.cancel_reason,
  s.cancelled_at,
  s.weather_note,
  l.slug AS location_slug,
  l.name AS location_name,
  l.neighborhood AS location_neighborhood,
  l.landmark_en AS location_landmark_en,
  l.landmark_es AS location_landmark_es,
  l.metro AS location_metro,
  l.maps_url AS location_maps_url,
  public.get_session_confirmed_count(s.id) AS confirmed_count,
  public.get_session_waitlist_count(s.id) AS waitlist_count,
  GREATEST(0, s.max_slots - public.get_session_confirmed_count(s.id)) AS spots_remaining
FROM public.sessions s
JOIN public.locations l ON l.id = s.location_id;

GRANT SELECT ON public.sessions_with_availability TO anon, authenticated;

-- ============================================================
-- 4. Atomic Booking & Cancellation RPCs
-- ============================================================

CREATE OR REPLACE FUNCTION public.book_session_atomic(
  p_session_id uuid,
  p_notes text DEFAULT NULL,
  p_join_waitlist boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_session public.sessions%ROWTYPE;
  v_confirmed_count int;
  v_booking_status text;
  v_booking_id uuid;
  v_promoted_to_client boolean := false;
  v_actor_role text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_uid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF v_profile.account_status <> 'active' THEN
    RAISE EXCEPTION 'ACCOUNT_RESTRICTED' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_session
  FROM public.sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SESSION_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF v_session.status NOT IN ('scheduled', 'moved_indoor') THEN
    RAISE EXCEPTION 'SESSION_NOT_BOOKABLE' USING ERRCODE = 'P0001';
  END IF;

  IF v_session.starts_at <= now() THEN
    RAISE EXCEPTION 'SESSION_ALREADY_STARTED' USING ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE session_id = p_session_id
      AND user_id = v_uid
      AND status IN ('confirmed', 'waitlisted', 'checked_in')
  ) THEN
    RAISE EXCEPTION 'ALREADY_BOOKED' USING ERRCODE = '23505';
  END IF;

  SELECT count(*)::int INTO v_confirmed_count
  FROM public.bookings
  WHERE session_id = p_session_id
    AND status IN ('confirmed', 'checked_in');

  IF v_confirmed_count < v_session.max_slots THEN
    v_booking_status := 'confirmed';
  ELSIF p_join_waitlist THEN
    v_booking_status := 'waitlisted';
  ELSE
    RAISE EXCEPTION 'SESSION_FULL' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.bookings (
    session_id,
    user_id,
    status,
    payment_status,
    notes
  )
  VALUES (
    p_session_id,
    v_uid,
    v_booking_status,
    'unpaid',
    nullif(trim(coalesce(p_notes, '')), '')
  )
  RETURNING id INTO v_booking_id;

  v_actor_role := v_profile.role;

  IF v_booking_status = 'confirmed' AND v_profile.role = 'user' THEN
    PERFORM set_config('app.allow_profile_role_upgrade', 'true', true);

    UPDATE public.profiles
    SET role = 'client',
        first_booked_at = coalesce(first_booked_at, now())
    WHERE id = v_uid;

    INSERT INTO public.user_moderation_history (
      target_user_id,
      actor_id,
      event_type,
      previous_role,
      new_role,
      previous_status,
      new_status,
      reason
    )
    VALUES (
      v_uid,
      v_uid,
      'role_changed',
      'user',
      'client',
      v_profile.account_status,
      v_profile.account_status,
      'Automatic upgrade on first confirmed session booking'
    );

    v_promoted_to_client := true;
    v_actor_role := 'client';
  ELSIF v_booking_status = 'confirmed' AND v_profile.first_booked_at IS NULL THEN
    PERFORM set_config('app.allow_profile_role_upgrade', 'true', true);
    UPDATE public.profiles
    SET first_booked_at = now()
    WHERE id = v_uid;
  END IF;

  INSERT INTO public.booking_history (
    booking_id,
    session_id,
    user_id,
    event_type,
    actor_id,
    actor_role,
    previous_status,
    new_status,
    reason
  )
  VALUES (
    v_booking_id,
    p_session_id,
    v_uid,
    CASE WHEN v_booking_status = 'confirmed' THEN 'booked' ELSE 'waitlisted' END,
    v_uid,
    v_actor_role,
    NULL,
    v_booking_status,
    NULL
  );

  RETURN jsonb_build_object(
    'booking_id', v_booking_id,
    'session_id', p_session_id,
    'status', v_booking_status,
    'promoted_to_client', v_promoted_to_client,
    'spots_remaining', GREATEST(
      0,
      v_session.max_slots - (v_confirmed_count + CASE WHEN v_booking_status = 'confirmed' THEN 1 ELSE 0 END)
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_booking_atomic(
  p_booking_id uuid,
  p_reason text DEFAULT NULL,
  p_reject boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_booking public.bookings%ROWTYPE;
  v_session public.sessions%ROWTYPE;
  v_new_status text;
  v_next_waitlist_id uuid;
  v_next_waitlist_user_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = '28000';
  END IF;

  v_is_admin := public.is_admin();

  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF NOT v_is_admin THEN
    IF v_booking.user_id <> v_uid OR NOT public.is_active_account() THEN
      RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
    END IF;
    IF p_reject THEN
      RAISE EXCEPTION 'FORBIDDEN_REJECT' USING ERRCODE = '42501';
    END IF;
  END IF;

  IF v_booking.status NOT IN ('confirmed', 'waitlisted', 'checked_in') THEN
    RAISE EXCEPTION 'BOOKING_NOT_ACTIVE' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_session
  FROM public.sessions
  WHERE id = v_booking.session_id
  FOR UPDATE;

  v_new_status := CASE WHEN p_reject AND v_is_admin THEN 'rejected' ELSE 'cancelled' END;

  UPDATE public.bookings
  SET status = v_new_status,
      cancel_reason = nullif(trim(coalesce(p_reason, '')), ''),
      cancelled_at = now(),
      cancelled_by = v_uid
  WHERE id = p_booking_id;

  IF v_booking.status IN ('confirmed', 'checked_in')
     AND v_session.status IN ('scheduled', 'moved_indoor')
     AND v_session.starts_at > now() THEN
    SELECT b.id, b.user_id
    INTO v_next_waitlist_id, v_next_waitlist_user_id
    FROM public.bookings b
    JOIN public.profiles p ON p.id = b.user_id
    WHERE b.session_id = v_booking.session_id
      AND b.status = 'waitlisted'
      AND p.account_status = 'active'
    ORDER BY b.booked_at ASC
    LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'booking_id', p_booking_id,
    'session_id', v_booking.session_id,
    'previous_status', v_booking.status,
    'new_status', v_new_status,
    'next_waitlist_booking_id', v_next_waitlist_id,
    'next_waitlist_user_id', v_next_waitlist_user_id
  );
END;
$$;

-- ============================================================
-- 5. Calendar Availability Engine Generator
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_sessions_for_range(
  p_from_date date DEFAULT current_date,
  p_to_date date DEFAULT (current_date + 28)
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_day date;
  v_weekday int;
  v_rule record;
  v_ex public.session_availability_exceptions%ROWTYPE;
  v_start_time time;
  v_location_id uuid;
  v_place text;
  v_max_slots int;
  v_status text;
  v_weather_note text;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_slug text;
  v_inserted int := 0;
  v_row_count int := 0;
  v_studio_location_id uuid;
BEGIN
  IF v_uid IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF p_to_date < p_from_date THEN
    RAISE EXCEPTION 'INVALID_DATE_RANGE' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO v_studio_location_id
  FROM public.locations
  WHERE place = 'Studio' AND is_active = true
  ORDER BY sort_order ASC
  LIMIT 1;

  FOR v_day IN
    SELECT d::date
    FROM generate_series(p_from_date, p_to_date, interval '1 day') AS d
  LOOP
    -- ISO day of week: 1 = Mon .. 7 = Sun -> 0 = Mon .. 6 = Sun
    v_weekday := EXTRACT(ISODOW FROM v_day)::int - 1;

    -- Skip entire date if a global blackout exists
    IF EXISTS (
      SELECT 1
      FROM public.session_availability_exceptions
      WHERE availability_rule_id IS NULL
        AND exception_date = v_day
        AND exception_type = 'blackout'
    ) THEN
      CONTINUE;
    END IF;

    FOR v_rule IN
      SELECT
        r.*,
        st.slug AS type_slug,
        st.title AS type_title,
        st.description AS type_description,
        st.focus AS type_focus,
        st.level AS type_level,
        st.equipment AS type_equipment
      FROM public.session_availability_rules r
      JOIN public.session_types st ON st.id = r.session_type_id
      WHERE r.is_active = true
        AND st.is_active = true
        AND r.weekday = v_weekday
        AND r.effective_from <= v_day
        AND (r.availability_mode = 'ongoing' OR r.effective_until >= v_day)
    LOOP
      v_start_time := v_rule.start_time;
      v_location_id := v_rule.location_id;
      v_max_slots := v_rule.max_slots;
      v_status := 'scheduled';
      v_weather_note := NULL;

      -- Check rule-specific exception on v_day (latest wins if multiple)
      SELECT * INTO v_ex
      FROM public.session_availability_exceptions
      WHERE availability_rule_id = v_rule.id
        AND exception_date = v_day
      ORDER BY created_at DESC
      LIMIT 1;

      IF FOUND THEN
        IF v_ex.exception_type = 'blackout' THEN
          CONTINUE;
        ELSIF v_ex.exception_type = 'override_time' AND v_ex.override_start_time IS NOT NULL THEN
          v_start_time := v_ex.override_start_time;
        ELSIF v_ex.exception_type = 'override_location' AND v_ex.override_location_id IS NOT NULL THEN
          v_location_id := v_ex.override_location_id;
        ELSIF v_ex.exception_type = 'override_slots' AND v_ex.override_max_slots IS NOT NULL THEN
          v_max_slots := v_ex.override_max_slots;
        ELSIF v_ex.exception_type = 'weather_indoor' THEN
          v_status := 'moved_indoor';
          v_weather_note := v_ex.reason;
          v_location_id := coalesce(v_ex.override_location_id, v_studio_location_id, v_location_id);
        END IF;
      END IF;

      SELECT place INTO v_place FROM public.locations WHERE id = v_location_id;

      v_starts_at := (v_day + v_start_time) AT TIME ZONE 'Europe/Madrid';
      v_ends_at := v_starts_at + make_interval(mins => v_rule.duration_min);
      v_slug := v_rule.type_slug || '-' || to_char(v_day, 'YYYY-MM-DD') || '-' || to_char(v_start_time, 'HH24MI');

      INSERT INTO public.sessions (
        slug,
        session_type_id,
        availability_rule_id,
        location_id,
        title,
        description,
        focus,
        place,
        starts_at,
        ends_at,
        duration_min,
        max_slots,
        price_eur,
        level,
        equipment,
        status,
        weather_note,
        created_by
      )
      VALUES (
        v_slug,
        v_rule.session_type_id,
        v_rule.id,
        v_location_id,
        v_rule.type_title,
        v_rule.type_description,
        v_rule.type_focus,
        coalesce(v_place, 'Outdoor'),
        v_starts_at,
        v_ends_at,
        v_rule.duration_min,
        v_max_slots,
        v_rule.price_eur,
        v_rule.type_level,
        v_rule.type_equipment,
        v_status,
        v_weather_note,
        v_uid
      )
      ON CONFLICT DO NOTHING;

      GET DIAGNOSTICS v_row_count = ROW_COUNT;
      v_inserted := v_inserted + v_row_count;
    END LOOP;
  END LOOP;

  RETURN v_inserted;
END;
$$;

-- ============================================================
-- 6. Automatic Audit History Triggers
-- ============================================================

CREATE OR REPLACE FUNCTION public.audit_sessions_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_actor uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.session_history (session_id, action, actor_id, reason, previous_state, new_state)
    VALUES (NEW.id, 'created', coalesce(v_actor, NEW.created_by), NULL, NULL, to_jsonb(NEW));
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.title IS NOT DISTINCT FROM NEW.title
       AND OLD.description IS NOT DISTINCT FROM NEW.description
       AND OLD.location_id IS NOT DISTINCT FROM NEW.location_id
       AND OLD.starts_at IS NOT DISTINCT FROM NEW.starts_at
       AND OLD.ends_at IS NOT DISTINCT FROM NEW.ends_at
       AND OLD.max_slots IS NOT DISTINCT FROM NEW.max_slots
       AND OLD.price_eur IS NOT DISTINCT FROM NEW.price_eur
       AND OLD.status IS NOT DISTINCT FROM NEW.status
       AND OLD.cancel_reason IS NOT DISTINCT FROM NEW.cancel_reason
       AND OLD.weather_note IS NOT DISTINCT FROM NEW.weather_note THEN
      RETURN NEW;
    END IF;

    v_action := CASE
      WHEN NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN 'cancelled'
      WHEN NEW.status = 'moved_indoor' AND OLD.status IS DISTINCT FROM 'moved_indoor' THEN 'moved_indoor'
      WHEN NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN 'completed'
      ELSE 'updated'
    END;

    INSERT INTO public.session_history (session_id, action, actor_id, reason, previous_state, new_state)
    VALUES (
      NEW.id,
      v_action,
      coalesce(v_actor, NEW.cancelled_by),
      coalesce(NEW.cancel_reason, NEW.weather_note),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_sessions_audit
  AFTER INSERT OR UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.audit_sessions_change();

CREATE OR REPLACE FUNCTION public.audit_bookings_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_actor_role text;
  v_event text;
BEGIN
  IF v_actor IS NOT NULL THEN
    SELECT role INTO v_actor_role FROM public.profiles WHERE id = v_actor;
  ELSE
    v_actor_role := 'system';
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    v_event := CASE
      WHEN OLD.status = 'waitlisted' AND NEW.status = 'confirmed' THEN 'promoted'
      WHEN NEW.status = 'checked_in' THEN 'checked_in'
      WHEN NEW.status = 'no_show' THEN 'no_show'
      WHEN NEW.status = 'rejected' THEN 'rejected'
      WHEN NEW.status = 'cancelled' THEN
        CASE
          WHEN v_actor_role = 'admin' AND v_actor IS DISTINCT FROM NEW.user_id THEN 'cancelled_by_admin'
          ELSE 'cancelled_by_user'
        END
      WHEN NEW.status = 'waitlisted' THEN 'waitlisted'
      ELSE 'booked'
    END;

    INSERT INTO public.booking_history (
      booking_id,
      session_id,
      user_id,
      event_type,
      actor_id,
      actor_role,
      previous_status,
      new_status,
      reason
    )
    VALUES (
      NEW.id,
      NEW.session_id,
      NEW.user_id,
      v_event,
      coalesce(v_actor, NEW.cancelled_by),
      coalesce(v_actor_role, 'system'),
      OLD.status,
      NEW.status,
      NEW.cancel_reason
    );
  END IF;

  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
    INSERT INTO public.booking_history (
      booking_id,
      session_id,
      user_id,
      event_type,
      actor_id,
      actor_role,
      previous_status,
      new_status,
      reason
    )
    VALUES (
      NEW.id,
      NEW.session_id,
      NEW.user_id,
      CASE WHEN NEW.payment_status = 'paid' THEN 'marked_paid' ELSE 'marked_unpaid' END,
      coalesce(v_actor, NEW.marked_paid_by),
      coalesce(v_actor_role, 'system'),
      OLD.payment_status,
      NEW.payment_status,
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_bookings_audit
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.audit_bookings_update();

CREATE OR REPLACE FUNCTION public.audit_availability_rules_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.availability_change_history (rule_id, action, actor_id, snapshot)
    VALUES (NEW.id, 'rule_created', coalesce(v_actor, NEW.created_by), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.availability_change_history (rule_id, action, actor_id, snapshot)
    VALUES (NEW.id, 'rule_updated', v_actor, jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.availability_change_history (rule_id, action, actor_id, snapshot)
    VALUES (NULL, 'rule_deleted', v_actor, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE TRIGGER trg_availability_rules_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.session_availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.audit_availability_rules_change();

CREATE OR REPLACE FUNCTION public.audit_availability_exceptions_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.availability_change_history (rule_id, exception_id, action, actor_id, reason, snapshot)
    VALUES (NEW.availability_rule_id, NEW.id, 'exception_created', coalesce(v_actor, NEW.created_by), NEW.reason, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.availability_change_history (rule_id, exception_id, action, actor_id, reason, snapshot)
    VALUES (NEW.availability_rule_id, NEW.id, 'exception_updated', v_actor, NEW.reason, jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.availability_change_history (rule_id, exception_id, action, actor_id, reason, snapshot)
    VALUES (OLD.availability_rule_id, NULL, 'exception_deleted', v_actor, OLD.reason, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE TRIGGER trg_availability_exceptions_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.session_availability_exceptions
  FOR EACH ROW EXECUTE FUNCTION public.audit_availability_exceptions_change();

-- ============================================================
-- 7. Row Level Security (RLS) on All 16 Tables
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_moderation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_logs ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "profiles_update_active_own_or_admin"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((id = (SELECT auth.uid()) AND account_status = 'active') OR public.is_admin())
  WITH CHECK ((id = (SELECT auth.uid()) AND account_status = 'active') OR public.is_admin());

-- locations (public active catalog, admin full)
CREATE POLICY "locations_select_public_or_admin"
  ON public.locations FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "locations_insert_admin"
  ON public.locations FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "locations_update_admin"
  ON public.locations FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "locations_delete_admin"
  ON public.locations FOR DELETE TO authenticated
  USING (public.is_admin());

-- session_types (public active catalog, admin full)
CREATE POLICY "session_types_select_public_or_admin"
  ON public.session_types FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "session_types_insert_admin"
  ON public.session_types FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "session_types_update_admin"
  ON public.session_types FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "session_types_delete_admin"
  ON public.session_types FOR DELETE TO authenticated
  USING (public.is_admin());

-- session_availability_rules (admin only)
CREATE POLICY "availability_rules_admin_all"
  ON public.session_availability_rules FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- session_availability_exceptions (admin only)
CREATE POLICY "availability_exceptions_admin_all"
  ON public.session_availability_exceptions FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- sessions (public read, admin write)
CREATE POLICY "sessions_select_public"
  ON public.sessions FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "sessions_insert_admin"
  ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "sessions_update_admin"
  ON public.sessions FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "sessions_delete_admin"
  ON public.sessions FOR DELETE TO authenticated
  USING (public.is_admin());

-- bookings (owner read own, admin full; clients book/cancel via atomic RPCs)
CREATE POLICY "bookings_select_own_or_admin"
  ON public.bookings FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "bookings_insert_admin"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "bookings_update_admin"
  ON public.bookings FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "bookings_delete_admin"
  ON public.bookings FOR DELETE TO authenticated
  USING (public.is_admin());

-- private_inquiries (validated public insert, own select, admin full)
CREATE POLICY "private_inquiries_insert_public"
  ON public.private_inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(name)) > 0
    AND length(trim(email)) > 2
    AND status = 'new'
    AND admin_notes IS NULL
    AND (user_id IS NULL OR user_id = (SELECT auth.uid()))
  );

CREATE POLICY "private_inquiries_select_own_or_admin"
  ON public.private_inquiries FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "private_inquiries_update_admin"
  ON public.private_inquiries FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "private_inquiries_delete_admin"
  ON public.private_inquiries FOR DELETE TO authenticated
  USING (public.is_admin());

-- coach_client_notes (strictly admin only)
CREATE POLICY "coach_client_notes_admin_all"
  ON public.coach_client_notes FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- studio_settings (public read, admin write)
CREATE POLICY "studio_settings_select_public"
  ON public.studio_settings FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "studio_settings_update_admin"
  ON public.studio_settings FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "studio_settings_insert_admin"
  ON public.studio_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Immutable audit tables (read-only via RLS; written by triggers / service_role Edge Functions)
CREATE POLICY "user_login_history_select_own_or_admin"
  ON public.user_login_history FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "session_history_select_admin"
  ON public.session_history FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "booking_history_select_own_or_admin"
  ON public.booking_history FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "user_moderation_history_select_own_or_admin"
  ON public.user_moderation_history FOR SELECT TO authenticated
  USING (target_user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "availability_change_history_select_admin"
  ON public.availability_change_history FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "email_notification_logs_select_admin"
  ON public.email_notification_logs FOR SELECT TO authenticated
  USING (public.is_admin());

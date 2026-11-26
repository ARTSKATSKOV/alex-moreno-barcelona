-- Phase 1.1: Core Domain Tables, Constraints, Indexes & updated_at Triggers

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 1. profiles (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'client', 'admin')),
  account_status text NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'rejected', 'banned')),
  moderation_reason text,
  moderated_at timestamptz,
  moderated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  locale text NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'es')),
  avatar_url text,
  goals text,
  injuries_notes text,
  emergency_contact text,
  first_booked_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_moderated_by ON public.profiles(moderated_by);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. locations
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  place text NOT NULL CHECK (place IN ('Studio', 'Outdoor')),
  neighborhood text,
  landmark_en text,
  landmark_es text,
  metro text,
  maps_url text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_active_sort ON public.locations(is_active, sort_order);

CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. session_types
CREATE TABLE IF NOT EXISTS public.session_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  focus text NOT NULL CHECK (focus IN ('Strength', 'Conditioning', 'Mobility', 'Private')),
  place text NOT NULL CHECK (place IN ('Studio', 'Outdoor')),
  default_location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  default_duration_min int NOT NULL CHECK (default_duration_min > 0),
  default_max_slots int NOT NULL CHECK (default_max_slots > 0),
  default_price_eur numeric(8,2) NOT NULL CHECK (default_price_eur >= 0),
  level text NOT NULL DEFAULT 'All levels',
  equipment text[] NOT NULL DEFAULT '{}',
  cover_image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_types_default_location ON public.session_types(default_location_id);
CREATE INDEX IF NOT EXISTS idx_session_types_active ON public.session_types(is_active);

CREATE TRIGGER trg_session_types_updated_at
  BEFORE UPDATE ON public.session_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. session_availability_rules
CREATE TABLE IF NOT EXISTS public.session_availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type_id uuid NOT NULL REFERENCES public.session_types(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  weekday int NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  duration_min int NOT NULL CHECK (duration_min > 0),
  max_slots int NOT NULL CHECK (max_slots > 0),
  price_eur numeric(8,2) NOT NULL CHECK (price_eur >= 0),
  availability_mode text NOT NULL DEFAULT 'ongoing' CHECK (availability_mode IN ('ongoing', 'date_range')),
  effective_from date NOT NULL DEFAULT current_date,
  effective_until date,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_availability_mode_dates CHECK (
    (availability_mode = 'ongoing' AND effective_until IS NULL)
    OR (availability_mode = 'date_range' AND effective_until IS NOT NULL AND effective_until >= effective_from)
  )
);

CREATE INDEX IF NOT EXISTS idx_availability_rules_session_type ON public.session_availability_rules(session_type_id);
CREATE INDEX IF NOT EXISTS idx_availability_rules_location ON public.session_availability_rules(location_id);
CREATE INDEX IF NOT EXISTS idx_availability_rules_created_by ON public.session_availability_rules(created_by);
CREATE INDEX IF NOT EXISTS idx_availability_rules_active_weekday ON public.session_availability_rules(is_active, weekday);

CREATE TRIGGER trg_session_availability_rules_updated_at
  BEFORE UPDATE ON public.session_availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. session_availability_exceptions
CREATE TABLE IF NOT EXISTS public.session_availability_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_rule_id uuid REFERENCES public.session_availability_rules(id) ON DELETE CASCADE,
  exception_date date NOT NULL,
  exception_type text NOT NULL CHECK (exception_type IN ('blackout', 'override_time', 'override_location', 'override_slots', 'weather_indoor')),
  override_start_time time,
  override_location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  override_max_slots int CHECK (override_max_slots IS NULL OR override_max_slots > 0),
  reason text NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_availability_exceptions_rule ON public.session_availability_exceptions(availability_rule_id);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_override_location ON public.session_availability_exceptions(override_location_id);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_created_by ON public.session_availability_exceptions(created_by);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_date ON public.session_availability_exceptions(exception_date);

-- 6. sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  session_type_id uuid REFERENCES public.session_types(id) ON DELETE SET NULL,
  availability_rule_id uuid REFERENCES public.session_availability_rules(id) ON DELETE SET NULL,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL,
  focus text NOT NULL CHECK (focus IN ('Strength', 'Conditioning', 'Mobility', 'Private')),
  place text NOT NULL CHECK (place IN ('Studio', 'Outdoor')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  duration_min int NOT NULL CHECK (duration_min > 0),
  max_slots int NOT NULL CHECK (max_slots > 0),
  price_eur numeric(8,2) NOT NULL CHECK (price_eur >= 0),
  level text NOT NULL DEFAULT 'All levels',
  equipment text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'moved_indoor', 'cancelled', 'completed')),
  cancel_reason text,
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  weather_note text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_sessions_end_after_start CHECK (ends_at > starts_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_sessions_rule_starts_at
  ON public.sessions(availability_rule_id, starts_at)
  WHERE availability_rule_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_starts_at ON public.sessions(starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status_starts_at ON public.sessions(status, starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_location_id ON public.sessions(location_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_type_id ON public.sessions(session_type_id);
CREATE INDEX IF NOT EXISTS idx_sessions_cancelled_by ON public.sessions(cancelled_by);
CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON public.sessions(created_by);

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'checked_in', 'no_show', 'cancelled', 'rejected')),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  paid_at timestamptz,
  marked_paid_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,
  cancel_reason text,
  cancelled_at timestamptz,
  cancelled_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  checked_in_at timestamptz,
  booked_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_bookings_active_session_user
  ON public.bookings(session_id, user_id)
  WHERE status IN ('confirmed', 'waitlisted', 'checked_in');
CREATE INDEX IF NOT EXISTS idx_bookings_session_status ON public.bookings(session_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_marked_paid_by ON public.bookings(marked_paid_by);
CREATE INDEX IF NOT EXISTS idx_bookings_cancelled_by ON public.bookings(cancelled_by);

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. private_inquiries
CREATE TABLE IF NOT EXISTS public.private_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  notes text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_private_inquiries_user_id ON public.private_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_private_inquiries_status ON public.private_inquiries(status, created_at DESC);

CREATE TRIGGER trg_private_inquiries_updated_at
  BEFORE UPDATE ON public.private_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 9. coach_client_notes (strictly admin-only)
CREATE TABLE IF NOT EXISTS public.coach_client_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coach_client_notes_client ON public.coach_client_notes(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_client_notes_author ON public.coach_client_notes(author_id);

-- 10. studio_settings (singleton row id = 1)
CREATE TABLE IF NOT EXISTS public.studio_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  cancellation_window_hours int NOT NULL DEFAULT 12 CHECK (cancellation_window_hours >= 0),
  whatsapp_number text NOT NULL DEFAULT '+34 612 345 678',
  contact_email text NOT NULL DEFAULT 'hello@alexmoreno.fit',
  instagram_url text NOT NULL DEFAULT 'https://instagram.com/alexmoreno.fit',
  studio_hours_en text NOT NULL DEFAULT 'Mon–Fri 07:00–20:30 · Sat–Sun 09:00–12:00',
  studio_hours_es text NOT NULL DEFAULT 'Lun–Vie 07:00–20:30 · Sáb–Dom 09:00–12:00',
  banner_message_en text,
  banner_message_es text,
  banner_active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_studio_settings_updated_at
  BEFORE UPDATE ON public.studio_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

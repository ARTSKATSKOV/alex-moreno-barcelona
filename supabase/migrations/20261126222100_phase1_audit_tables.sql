-- Phase 1.2: History & Audit Tables (6 immutable audit trails)

-- 11. user_login_history
CREATE TABLE IF NOT EXISTS public.user_login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  auth_method text NOT NULL DEFAULT 'password' CHECK (auth_method IN ('password', 'magic_link', 'oauth')),
  ip_address text,
  user_agent text,
  success boolean NOT NULL DEFAULT true,
  failure_reason text,
  logged_in_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_login_history_user_time ON public.user_login_history(user_id, logged_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_login_history_time ON public.user_login_history(logged_in_at DESC);

-- 12. session_history
CREATE TABLE IF NOT EXISTS public.session_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'moved_indoor', 'cancelled', 'completed')),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason text,
  previous_state jsonb,
  new_state jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_history_session_time ON public.session_history(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_history_actor ON public.session_history(actor_id);

-- 13. booking_history
CREATE TABLE IF NOT EXISTS public.booking_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (
    event_type IN (
      'booked',
      'waitlisted',
      'promoted',
      'checked_in',
      'no_show',
      'cancelled_by_user',
      'cancelled_by_admin',
      'rejected',
      'marked_paid',
      'marked_unpaid'
    )
  ),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role text CHECK (actor_role IS NULL OR actor_role IN ('user', 'client', 'admin', 'system')),
  previous_status text,
  new_status text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_history_booking_time ON public.booking_history(booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_history_session ON public.booking_history(session_id);
CREATE INDEX IF NOT EXISTS idx_booking_history_user ON public.booking_history(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_history_actor ON public.booking_history(actor_id);

-- 14. user_moderation_history
CREATE TABLE IF NOT EXISTS public.user_moderation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('role_changed', 'banned', 'rejected', 'reinstated')),
  previous_role text,
  new_role text,
  previous_status text,
  new_status text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_moderation_history_target_time ON public.user_moderation_history(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_moderation_history_actor ON public.user_moderation_history(actor_id);

-- 15. availability_change_history
CREATE TABLE IF NOT EXISTS public.availability_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.session_availability_rules(id) ON DELETE SET NULL,
  exception_id uuid REFERENCES public.session_availability_exceptions(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('rule_created', 'rule_updated', 'rule_deleted', 'exception_created', 'exception_updated', 'exception_deleted')),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason text,
  snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_availability_change_history_rule ON public.availability_change_history(rule_id);
CREATE INDEX IF NOT EXISTS idx_availability_change_history_exception ON public.availability_change_history(exception_id);
CREATE INDEX IF NOT EXISTS idx_availability_change_history_actor ON public.availability_change_history(actor_id);
CREATE INDEX IF NOT EXISTS idx_availability_change_history_time ON public.availability_change_history(created_at DESC);

-- 16. email_notification_logs
CREATE TABLE IF NOT EXISTS public.email_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  template_name text NOT NULL,
  related_booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  related_session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed')),
  resend_id text,
  error_message text,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_notification_logs_user ON public.email_notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notification_logs_booking ON public.email_notification_logs(related_booking_id);
CREATE INDEX IF NOT EXISTS idx_email_notification_logs_session ON public.email_notification_logs(related_session_id);
CREATE INDEX IF NOT EXISTS idx_email_notification_logs_sent_at ON public.email_notification_logs(sent_at DESC);

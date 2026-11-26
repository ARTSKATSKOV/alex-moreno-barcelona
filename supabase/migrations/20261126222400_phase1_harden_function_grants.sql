-- Phase 1.5: Harden EXECUTE grants on SECURITY DEFINER functions (eliminates 0028/0029 advisor warnings)

-- Trigger functions should NEVER be directly callable via PostgREST RPC by anon or authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privilege_escalation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_sessions_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_bookings_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_availability_rules_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_availability_exceptions_change() FROM PUBLIC, anon, authenticated;

-- Authenticated-only atomic RPCs should never be callable by anon
REVOKE EXECUTE ON FUNCTION public.book_session_atomic(uuid, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.book_session_atomic(uuid, text, boolean) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.cancel_booking_atomic(uuid, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_booking_atomic(uuid, text, boolean) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.generate_sessions_for_range(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_sessions_for_range(date, date) TO authenticated;

-- Internal RLS helper functions do not need anon RPC exposure
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_active_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_account() TO authenticated;

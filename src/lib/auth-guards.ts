import { redirect } from "@tanstack/react-router";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { AccountStatus, Database, Profile, Tables, UserRole } from "@/types/database";

export interface AuthGuardSnapshot {
  isBrowser: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
}

const AUTH_LOOP_PREFIXES = ["/login", "/signup", "/logout", "/forgot-password", "/reset-password"];

/**
 * Ensures `?redirect=` stays strictly inside our origin and never loops back into auth screens.
 */
export function sanitizeRedirectPath(
  target: string | null | undefined,
  fallback = "/client",
): string {
  if (!target) return fallback;
  const trimmed = target.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }
  const lower = trimmed.toLowerCase();
  if (AUTH_LOOP_PREFIXES.some((prefix) => lower === prefix || lower.startsWith(`${prefix}?`))) {
    return fallback;
  }
  return trimmed;
}

export function resolvePostLoginDestination(
  profile: Pick<Profile, "role" | "account_status"> | null,
  requestedRedirect?: string | null,
): string {
  if (profile && (profile.account_status === "banned" || profile.account_status === "rejected")) {
    return "/account-restricted";
  }

  const safeRedirect = requestedRedirect ? sanitizeRedirectPath(requestedRedirect, "") : "";
  if (safeRedirect) {
    return safeRedirect;
  }

  if (profile?.role === "admin") {
    return "/admin";
  }

  return "/client";
}

function normalizeGuardProfile(row: Tables<"profiles">): Profile {
  const role: UserRole =
    row.role === "admin" || row.role === "client" || row.role === "user" ? row.role : "user";
  const accountStatus: AccountStatus =
    row.account_status === "banned" ||
    row.account_status === "rejected" ||
    row.account_status === "active"
      ? row.account_status
      : "active";
  const locale = row.locale === "es" ? "es" : "en";

  return {
    ...row,
    role,
    account_status: accountStatus,
    locale,
  };
}

export async function getAuthGuardSnapshot(
  client: SupabaseClient<Database> = supabase,
): Promise<AuthGuardSnapshot> {
  if (typeof window === "undefined" || !isSupabaseConfigured()) {
    return { isBrowser: false, session: null, user: null, profile: null };
  }

  const {
    data: { session },
  } = await client.auth.getSession();

  const user = session?.user ?? null;
  if (!user) {
    return { isBrowser: true, session: null, user: null, profile: null };
  }

  const { data } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return {
    isBrowser: true,
    session,
    user,
    profile: data ? normalizeGuardProfile(data) : null,
  };
}

export async function requireActiveUser(options: {
  locationHref: string;
  client?: SupabaseClient<Database>;
}): Promise<AuthGuardSnapshot> {
  const snapshot = await getAuthGuardSnapshot(options.client);
  if (!snapshot.isBrowser) return snapshot;

  if (!snapshot.user) {
    const safeRedirect = sanitizeRedirectPath(options.locationHref, "/profile");
    throw redirect({
      to: "/login",
      search: { redirect: safeRedirect },
    });
  }

  if (
    snapshot.profile &&
    (snapshot.profile.account_status === "banned" || snapshot.profile.account_status === "rejected")
  ) {
    throw redirect({ to: "/account-restricted" });
  }

  return snapshot;
}

export async function requireAdmin(options: {
  locationHref: string;
  client?: SupabaseClient<Database>;
}): Promise<AuthGuardSnapshot> {
  const snapshot = await requireActiveUser(options);
  if (!snapshot.isBrowser) return snapshot;

  if (!snapshot.profile || snapshot.profile.role !== "admin") {
    throw redirect({ to: "/unauthorized" });
  }

  return snapshot;
}

export async function redirectIfAuthenticated(options: {
  requestedRedirect?: string | null | undefined;
  client?: SupabaseClient<Database>;
}): Promise<void> {
  const snapshot = await getAuthGuardSnapshot(options.client);
  if (!snapshot.isBrowser || !snapshot.user) return;

  const destination = resolvePostLoginDestination(snapshot.profile, options.requestedRedirect);
  throw redirect({ href: destination });
}

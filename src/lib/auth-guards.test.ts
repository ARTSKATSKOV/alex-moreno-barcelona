import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import {
  redirectIfAuthenticated,
  requireActiveUser,
  requireAdmin,
  resolvePostLoginDestination,
  sanitizeRedirectPath,
} from "@/lib/auth-guards";
import type { Database, Profile } from "@/types/database";

function makeSession(userId = "u-1"): Session {
  const user: User = {
    id: userId,
    email: "member@alexmoreno.fit",
    aud: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-11-26T10:00:00.000Z",
  };
  return {
    access_token: "tok",
    refresh_token: "ref",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user,
  };
}

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "u-1",
    slug: "member-123456",
    role: "client",
    account_status: "active",
    moderation_reason: null,
    moderated_at: null,
    moderated_by: null,
    full_name: "Test Member",
    email: "member@alexmoreno.fit",
    phone: null,
    locale: "en",
    avatar_url: null,
    goals: null,
    injuries_notes: null,
    emergency_contact: null,
    first_booked_at: null,
    last_login_at: null,
    created_at: "2026-11-26T10:00:00.000Z",
    updated_at: "2026-11-26T10:00:00.000Z",
    ...overrides,
  };
}

function mockClient(session: Session | null, profile: Profile | null): SupabaseClient<Database> {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: profile, error: null }),
        })),
      })),
    })),
  } as unknown as SupabaseClient<Database>;
}

describe("auth-guards", () => {
  it("sanitizes redirect paths to prevent open redirects and auth loops", () => {
    expect(sanitizeRedirectPath("/sessions/barbell-strength")).toBe("/sessions/barbell-strength");
    expect(sanitizeRedirectPath("https://evil.example.com")).toBe("/client");
    expect(sanitizeRedirectPath("//evil.example.com")).toBe("/client");
    expect(sanitizeRedirectPath("/login?redirect=/profile")).toBe("/client");
    expect(sanitizeRedirectPath("/logout")).toBe("/client");
    expect(sanitizeRedirectPath(undefined, "/profile")).toBe("/profile");
  });

  it("resolves post-login destination by moderation status, redirect, and role", () => {
    expect(resolvePostLoginDestination({ role: "admin", account_status: "banned" }, "/admin")).toBe(
      "/account-restricted",
    );
    expect(
      resolvePostLoginDestination({ role: "client", account_status: "rejected" }, "/client"),
    ).toBe("/account-restricted");
    expect(
      resolvePostLoginDestination({ role: "admin", account_status: "active" }, undefined),
    ).toBe("/admin");
    expect(resolvePostLoginDestination({ role: "user", account_status: "active" }, undefined)).toBe(
      "/client",
    );
    expect(
      resolvePostLoginDestination(
        { role: "client", account_status: "active" },
        "/sessions/beach-conditioning",
      ),
    ).toBe("/sessions/beach-conditioning");
  });

  it("redirects unauthenticated users to /login with redirect query", async () => {
    const client = mockClient(null, null);
    await expect(requireActiveUser({ locationHref: "/profile", client })).rejects.toMatchObject({
      options: {
        to: "/login",
        search: { redirect: "/profile" },
      },
    });
  });

  it("redirects banned or rejected users to /account-restricted", async () => {
    const client = mockClient(makeSession(), makeProfile({ account_status: "banned" }));
    await expect(requireActiveUser({ locationHref: "/client", client })).rejects.toMatchObject({
      options: { to: "/account-restricted" },
    });
  });

  it("redirects non-admin authenticated users on /admin to /unauthorized", async () => {
    const client = mockClient(
      makeSession(),
      makeProfile({ role: "client", account_status: "active" }),
    );
    await expect(requireAdmin({ locationHref: "/admin", client })).rejects.toMatchObject({
      options: { to: "/unauthorized" },
    });
  });

  it("allows active admins through requireAdmin", async () => {
    const profile = makeProfile({ role: "admin", account_status: "active" });
    const client = mockClient(makeSession(), profile);
    const snapshot = await requireAdmin({ locationHref: "/admin", client });
    expect(snapshot.profile?.role).toBe("admin");
  });

  it("redirects already signed-in users away from /login or /signup", async () => {
    const client = mockClient(
      makeSession(),
      makeProfile({ role: "admin", account_status: "active" }),
    );
    await expect(
      redirectIfAuthenticated({ requestedRedirect: undefined, client }),
    ).rejects.toMatchObject({
      options: { href: "/admin" },
    });
  });
});

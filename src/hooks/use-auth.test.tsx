import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { AuthChangeEvent, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { createSupabaseBrowserClient, getSupabaseConfig } from "@/lib/supabase";
import { ROOT_TOASTER_POSITION } from "@/routes/__root";
import type { Database, Profile } from "@/types/database";

function makeFakeUser(id = "user-123", email = "client@alexmoreno.fit"): User {
  return {
    id,
    email,
    aud: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-11-26T10:00:00.000Z",
  };
}

function makeFakeSession(user: User = makeFakeUser()): Session {
  return {
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user,
  };
}

function makeFakeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "user-123",
    slug: "laura-martinez-1234",
    role: "client",
    account_status: "active",
    moderation_reason: null,
    moderated_at: null,
    moderated_by: null,
    full_name: "Laura Martinez",
    email: "client@alexmoreno.fit",
    phone: "+34 600 000 000",
    locale: "en",
    avatar_url: null,
    goals: "Deadlift progression",
    injuries_notes: null,
    emergency_contact: null,
    first_booked_at: "2026-11-26T10:05:00.000Z",
    last_login_at: "2026-11-26T10:00:00.000Z",
    created_at: "2026-11-26T10:00:00.000Z",
    updated_at: "2026-11-26T10:05:00.000Z",
    ...overrides,
  };
}

function createMockSupabaseClient(options: {
  initialSession?: Session | null;
  profile?: Profile | null;
}) {
  let listener: ((event: AuthChangeEvent, session: Session | null) => void) | null = null;
  const unsubscribe = vi.fn();
  const signOutMock = vi.fn().mockResolvedValue({ error: null });

  const client = {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: options.initialSession ?? null },
        error: null,
      }),
      onAuthStateChange: vi.fn(
        (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
          listener = callback;
          return {
            data: {
              subscription: {
                id: "sub-1",
                callback,
                unsubscribe,
              },
            },
          };
        },
      ),
      signOut: signOutMock,
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: options.profile ?? null,
            error: null,
          }),
        })),
      })),
    })),
  } as unknown as SupabaseClient<Database>;

  return {
    client,
    signOutMock,
    unsubscribe,
    emitAuthChange: (event: AuthChangeEvent, nextSession: Session | null) => {
      listener?.(event, nextSession);
    },
  };
}

function createWrapper(
  client: SupabaseClient<Database>,
  queryClient = new QueryClient(),
  configured = true,
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider client={client} configured={configured}>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    );
  };
}

describe("Phase 0: Supabase config, AuthProvider & toast position", () => {
  it("sets root Sonner Toaster position to top-left", () => {
    expect(ROOT_TOASTER_POSITION).toBe("top-left");
  });

  it("parses Supabase env config with safe fallback when missing", () => {
    const missing = getSupabaseConfig({ VITE_SUPABASE_URL: "", VITE_SUPABASE_ANON_KEY: "" });
    expect(missing.configured).toBe(false);
    expect(missing.url).toBe("https://placeholder.supabase.co");

    const valid = getSupabaseConfig({
      VITE_SUPABASE_URL: " https://unit-test-project.supabase.co ",
      VITE_SUPABASE_ANON_KEY: " sb_publishable_example ",
    });
    expect(valid.configured).toBe(true);
    expect(valid.url).toBe("https://unit-test-project.supabase.co");
    expect(valid.anonKey).toBe("sb_publishable_example");

    const instance = createSupabaseBrowserClient(valid);
    expect(instance).toBeDefined();
  });

  it("throws if useAuth is called outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  it("resolves unauthenticated state cleanly", async () => {
    const { client } = createMockSupabaseClient({ initialSession: null });
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.accountStatus).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isRestricted).toBe(false);
  });

  it("exposes admin role and active flags when signed in as active admin", async () => {
    const session = makeFakeSession();
    const adminProfile = makeFakeProfile({ role: "admin", account_status: "active" });
    const { client } = createMockSupabaseClient({
      initialSession: session,
      profile: adminProfile,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe("admin");
    expect(result.current.accountStatus).toBe("active");
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isRestricted).toBe(false);
  });

  it("flags banned or rejected accounts as restricted and revokes admin privileges", async () => {
    const session = makeFakeSession();
    const bannedAdmin = makeFakeProfile({ role: "admin", account_status: "banned" });
    const { client } = createMockSupabaseClient({
      initialSession: session,
      profile: bannedAdmin,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isRestricted).toBe(true);
  });

  it("clears user, profile, and QueryClient cache on signOut()", async () => {
    const session = makeFakeSession();
    const profile = makeFakeProfile({ role: "client", account_status: "active" });
    const { client, signOutMock } = createMockSupabaseClient({
      initialSession: session,
      profile,
    });

    const queryClient = new QueryClient();
    queryClient.setQueryData(["bookings"], ["b1"]);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(client, queryClient),
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.signOut();
    });

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(queryClient.getQueryData(["bookings"])).toBeUndefined();
  });
});

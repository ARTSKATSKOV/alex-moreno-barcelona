import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { setSentryUser } from "@/lib/sentry";
import type { AccountStatus, Database, Profile, UserRole } from "@/types/database";

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  accountStatus: AccountStatus | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isRestricted: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<Profile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
  client?: SupabaseClient<Database>;
  configured?: boolean;
}

async function fetchUserProfile(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<Profile | null> {
  try {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
  client = supabase,
  configured = isSupabaseConfigured(),
}: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return typeof window !== "undefined" && configured;
  });

  const loadProfileForUser = useCallback(
    async (targetUser: User | null): Promise<Profile | null> => {
      if (!targetUser) {
        setProfile(null);
        return null;
      }
      const nextProfile = await fetchUserProfile(client, targetUser.id);
      setProfile(nextProfile);
      return nextProfile;
    },
    [client],
  );

  useEffect(() => {
    if (typeof window === "undefined" || !configured) {
      setIsLoading(false);
      return;
    }

    let active = true;

    const initialize = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await client.auth.getSession();

        if (!active) return;

        const initialUser = initialSession?.user ?? null;
        setSession(initialSession);
        setUser(initialUser);
        setSentryUser(initialUser ? { id: initialUser.id } : null);

        if (initialUser) {
          const loadedProfile = await fetchUserProfile(client, initialUser.id);
          if (active) {
            setProfile(loadedProfile);
          }
        } else {
          setProfile(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void initialize();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;

      const nextUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(nextUser);
      setSentryUser(nextUser ? { id: nextUser.id } : null);

      if (nextUser) {
        void fetchUserProfile(client, nextUser.id).then((loadedProfile) => {
          if (active) {
            setProfile(loadedProfile);
          }
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client, configured]);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    return loadProfileForUser(user);
  }, [loadProfileForUser, user]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      if (configured) {
        await client.auth.signOut();
      }
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setSentryUser(null);
      queryClient.clear();
    }
  }, [client, configured, queryClient]);

  const role: UserRole | null = profile?.role ?? (user ? "user" : null);
  const accountStatus: AccountStatus | null = profile?.account_status ?? (user ? "active" : null);
  const isAuthenticated = Boolean(user);
  const isAdmin = role === "admin" && accountStatus === "active";
  const isRestricted = accountStatus === "rejected" || accountStatus === "banned";

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      role,
      accountStatus,
      isAuthenticated,
      isAdmin,
      isRestricted,
      isLoading,
      refreshProfile,
      signOut,
    }),
    [
      user,
      session,
      profile,
      role,
      accountStatus,
      isAuthenticated,
      isAdmin,
      isRestricted,
      isLoading,
      refreshProfile,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type LoginAuthMethod = "password" | "magic_link" | "oauth";

/**
 * Records a successful sign-in via the `log-login` Edge Function (captures IP + User-Agent
 * into `user_login_history` once Phase 4 is deployed) and ensures `profiles.last_login_at`
 * stays up-to-date even before Edge Functions are deployed.
 */
export async function recordLoginEvent(
  params: {
    userId: string;
    authMethod: LoginAuthMethod;
  },
  client: SupabaseClient<Database> = supabase,
): Promise<void> {
  if (typeof window === "undefined" || !isSupabaseConfigured()) return;

  try {
    const { error } = await client.functions.invoke("log-login", {
      body: { authMethod: params.authMethod },
    });
    if (!error) return;
  } catch {
    // Edge Function may not be deployed yet in Phase 2; fall back cleanly below.
  }

  try {
    await client
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", params.userId);
  } catch {
    // Non-blocking telemetry update.
  }
}

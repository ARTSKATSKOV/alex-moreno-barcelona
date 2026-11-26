import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const FALLBACK_SUPABASE_URL = "https://placeholder.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "placeholder-anon-key";

export interface SupabaseEnvConfig {
  url: string;
  anonKey: string;
  configured: boolean;
}

export function getSupabaseConfig(
  env: {
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_ANON_KEY?: string;
  } = import.meta.env,
): SupabaseEnvConfig {
  const url = env.VITE_SUPABASE_URL?.trim() ?? "";
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";
  const configured = Boolean(url && anonKey);

  return {
    url: configured ? url : FALLBACK_SUPABASE_URL,
    anonKey: configured ? anonKey : FALLBACK_SUPABASE_ANON_KEY,
    configured,
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().configured;
}

export function createSupabaseBrowserClient(
  config: SupabaseEnvConfig = getSupabaseConfig(),
): SupabaseClient<Database> {
  const isBrowser = typeof window !== "undefined" && config.configured;

  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
      flowType: "pkce",
    },
  });
}

export const supabase: SupabaseClient<Database> = createSupabaseBrowserClient();

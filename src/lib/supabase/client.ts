import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Returns null (and the app keeps running in demo mode) when those are
 * not configured.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}
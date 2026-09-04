import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service role key.
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Returns null (demo
 * mode) when they are not configured so route handlers can fall back to the
 * file-backed store.
 *
 * Security note: this client bypasses Row Level Security — only call it from
 * trusted server code and always scope queries to the current user id.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
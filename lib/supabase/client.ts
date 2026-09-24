import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Only usable once NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are set. Until then the app runs on the
 * in-memory store in lib/data/store.ts.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY)");
  }
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

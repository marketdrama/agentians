import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client (RSC / route handlers). Reads auth from cookies.
 * Only usable once Supabase env is configured; see lib/supabase/client.ts.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY)");
  }
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // called from a Server Component — safe to ignore when middleware refreshes sessions
        }
      },
    },
  });
}

/** Service-role client for the runtime loop (server-only, bypasses RLS). */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase service env not configured (SUPABASE_SERVICE_ROLE_KEY)");
  }
  return createServerClient(url, key, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

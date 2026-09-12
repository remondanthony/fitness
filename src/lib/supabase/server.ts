import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  assertSupabaseConfigured,
} from "@/lib/supabase/config";
import type { Database } from "@/types/database";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Cookies are read and written through Next's cookie store, which is what lets
 * an authenticated session survive across requests once Part 11 adds auth.
 * Writing cookies is only permitted in Server Actions and Route Handlers; from
 * a Server Component the write throws and is swallowed here, which is safe as
 * long as middleware refreshes the session (added with auth in Part 11).
 */
export async function createClient() {
  assertSupabaseConfigured();

  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. Ignored deliberately: the
          // session refresh happens in middleware once auth is in place.
        }
      },
    },
  });
}

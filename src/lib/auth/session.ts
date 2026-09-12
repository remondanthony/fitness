import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Server-only. Reads the session from cookies via the SSR client. */

export type SessionUser = {
  id: string;
  email: string | null;
  /** From auth metadata, set at sign-up. May be absent. */
  displayName: string | null;
};

/**
 * The signed-in user, or null.
 *
 * Uses `getUser()` rather than `getSession()`: getUser revalidates the token
 * with Supabase, so a tampered cookie cannot fake a session. Wrapped in
 * React's `cache` so several Server Components in one render share a single
 * round trip.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  const metadata = data.user.user_metadata ?? {};
  const displayName =
    typeof metadata.display_name === "string" && metadata.display_name.trim()
      ? metadata.display_name.trim()
      : null;

  return { id: data.user.id, email: data.user.email ?? null, displayName };
});

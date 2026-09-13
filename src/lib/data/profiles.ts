import { cache } from "react";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/types/database";

/**
 * Server-only profile access.
 *
 * Ownership is always taken from the authenticated session — never from a
 * value supplied by the browser. RLS enforces the same rule in the database,
 * so these two layers agree.
 */

/**
 * Columns a member is allowed to change about themselves.
 *
 * `avatar_url` holds a storage object path rather than a URL — the avatars
 * bucket is private, so there is no durable URL to keep. See lib/data/avatars.
 */
export type ProfilePatch = Pick<
  TablesUpdate<"profiles">,
  "display_name" | "first_name" | "last_name" | "bio" | "experience_level" | "avatar_url"
>;

/**
 * The signed-in member's profile row.
 *
 * `null` data with no error means the row does not exist yet — a first-time
 * state the UI renders as "not set" rather than inventing values.
 */
export const getCurrentProfile = cache(async () => {
  const user = await getSessionUser();
  if (!user) return { data: null, error: null, userId: null as string | null };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { data, error, userId: user.id };
});

/** Updates the signed-in member's own profile. */
export async function updateCurrentProfile(patch: ProfilePatch) {
  const user = await getSessionUser();
  if (!user) return { data: null, error: { message: "Not signed in" } };

  const supabase = await createClient();

  return supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select()
    .maybeSingle();
}

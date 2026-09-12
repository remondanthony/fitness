import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database";

/** Server-only. See src/lib/data/README.md. */

/** The signed-in member's profile, or null if they have none yet. */
export async function getProfile(userId: string) {
  const supabase = await createClient();

  return supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
}

/** Updates the member's own profile. RLS rejects any other id. */
export async function updateProfile(userId: string, patch: TablesUpdate<"profiles">) {
  const supabase = await createClient();

  return supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select()
    .maybeSingle();
}

/**
 * Creates the profile row if the sign-up trigger did not (for example, for
 * accounts created before that migration ran).
 */
export async function ensureProfile(profile: TablesInsert<"profiles">) {
  const supabase = await createClient();

  return supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id", ignoreDuplicates: true })
    .select()
    .maybeSingle();
}

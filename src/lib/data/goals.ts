import { cache } from "react";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { GoalKey } from "@/types/database";

/** Server-only. Ownership comes from the session, never from the browser. */

export type GoalsPatch = {
  primary_goal: GoalKey;
  secondary_goal?: GoalKey | null;
  target_weight_kg?: number | null;
  target_date?: string | null;
};

/** The member's goal row, or null when they have not set one yet. */
export const getCurrentGoals = cache(async () => {
  const user = await getSessionUser();
  if (!user) return { data: null, error: null };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { data, error };
});

/**
 * Writes the member's goal. `user_goals.user_id` is unique, so this upserts on
 * that column rather than creating a second row for the same member.
 */
export async function upsertCurrentGoals(patch: GoalsPatch) {
  const user = await getSessionUser();
  if (!user) return { data: null, error: { message: "Not signed in" } };

  const supabase = await createClient();

  return supabase
    .from("user_goals")
    .upsert({ ...patch, user_id: user.id }, { onConflict: "user_id" })
    .select()
    .single();
}

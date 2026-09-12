import { cache } from "react";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentAccess, TrainingLocation, Units } from "@/types/database";

/** Server-only. Ownership comes from the session, never from the browser. */

export type PreferencesPatch = {
  units?: Units;
  equipment_access?: EquipmentAccess | null;
  preferred_training_days?: number | null;
  preferred_workout_duration?: number | null;
  preferred_training_location?: TrainingLocation | null;
  notifications_enabled?: boolean;
};

/** The member's preference row, or null before they have saved any. */
export const getCurrentPreferences = cache(async () => {
  const user = await getSessionUser();
  if (!user) return { data: null, error: null };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { data, error };
});

/** Writes preferences. `user_id` is unique, so this upserts on that column. */
export async function upsertCurrentPreferences(patch: PreferencesPatch) {
  const user = await getSessionUser();
  if (!user) return { data: null, error: { message: "Not signed in" } };

  const supabase = await createClient();

  return supabase
    .from("user_preferences")
    .upsert({ ...patch, user_id: user.id }, { onConflict: "user_id" })
    .select()
    .single();
}

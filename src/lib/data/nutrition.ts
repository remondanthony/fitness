import { cache } from "react";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/** Server-only. Ownership comes from the session, never from the browser. */

export type NutritionTotals = {
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
};

/** The member's nutrition totals for one day, or null if nothing is logged. */
export const getNutritionLog = cache(async (logDate: string) => {
  const user = await getSessionUser();
  if (!user) return { data: null, error: false };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nutrition_logs")
    .select("calories, protein_g, carbs_g, fat_g, log_date")
    .eq("user_id", user.id)
    .eq("log_date", logDate)
    .maybeSingle();

  return { data, error: Boolean(error) };
});

/**
 * Writes the day's totals.
 *
 * `(user_id, log_date)` is unique, so a repeated save — a double-click, a
 * refresh mid-request — updates the same row instead of adding another.
 */
export async function upsertNutritionLog(
  logDate: string,
  totals: NutritionTotals,
): Promise<{ error: string | null }> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in again." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("nutrition_logs")
    .upsert(
      { user_id: user.id, log_date: logDate, ...totals },
      { onConflict: "user_id,log_date" },
    );

  return { error: error ? "We couldn't save your nutrition log." : null };
}

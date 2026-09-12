import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database";

/** Server-only. See src/lib/data/README.md. */

/** The member's nutrition totals for a given day (ISO `YYYY-MM-DD`). */
export async function getNutritionLog(userId: string, logDate: string) {
  const supabase = await createClient();

  return supabase
    .from("nutrition_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", logDate)
    .maybeSingle();
}

/** Writes the day's nutrition totals; one row per member per day. */
export async function upsertNutritionLog(entry: TablesInsert<"nutrition_logs">) {
  const supabase = await createClient();

  return supabase
    .from("nutrition_logs")
    .upsert(entry, { onConflict: "user_id,log_date" })
    .select()
    .single();
}

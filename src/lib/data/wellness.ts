import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database";

/** Server-only. See src/lib/data/README.md. */

/** The member's wellness entry for a given day (ISO `YYYY-MM-DD`). */
export async function getWellnessLog(userId: string, logDate: string) {
  const supabase = await createClient();

  return supabase
    .from("wellness_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", logDate)
    .maybeSingle();
}

/**
 * Writes the day's wellness entry. One row per member per day is enforced by
 * the database, so this upserts on that pair.
 */
export async function upsertWellnessLog(entry: TablesInsert<"wellness_logs">) {
  const supabase = await createClient();

  return supabase
    .from("wellness_logs")
    .upsert(entry, { onConflict: "user_id,log_date" })
    .select()
    .single();
}

/** The member's active habits. */
export async function getActiveHabits(userId: string) {
  const supabase = await createClient();

  return supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: true });
}

/**
 * Marks a habit done for a date. The once-per-day constraint makes a repeat
 * press a no-op rather than a duplicate row.
 */
export async function completeHabit(entry: TablesInsert<"habit_completions">) {
  const supabase = await createClient();

  return supabase
    .from("habit_completions")
    .upsert(entry, { onConflict: "habit_id,completed_date", ignoreDuplicates: true })
    .select()
    .maybeSingle();
}

/** Removes a habit completion, for when a member un-ticks it. */
export async function uncompleteHabit(habitId: string, completedDate: string) {
  const supabase = await createClient();

  return supabase
    .from("habit_completions")
    .delete()
    .eq("habit_id", habitId)
    .eq("completed_date", completedDate);
}

import { cache } from "react";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { habits as defaultHabits } from "@/data/wellness";
import type { Tables } from "@/types/database";

/** Server-only. Ownership comes from the session, never from the browser. */

export type HabitWithState = {
  id: string;
  name: string;
  description: string | null;
  completed: boolean;
};

/**
 * The member's active habits for a day, each with whether it is ticked.
 *
 * On a member's first visit their habit rows are created from the product's
 * starter set, so the page has something real to track rather than a list
 * that cannot be saved. Seeding runs once: it is skipped as soon as any habit
 * row exists, so a member who deletes or edits them keeps their own list.
 */
export const getHabitsForDate = cache(async (logDate: string): Promise<{
  data: HabitWithState[];
  error: boolean;
}> => {
  const user = await getSessionUser();
  if (!user) return { data: [], error: false };

  const supabase = await createClient();

  const existing = await supabase
    .from("habits")
    .select("id, name, description, active")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (existing.error) return { data: [], error: true };

  let rows = existing.data;

  if (!rows || rows.length === 0) {
    const seeded = await seedStarterHabits(user.id);
    if (seeded.error) return { data: [], error: true };
    rows = seeded.rows;
  }

  const habitIds = rows.map((row) => row.id);
  if (habitIds.length === 0) return { data: [], error: false };

  const { data: completions, error: completionError } = await supabase
    .from("habit_completions")
    .select("habit_id")
    .eq("user_id", user.id)
    .eq("completed_date", logDate)
    .in("habit_id", habitIds);

  if (completionError) return { data: [], error: true };

  const done = new Set((completions ?? []).map((entry) => entry.habit_id));

  return {
    data: rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      completed: done.has(row.id),
    })),
    error: false,
  };
});

/** Creates the starter habits once, for a member who has none. */
async function seedStarterHabits(userId: string): Promise<{
  rows: Pick<Tables<"habits">, "id" | "name" | "description" | "active">[];
  error: boolean;
}> {
  const supabase = await createClient();

  const { error } = await supabase.from("habits").insert(
    defaultHabits.map((habit) => ({
      user_id: userId,
      name: habit.title,
      description: habit.detail,
      frequency: "daily" as const,
    })),
  );

  if (error) return { rows: [], error: true };

  // Read the list back rather than returning the rows this insert created: if
  // a second first-visit seeded at the same moment, both requests then render
  // the same list instead of each showing only its own half.
  const { data, error: readError } = await supabase
    .from("habits")
    .select("id, name, description, active")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (readError) return { rows: [], error: true };

  return { rows: data ?? [], error: false };
}

/**
 * Ticks a habit for a date.
 *
 * `(habit_id, completed_date)` is unique, so a repeated tick is a no-op
 * rather than a duplicate row. The database also verifies the habit belongs
 * to the caller, so a completion cannot reference someone else's habit.
 */
export async function completeHabit(
  habitId: string,
  logDate: string,
): Promise<{ error: string | null }> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in again." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("habit_completions")
    .upsert(
      { habit_id: habitId, user_id: user.id, completed_date: logDate },
      { onConflict: "habit_id,completed_date", ignoreDuplicates: true },
    );

  return { error: error ? "We couldn't save that habit." : null };
}

/** Unticks a habit for a date. */
export async function uncompleteHabit(
  habitId: string,
  logDate: string,
): Promise<{ error: string | null }> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in again." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("habit_completions")
    .delete()
    .eq("habit_id", habitId)
    .eq("user_id", user.id)
    .eq("completed_date", logDate);

  return { error: error ? "We couldn't update that habit." : null };
}

import { cache } from "react";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { emptyReadings, type DailyReadings } from "@/data/wellness";

/** Server-only. Ownership comes from the session, never from the browser. */

export type WellnessReadings = {
  sleep_hours: number | null;
  water_liters: number | null;
  steps: number | null;
  mindfulness_minutes: number | null;
  recovery_score: number | null;
};

/** The member's wellness readings for one day, or null if nothing is logged. */
export const getWellnessLog = cache(async (logDate: string) => {
  const user = await getSessionUser();
  if (!user) return { data: null, error: false };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wellness_logs")
    .select("sleep_hours, water_liters, steps, mindfulness_minutes, recovery_score, log_date")
    .eq("user_id", user.id)
    .eq("log_date", logDate)
    .maybeSingle();

  return { data, error: Boolean(error) };
});

/** Writes the day's readings; `(user_id, log_date)` is unique. */
export async function upsertWellnessLog(
  logDate: string,
  readings: WellnessReadings,
): Promise<{ error: string | null }> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in again." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("wellness_logs")
    .upsert(
      { user_id: user.id, log_date: logDate, ...readings },
      { onConflict: "user_id,log_date" },
    );

  return { error: error ? "We couldn't save your wellness log." : null };
}

/**
 * Converts a stored row into the shape the metric tiles read.
 *
 * A missing row and a row with blank columns mean the same thing to the UI —
 * nothing logged — so both collapse to nulls here rather than to zeros, which
 * would claim the member slept for no hours and took no steps.
 */
export function readingsFromLog(
  log: {
    sleep_hours: number | null;
    water_liters: number | null;
    steps: number | null;
    mindfulness_minutes: number | null;
    recovery_score: number | null;
  } | null,
): DailyReadings {
  if (!log) return emptyReadings;

  return {
    sleepHours: log.sleep_hours,
    waterLiters: log.water_liters,
    steps: log.steps,
    mindfulnessMinutes: log.mindfulness_minutes,
    recoveryScore: log.recovery_score,
  };
}

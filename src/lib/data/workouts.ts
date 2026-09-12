import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database";

/** Server-only. See src/lib/data/README.md. */

/** A member's most recent sessions, newest first. */
export async function getRecentSessions(userId: string, limit = 10) {
  const supabase = await createClient();

  return supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(limit);
}

/** Opens a session when a member starts a workout. */
export async function startSession(session: TablesInsert<"workout_sessions">) {
  const supabase = await createClient();

  return supabase.from("workout_sessions").insert(session).select().single();
}

/**
 * Records one set. The (session, exercise, set_number) uniqueness constraint
 * means a retry updates the existing row rather than duplicating it.
 */
export async function logSet(entry: TablesInsert<"exercise_logs">) {
  const supabase = await createClient();

  return supabase
    .from("exercise_logs")
    .upsert(entry, { onConflict: "session_id,exercise_slug,set_number" })
    .select()
    .single();
}

/** Closes a session with its duration and total volume. */
export async function completeSession(
  sessionId: string,
  totals: { durationSeconds: number; totalVolume: number },
) {
  const supabase = await createClient();

  return supabase
    .from("workout_sessions")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      duration_seconds: totals.durationSeconds,
      total_volume: totals.totalVolume,
    })
    .eq("id", sessionId)
    .select()
    .single();
}

/** Every set logged in a session, in the order it was performed. */
export async function getSessionLogs(sessionId: string) {
  const supabase = await createClient();

  return supabase
    .from("exercise_logs")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
}

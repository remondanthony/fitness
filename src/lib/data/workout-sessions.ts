import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getWorkout } from "@/data/workouts";
import type { Tables } from "@/types/database";

/**
 * Server-only workout session access.
 *
 * The catalogue stays in TypeScript — these tables record what a member
 * actually did. Ownership always comes from the session; a user id is never
 * taken from the browser, and RLS enforces the same rule in the database.
 */

export type SessionLogRow = Pick<
  Tables<"exercise_logs">,
  "exercise_slug" | "set_number" | "weight" | "reps"
>;

export type RemoteSession = {
  id: string;
  startedAt: string;
  completedAt: string | null;
  completed: boolean;
  logs: SessionLogRow[];
};

/**
 * The member's most recent unfinished session for this workout, with the sets
 * already recorded. This is what makes a refresh recoverable.
 */
export async function getOpenSession(workoutSlug: string): Promise<{
  data: RemoteSession | null;
  error: boolean;
}> {
  const user = await getSessionUser();
  if (!user) return { data: null, error: false };

  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .select("id, started_at, completed_at, completed")
    .eq("user_id", user.id)
    .eq("workout_slug", workoutSlug)
    .eq("completed", false)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { data: null, error: true };
  if (!session) return { data: null, error: false };

  const { data: logs, error: logsError } = await supabase
    .from("exercise_logs")
    .select("exercise_slug, set_number, weight, reps")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  if (logsError) return { data: null, error: true };

  return {
    data: {
      id: session.id,
      startedAt: session.started_at,
      completedAt: session.completed_at,
      completed: session.completed,
      logs: logs ?? [],
    },
    error: false,
  };
}

/**
 * Returns the member's open session for this workout, creating one if there
 * is none.
 *
 * Idempotent by design: a second call — a double-clicked Start, a refresh
 * mid-initialisation, React's development double-invoke — finds the existing
 * open row and reuses it rather than opening a second one.
 */
export async function startOrResumeSession(workoutSlug: string): Promise<{
  data: RemoteSession | null;
  error: string | null;
}> {
  const user = await getSessionUser();
  if (!user) return { data: null, error: "Please sign in again." };

  const workout = getWorkout(workoutSlug);
  if (!workout) return { data: null, error: "That workout doesn't exist." };

  const existing = await getOpenSession(workoutSlug);
  if (existing.error) return { data: null, error: "We couldn't load your session." };
  if (existing.data) return { data: existing.data, error: null };

  const supabase = await createClient();

  const { data: created, error: insertError } = await supabase
    .from("workout_sessions")
    .insert({ user_id: user.id, workout_slug: workoutSlug, completed: false })
    .select("id, started_at, completed_at, completed")
    .single();

  if (insertError || !created) {
    return { data: null, error: "We couldn't start this workout." };
  }

  // Record the planned movements and their order for this session.
  const { error: exercisesError } = await supabase
    .from("workout_session_exercises")
    .insert(
      workout.exercises.map((exercise, index) => ({
        session_id: created.id,
        user_id: user.id,
        exercise_slug: exercise.exerciseSlug ?? exercise.id,
        exercise_order: index,
      })),
    );

  // A failure here is not fatal — the session and its set logs still stand —
  // but it must not be silent.
  if (exercisesError) {
    console.error("workout_session_exercises insert failed", exercisesError.message);
  }

  return {
    data: {
      id: created.id,
      startedAt: created.started_at,
      completedAt: created.completed_at,
      completed: created.completed,
      logs: [],
    },
    error: null,
  };
}

/**
 * Records one set.
 *
 * `(session_id, exercise_slug, set_number)` is unique, so a repeated
 * submission updates that set instead of adding a duplicate row.
 */
export async function upsertSetLog(input: {
  sessionId: string;
  exerciseSlug: string;
  setNumber: number;
  weight: number;
  reps: number;
}): Promise<{ error: string | null }> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in again." };

  const supabase = await createClient();

  const { error } = await supabase.from("exercise_logs").upsert(
    {
      session_id: input.sessionId,
      user_id: user.id,
      exercise_slug: input.exerciseSlug,
      set_number: input.setNumber,
      weight: input.weight,
      reps: input.reps,
      completed: true,
    },
    { onConflict: "session_id,exercise_slug,set_number" },
  );

  return { error: error ? "We couldn't save that set." : null };
}

/**
 * Closes a session. Scoped to `completed = false` so revisiting the
 * completion screen cannot rewrite an already-finished session.
 */
export async function completeSession(input: {
  sessionId: string;
  durationSeconds: number;
  totalVolume: number;
}): Promise<{ error: string | null }> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in again." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_sessions")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      duration_seconds: input.durationSeconds,
      total_volume: input.totalVolume,
    })
    .eq("id", input.sessionId)
    .eq("user_id", user.id)
    .eq("completed", false);

  return { error: error ? "We couldn't save your workout." : null };
}

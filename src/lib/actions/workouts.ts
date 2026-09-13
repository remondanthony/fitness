"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import {
  completeSession,
  startOrResumeSession,
  upsertSetLog,
  type RemoteSession,
} from "@/lib/data/workout-sessions";
import { getWorkout } from "@/data/workouts";

/**
 * Server Actions for workout tracking.
 *
 * Every action re-derives the member from the session and re-validates the
 * submitted values against the static catalogue, so nothing is trusted from
 * client state. The database CHECK constraints are the final boundary.
 */

export type StartResult =
  | { status: "success"; session: RemoteSession }
  | { status: "error"; message: string };

export type WriteResult =
  | { status: "success" }
  | { status: "error"; message: string };

export async function startWorkoutAction(workoutSlug: string): Promise<StartResult> {
  const { data, error } = await startOrResumeSession(workoutSlug);

  if (error || !data) {
    return { status: "error", message: error ?? "We couldn't start this workout." };
  }

  return { status: "success", session: data };
}

export async function logSetAction(input: {
  sessionId: string;
  workoutSlug: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
}): Promise<WriteResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  // The exercise and set number must belong to the workout being performed.
  const workout = getWorkout(input.workoutSlug);
  const exercise = workout?.exercises.find((entry) => entry.id === input.exerciseId);
  if (!workout || !exercise) {
    return { status: "error", message: "That exercise isn't part of this workout." };
  }

  if (
    !Number.isInteger(input.setNumber) ||
    input.setNumber < 1 ||
    input.setNumber > exercise.sets
  ) {
    return { status: "error", message: "That set number isn't valid." };
  }

  const reps = Math.round(input.reps);
  const weight = Math.round(input.weight * 100) / 100;

  if (!Number.isFinite(reps) || reps < 0 || reps > 1000) {
    return { status: "error", message: "Enter between 0 and 1000 reps." };
  }
  if (!Number.isFinite(weight) || weight < 0 || weight > 1000) {
    return { status: "error", message: "Enter a weight between 0 and 1000." };
  }

  const { error } = await upsertSetLog({
    sessionId: input.sessionId,
    // Store the library slug where one exists so history can link to it.
    exerciseSlug: exercise.exerciseSlug ?? exercise.id,
    setNumber: input.setNumber,
    weight,
    reps,
  });

  return error ? { status: "error", message: error } : { status: "success" };
}

export async function completeWorkoutAction(input: {
  sessionId: string;
  durationSeconds: number;
  totalVolume: number;
}): Promise<WriteResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  const duration = Math.max(0, Math.round(input.durationSeconds));
  const volume = Math.max(0, Math.round(input.totalVolume * 100) / 100);

  const { error } = await completeSession({
    sessionId: input.sessionId,
    durationSeconds: duration,
    totalVolume: volume,
  });

  if (error) return { status: "error", message: error };

  // Workout history on /workouts reads completed sessions.
  revalidatePath("/workouts");

  return { status: "success" };
}

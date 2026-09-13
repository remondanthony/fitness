"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import { currentLogDate } from "@/lib/data/daily-date";
import { upsertNutritionLog } from "@/lib/data/nutrition";
import { upsertWellnessLog } from "@/lib/data/wellness";
import { completeHabit, uncompleteHabit } from "@/lib/data/habits";

/**
 * Server Actions for the day-scoped logs.
 *
 * Each one re-derives the member from the session and takes the log date from
 * the server clock, never from the request, then range-checks every number
 * before it reaches the database — so nothing is trusted from client state.
 */

export type SaveResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

/** Parses an optional numeric field, rejecting anything out of range. */
function num(
  value: string,
  { max, integer = false }: { max: number; integer?: boolean },
): number | null | "invalid" {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > max) return "invalid";

  return integer ? Math.round(parsed) : Math.round(parsed * 100) / 100;
}

export async function saveNutritionAction(input: {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}): Promise<SaveResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  const logDate = currentLogDate();

  const calories = num(input.calories, { max: 20000, integer: true });
  const protein = num(input.protein, { max: 2000 });
  const carbs = num(input.carbs, { max: 2000 });
  const fat = num(input.fat, { max: 2000 });

  if (calories === "invalid") {
    return { status: "error", message: "Enter calories between 0 and 20,000." };
  }
  if (protein === "invalid" || carbs === "invalid" || fat === "invalid") {
    return { status: "error", message: "Enter macros between 0 and 2,000 g." };
  }

  const { error } = await upsertNutritionLog(logDate, {
    calories,
    protein_g: protein,
    carbs_g: carbs,
    fat_g: fat,
  });

  if (error) return { status: "error", message: error };

  revalidatePath("/nutrition");
  return { status: "success", message: "Nutrition logged" };
}

export async function saveWellnessAction(input: {
  sleepHours: string;
  waterLiters: string;
  steps: string;
  mindfulnessMinutes: string;
  recoveryScore: string;
}): Promise<SaveResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  const logDate = currentLogDate();

  const sleep = num(input.sleepHours, { max: 24 });
  const water = num(input.waterLiters, { max: 30 });
  const steps = num(input.steps, { max: 200000, integer: true });
  const mindfulness = num(input.mindfulnessMinutes, { max: 1440, integer: true });
  const recovery = num(input.recoveryScore, { max: 100, integer: true });

  if (sleep === "invalid") {
    return { status: "error", message: "Enter sleep between 0 and 24 hours." };
  }
  if (water === "invalid") {
    return { status: "error", message: "Enter water between 0 and 30 litres." };
  }
  if (steps === "invalid") {
    return { status: "error", message: "Enter a step count between 0 and 200,000." };
  }
  if (mindfulness === "invalid") {
    return { status: "error", message: "Enter mindfulness between 0 and 1,440 minutes." };
  }
  if (recovery === "invalid") {
    return { status: "error", message: "Recovery is a score from 0 to 100." };
  }

  const { error } = await upsertWellnessLog(logDate, {
    sleep_hours: sleep,
    water_liters: water,
    steps,
    mindfulness_minutes: mindfulness,
    recovery_score: recovery,
  });

  if (error) return { status: "error", message: error };

  revalidatePath("/wellness");
  revalidatePath("/dashboard");
  return { status: "success", message: "Wellness logged" };
}

/** Ticks or unticks one habit for a date. */
export async function toggleHabitAction(input: {
  habitId: string;
  completed: boolean;
}): Promise<SaveResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  const logDate = currentLogDate();

  if (typeof input.habitId !== "string" || input.habitId.length === 0) {
    return { status: "error", message: "That habit isn't valid." };
  }

  // Ownership of the habit is enforced by RLS on both paths.
  const { error } = input.completed
    ? await completeHabit(input.habitId, logDate)
    : await uncompleteHabit(input.habitId, logDate);

  if (error) return { status: "error", message: error };

  // The list holds the tick optimistically; this keeps the server's own copy
  // of the page in step for the next navigation back to it.
  revalidatePath("/wellness");
  return { status: "success", message: input.completed ? "Habit ticked" : "Habit cleared" };
}

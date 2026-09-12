"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import { friendlyAuthMessage } from "@/lib/auth/errors";
import { updateCurrentProfile } from "@/lib/data/profiles";
import { upsertCurrentGoals } from "@/lib/data/goals";
import { upsertCurrentPreferences } from "@/lib/data/preferences";
import { createClient } from "@/lib/supabase/server";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import type {
  EquipmentAccess,
  ExperienceLevel,
  GoalKey,
  Units,
} from "@/types/database";

/**
 * Server Actions for account data.
 *
 * Same pattern as the auth actions: run on the server, take ownership from the
 * session rather than the submitted form, and return a plain serialisable
 * result. None of these redirect, so there is no interaction with Next's
 * redirect-throwing behaviour.
 */

export type SaveResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const GOALS: readonly GoalKey[] = [
  "build-muscle",
  "lose-fat",
  "get-stronger",
  "improve-fitness",
  "improve-wellness",
  "live-healthier",
];
const LEVELS: readonly ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
const EQUIPMENT: readonly EquipmentAccess[] = [
  "no-equipment",
  "dumbbells",
  "home-gym",
  "full-gym",
];
const UNITS: readonly Units[] = ["metric", "imperial"];

/** Rejects anything outside the set the database CHECK constraint allows. */
function pick<T extends string>(allowed: readonly T[], value: string): T | null {
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

const GENERIC_SAVE_ERROR = "We couldn't save that. Please try again.";

/** Display name, and optionally a new password. */
export async function updateAccountAction(input: {
  displayName: string;
  newPassword?: string;
}): Promise<SaveResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  const displayName = input.displayName.trim();
  if (displayName.length < 2) {
    return { status: "error", message: "Enter a name of at least 2 characters." };
  }
  if (displayName.length > 80) {
    return { status: "error", message: "That name is too long (80 characters max)." };
  }

  const password = input.newPassword?.trim() ?? "";
  if (password && password.length < MIN_PASSWORD_LENGTH) {
    return {
      status: "error",
      message: `Use at least ${MIN_PASSWORD_LENGTH} characters for a new password.`,
    };
  }

  const { error } = await updateCurrentProfile({ display_name: displayName });
  if (error) return { status: "error", message: GENERIC_SAVE_ERROR };

  if (password) {
    const supabase = await createClient();
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) {
      return { status: "error", message: friendlyAuthMessage(passwordError) };
    }
  }

  // The name is rendered by the profile page, dashboard greeting and navbar.
  revalidatePath("/", "layout");

  return {
    status: "success",
    message: password ? "Account and password updated" : "Account updated",
  };
}

/** Training preferences: spread across profiles, user_goals and user_preferences. */
export async function updatePreferencesAction(input: {
  goal: string;
  level: string;
  equipment: string;
  trainingDays: string;
  units: string;
}): Promise<SaveResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  const goal = pick(GOALS, input.goal);
  const level = pick(LEVELS, input.level);
  const equipment = pick(EQUIPMENT, input.equipment);
  const units = pick(UNITS, input.units);
  const trainingDays = Number.parseInt(input.trainingDays, 10);

  if (!goal || !level || !equipment || !units) {
    return { status: "error", message: "Those options aren't recognised." };
  }
  if (!Number.isInteger(trainingDays) || trainingDays < 1 || trainingDays > 7) {
    return { status: "error", message: "Choose between 1 and 7 training days." };
  }

  // Experience level belongs to the profile; the goal and the rest are their
  // own rows. Each is keyed to the session user by the helper.
  const profile = await updateCurrentProfile({ experience_level: level });
  if (profile.error) return { status: "error", message: GENERIC_SAVE_ERROR };

  const goals = await upsertCurrentGoals({ primary_goal: goal });
  if (goals.error) return { status: "error", message: GENERIC_SAVE_ERROR };

  const preferences = await upsertCurrentPreferences({
    units,
    equipment_access: equipment,
    preferred_training_days: trainingDays,
  });
  if (preferences.error) return { status: "error", message: GENERIC_SAVE_ERROR };

  revalidatePath("/", "layout");

  return { status: "success", message: "Preferences updated" };
}

"use server";

import { getSessionUser } from "@/lib/auth/session";
import { updatePreferencesAction, type SaveResult } from "@/lib/actions/account";
import { getPersonalization } from "@/lib/data/personalization";
import {
  equipmentOptions,
  goalOptions,
  levelOptions,
  parseTrainingDays,
  pickOption,
  unitOptions,
  type PersonalizationAnswers,
} from "@/lib/personalization";

/**
 * Completing onboarding.
 *
 * The five answers already have a persistence path — `updatePreferencesAction`
 * writes exactly these fields across `profiles`, `user_goals` and
 * `user_preferences`, upserting on the unique `user_id` so a repeat submission
 * updates the same rows instead of adding more. Onboarding reuses it rather
 * than growing a second way to save the same data, which is also what keeps
 * settings and onboarding from becoming two sources of truth.
 *
 * What this adds on top is a completeness gate and a read-back: onboarding
 * must not report success unless every required answer is genuinely on record.
 */

export async function completeOnboardingAction(
  input: PersonalizationAnswers,
): Promise<SaveResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  // Re-validate server-side. The step UI blocks an empty answer, but the
  // action cannot assume the request came from that UI.
  const goal = pickOption(goalOptions, input.goal);
  const level = pickOption(levelOptions, input.level);
  const equipment = pickOption(equipmentOptions, input.equipment);
  const units = pickOption(unitOptions, input.units);
  const trainingDays = parseTrainingDays(input.trainingDays);

  if (!goal || !level || !equipment || !units || trainingDays === null) {
    return {
      status: "error",
      message: "Some answers are missing. Go back and complete every step.",
    };
  }

  const saved = await updatePreferencesAction({
    goal,
    level,
    equipment,
    units,
    trainingDays: String(trainingDays),
  });

  if (saved.status === "error") return saved;

  // Read the answers back before calling onboarding done. Without this the UI
  // would navigate on the strength of a write it never confirmed, and a member
  // could land on a dashboard that immediately sends them back here.
  const view = await getPersonalization();

  if (!view || view.loadError) {
    return {
      status: "error",
      message: "We saved your answers but couldn't confirm them. Please try again.",
    };
  }

  if (!view.complete) {
    return {
      status: "error",
      message: "Something didn't save. Please try again.",
    };
  }

  return { status: "success", message: "You're all set" };
}

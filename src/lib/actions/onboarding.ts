"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import type { SaveResult } from "@/lib/actions/account";
import { getPersonalization, savePersonalization } from "@/lib/data/personalization";
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
 * This is the one place personalization is established. `savePersonalization`
 * does the writing — the same path settings uses — upserting on the unique
 * `user_id` so a repeat submission updates the same rows instead of adding
 * more. Sharing that write is what keeps the two surfaces from becoming two
 * sources of truth.
 *
 * Unlike settings, this action does not require onboarding to be complete
 * already; completing it is the point. What it adds instead is a read-back:
 * it must not report success unless every required answer is on record.
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

  const saved = await savePersonalization({
    goal,
    level,
    equipment,
    units,
    trainingDays: String(trainingDays),
  });

  if (saved.error) return { status: "error", message: saved.error };

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

  // The name, goal and training summary appear in the navbar, dashboard and
  // profile, so the whole tree is revalidated once the answers are confirmed.
  revalidatePath("/", "layout");

  return { status: "success", message: "You're all set" };
}

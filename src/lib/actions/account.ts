"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import { friendlyAuthMessage } from "@/lib/auth/errors";
import { updateCurrentProfile } from "@/lib/data/profiles";
import { getPersonalization, savePersonalization } from "@/lib/data/personalization";
import { createClient } from "@/lib/supabase/server";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";

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

  const profile = await updateCurrentProfile({ display_name: displayName });
  if (profile.error || !profile.data) {
    return { status: "error", message: GENERIC_SAVE_ERROR };
  }

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

/**
 * Training preferences: spread across profiles, user_goals and user_preferences.
 *
 * Settings edits personalization; it does not establish it. A member who has
 * not finished onboarding is turned away here rather than having the form's
 * display values written as though they were answers — the selects have to
 * show something, and "shown" must never become "chosen".
 *
 * The check runs on the server against the same completion rule onboarding
 * uses, so it holds regardless of what the browser submits.
 */
export async function updatePreferencesAction(input: {
  goal: string;
  level: string;
  equipment: string;
  trainingDays: string;
  units: string;
}): Promise<SaveResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  const current = await getPersonalization();

  if (!current) return { status: "error", message: "Please sign in again." };

  // Unverified is not the same as complete. Saving on a failed read is exactly
  // the case where the form may be showing values nobody chose.
  if (current.loadError) {
    return {
      status: "error",
      message: "We couldn't check your saved preferences. Please try again.",
    };
  }

  if (!current.complete) {
    return {
      status: "error",
      message:
        "Finish setting up your training first — head to onboarding, then these settings are yours to edit.",
    };
  }

  const { error } = await savePersonalization(input);
  if (error) return { status: "error", message: error };

  revalidatePath("/", "layout");

  return { status: "success", message: "Preferences updated" };
}

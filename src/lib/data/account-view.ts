import { getCurrentGoals } from "@/lib/data/goals";
import { getCurrentPreferences } from "@/lib/data/preferences";
import { getCurrentProfile } from "@/lib/data/profiles";
import type { PreferenceValues } from "@/components/settings/PreferencesSettings";

/**
 * Server-only. Assembles the account view every profile surface needs, so a
 * page makes one call instead of three and the empty-state rules live in one
 * place.
 *
 * Rows are absent until a member saves for the first time. Nothing is
 * invented to fill the gap — callers render "Not set".
 */

/** Defaults used to seed the settings selects before anything is saved. */
const FALLBACK: PreferenceValues = {
  goal: "build-muscle",
  level: "intermediate",
  equipment: "full-gym",
  trainingDays: "4",
  units: "metric",
};

export type AccountView = {
  /** Best available name: saved profile name, else the email's local part. */
  displayName: string;
  email: string;
  /** True when the member has never saved a name. */
  usingFallbackName: boolean;
  /** Pre-formatted values for the profile page, or null when unset. */
  goalLabel: string | null;
  levelLabel: string | null;
  equipmentLabel: string | null;
  frequencyLabel: string | null;
  memberSince: string | null;
  /** Seed values for the settings form. */
  preferences: PreferenceValues;
  /** Set when a query failed, so the UI can say so instead of showing blanks. */
  loadError: boolean;
};

const label = (options: { value: string; label: string }[], value?: string | null) =>
  options.find((o) => o.value === value)?.label ?? null;

export async function getAccountView(): Promise<AccountView | null> {
  const [{ data: profile, error: profileError, userId }, goals, preferences] =
    await Promise.all([getCurrentProfile(), getCurrentGoals(), getCurrentPreferences()]);

  if (!userId) return null;

  const { goalOptions, levelOptions, equipmentOptions, frequencyOptions } = await import(
    "@/data/profile"
  );

  const { getSessionUser } = await import("@/lib/auth/session");
  const user = await getSessionUser();
  const email = user?.email ?? "";

  const savedName = profile?.display_name?.trim() ?? "";
  const metadataName = user?.displayName ?? "";
  const displayName = savedName || metadataName || email.split("@")[0] || "Your profile";

  const trainingDays = preferences.data?.preferred_training_days ?? null;

  return {
    displayName,
    email,
    usingFallbackName: !savedName && !metadataName,
    goalLabel: label(goalOptions, goals.data?.primary_goal),
    levelLabel: label(levelOptions, profile?.experience_level),
    equipmentLabel: label(equipmentOptions, preferences.data?.equipment_access),
    frequencyLabel: label(
      frequencyOptions,
      trainingDays === null ? undefined : String(trainingDays),
    ),
    memberSince: profile?.created_at ?? null,
    preferences: {
      goal: goals.data?.primary_goal ?? FALLBACK.goal,
      level: profile?.experience_level ?? FALLBACK.level,
      equipment: preferences.data?.equipment_access ?? FALLBACK.equipment,
      trainingDays: trainingDays === null ? FALLBACK.trainingDays : String(trainingDays),
      units: preferences.data?.units ?? FALLBACK.units,
    },
    loadError: Boolean(profileError || goals.error || preferences.error),
  };
}

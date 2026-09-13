import { getCurrentGoals } from "@/lib/data/goals";
import { getCurrentPreferences } from "@/lib/data/preferences";
import { getCurrentProfile } from "@/lib/data/profiles";
import { getPersonalization } from "@/lib/data/personalization";
import { getAvatarSignedUrl } from "@/lib/data/avatars";
import { toAnswers, type RequiredField } from "@/lib/personalization";
import type { PreferenceValues } from "@/components/settings/PreferencesSettings";

/**
 * Server-only. Assembles the account view every profile surface needs, so a
 * page makes one call instead of three and the empty-state rules live in one
 * place.
 *
 * Rows are absent until a member saves for the first time. Nothing is invented
 * to fill the gap — an unanswered preference comes back as an empty string and
 * the settings form shows it as "Not set". Seeding those selects with
 * plausible defaults used to mean a member could press Save and have values
 * they never chose written as real answers.
 */

export type AccountView = {
  /** Best available name: saved profile name, else the email's local part. */
  displayName: string;
  email: string;
  /** True when the member has never saved a name. */
  usingFallbackName: boolean;
  /**
   * Short-lived link to the member's profile picture, or null when they have
   * none — or when the stored reference no longer resolves to a file, which
   * renders as the default avatar rather than as a broken image.
   */
  avatarUrl: string | null;
  /** Pre-formatted values for the profile page, or null when unset. */
  goalLabel: string | null;
  levelLabel: string | null;
  equipmentLabel: string | null;
  frequencyLabel: string | null;
  memberSince: string | null;
  /**
   * Values for the settings form. An empty string means the member has not
   * answered that question — it is not a default standing in for one.
   */
  preferences: PreferenceValues;
  /** True once every required personalization answer is on record. */
  personalizationComplete: boolean;
  /** Which required answers are still missing. */
  personalizationMissing: RequiredField[];
  /** Set when a query failed, so the UI can say so instead of showing blanks. */
  loadError: boolean;
};

const label = (
  options: readonly { value: string; label: string }[],
  value?: string | null,
) =>
  options.find((o) => o.value === value)?.label ?? null;

export async function getAccountView(): Promise<AccountView | null> {
  // Every one of these reads the same three cached queries, so asking for the
  // personalization view alongside costs nothing extra.
  const [{ data: profile, error: profileError, userId }, goals, preferences, personalization] =
    await Promise.all([
      getCurrentProfile(),
      getCurrentGoals(),
      getCurrentPreferences(),
      getPersonalization(),
    ]);

  if (!userId || !personalization) return null;

  const { goalOptions, levelOptions, equipmentOptions, frequencyOptions } = await import(
    "@/data/profile"
  );

  const { getSessionUser } = await import("@/lib/auth/session");
  const user = await getSessionUser();
  const email = user?.email ?? "";

  const avatarUrl = await getAvatarSignedUrl(profile?.avatar_url);

  const savedName = profile?.display_name?.trim() ?? "";
  const metadataName = user?.displayName ?? "";
  const displayName = savedName || metadataName || email.split("@")[0] || "Your profile";

  const trainingDays = preferences.data?.preferred_training_days ?? null;

  return {
    displayName,
    email,
    usingFallbackName: !savedName && !metadataName,
    avatarUrl,
    goalLabel: label(goalOptions, goals.data?.primary_goal),
    levelLabel: label(levelOptions, profile?.experience_level),
    equipmentLabel: label(equipmentOptions, preferences.data?.equipment_access),
    frequencyLabel: label(
      frequencyOptions,
      trainingDays === null ? undefined : String(trainingDays),
    ),
    memberSince: profile?.created_at ?? null,
    preferences: toAnswers(personalization.state),
    personalizationComplete: personalization.complete,
    personalizationMissing: personalization.missing,
    loadError: Boolean(profileError || goals.error || preferences.error),
  };
}

import { getCurrentGoals, upsertCurrentGoals } from "@/lib/data/goals";
import { getCurrentPreferences, upsertCurrentPreferences } from "@/lib/data/preferences";
import { getCurrentProfile, updateCurrentProfile } from "@/lib/data/profiles";
import {
  equipmentOptions,
  goalOptions,
  isPersonalizationComplete,
  levelOptions,
  missingPersonalization,
  parseTrainingDays,
  pickOption,
  unitOptions,
  type PersonalizationAnswers,
  type PersonalizationState,
  type RequiredField,
} from "@/lib/personalization";

/**
 * Server-only. The member's personalization answers, gathered from the three
 * tables that hold them.
 *
 * Each underlying helper is wrapped in React `cache`, so a page that also
 * calls `getAccountView()` in the same render reuses those queries rather than
 * issuing its own. Ownership comes from the session inside each helper; no
 * user id is accepted here.
 */

export type PersonalizationView = {
  state: PersonalizationState;
  /** True once every required answer is on record. */
  complete: boolean;
  /** Which required answers are still missing. */
  missing: RequiredField[];
  /**
   * A query failed. Callers must not treat this as "incomplete" — sending a
   * member back through onboarding because the database was briefly unhappy
   * would be worse than showing them an error.
   */
  loadError: boolean;
};

export async function getPersonalization(): Promise<PersonalizationView | null> {
  const [profile, goals, preferences] = await Promise.all([
    getCurrentProfile(),
    getCurrentGoals(),
    getCurrentPreferences(),
  ]);

  if (!profile.userId) return null;

  const state: PersonalizationState = {
    goal: goals.data?.primary_goal ?? null,
    level: profile.data?.experience_level ?? null,
    equipment: preferences.data?.equipment_access ?? null,
    trainingDays: preferences.data?.preferred_training_days ?? null,
    units: preferences.data?.units ?? null,
  };

  return {
    state,
    complete: isPersonalizationComplete(state),
    missing: missingPersonalization(state),
    loadError: Boolean(profile.error || goals.error || preferences.error),
  };
}

/**
 * Whether a member should be sent to onboarding.
 *
 * Only a confident "no, they have not answered" sends anyone anywhere. A
 * signed-out visitor is the auth layer's business, and a failed read is
 * treated as "leave them alone" so a transient database error cannot bounce a
 * fully set-up member back into onboarding.
 */
export async function needsOnboarding(): Promise<boolean> {
  const view = await getPersonalization();
  if (!view || view.loadError) return false;

  return !view.complete;
}

/**
 * Writes all five personalization answers.
 *
 * The single write path, shared by onboarding and by settings. Keeping it here
 * rather than in either action is what lets the two entry points differ in
 * their rules — settings refuses to establish answers a member never gave —
 * without either one growing its own copy of the writes or the validation.
 *
 * Every value is re-checked against the contract first, so nothing reaches the
 * database that its CHECK constraints would reject. Ownership comes from the
 * session inside each helper; no user id is accepted from the caller.
 */
export async function savePersonalization(
  input: PersonalizationAnswers,
): Promise<{ error: string | null }> {
  const goal = pickOption(goalOptions, input.goal);
  const level = pickOption(levelOptions, input.level);
  const equipment = pickOption(equipmentOptions, input.equipment);
  const units = pickOption(unitOptions, input.units);
  const trainingDays = parseTrainingDays(input.trainingDays);

  if (!goal || !level || !equipment || !units || trainingDays === null) {
    return { error: "Those options aren't recognised." };
  }

  const GENERIC = "We couldn't save that. Please try again.";

  // A profile UPDATE that matches no row comes back as { data: null, error:
  // null }, so the returned row — not just the absent error — is what proves
  // the write landed.
  const profile = await updateCurrentProfile({ experience_level: level });
  if (profile.error || !profile.data) return { error: GENERIC };

  const goals = await upsertCurrentGoals({ primary_goal: goal });
  if (goals.error) return { error: GENERIC };

  const preferences = await upsertCurrentPreferences({
    units,
    equipment_access: equipment,
    preferred_training_days: trainingDays,
  });
  if (preferences.error) return { error: GENERIC };

  return { error: null };
}

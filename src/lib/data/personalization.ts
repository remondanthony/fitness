import { getCurrentGoals } from "@/lib/data/goals";
import { getCurrentPreferences } from "@/lib/data/preferences";
import { getCurrentProfile } from "@/lib/data/profiles";
import {
  isPersonalizationComplete,
  missingPersonalization,
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

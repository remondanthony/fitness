import { cache } from "react";

import { programs } from "@/data/programs";
import { workouts } from "@/data/workouts";
import { getPersonalization } from "@/lib/data/personalization";
import { getCompletedSessions } from "@/lib/data/workout-sessions";
import {
  hasUsableSignals,
  rankPrograms,
  rankWorkouts,
  NO_SIGNALS,
  type MemberSignals,
  type Scored,
} from "@/lib/recommendations/engine";
import { RECENT_SESSION_WINDOW } from "@/lib/recommendations/rules";
import type { Program } from "@/data/programs";
import type { Workout } from "@/data/workouts";

/**
 * Server-only. Gathers what the recommendation engine needs and runs it.
 *
 * This is the only place the engine meets the database. The engine itself
 * stays pure, the UI receives a finished list, and neither contains a scoring
 * rule. Ownership comes from the session inside `getPersonalization` and
 * `getCompletedSessions`; no user id is accepted here, so there is no
 * parameter a browser could set to read somebody else's recommendations.
 *
 * The catalogue is static TypeScript in src/data, so ranking costs no queries
 * at all — the two reads below are the member's own saved answers (already
 * cached, and shared with the dashboard's other calls) and their recent
 * sessions.
 */

export type Recommendations = {
  programs: Scored<Program>[];
  workouts: Scored<Workout>[];
  signals: MemberSignals;
  /**
   * False when the member has answered nothing yet. The list is still ranked
   * and still useful, but the UI should not call it personalized.
   */
  personalized: boolean;
  /** A read failed. Callers should say so rather than present a ranking as
   *  tailored when the inputs never arrived. */
  loadError: boolean;
};

export const getRecommendations = cache(async (): Promise<Recommendations | null> => {
  const [personalization, history] = await Promise.all([
    getPersonalization(),
    getCompletedSessions(RECENT_SESSION_WINDOW),
  ]);

  if (!personalization) return null;

  // A failed read is not the same as an unset preference. Fall back to no
  // signals so nothing is invented, and let the caller explain itself.
  const loadError = personalization.loadError || history.error;

  const signals: MemberSignals = loadError
    ? NO_SIGNALS
    : {
        goal: personalization.state.goal,
        level: personalization.state.level,
        equipment: personalization.state.equipment,
        trainingDays: personalization.state.trainingDays,
        recentWorkoutSlugs: history.data.map((session) => session.workoutSlug),
      };

  return {
    programs: rankPrograms(programs, signals),
    workouts: rankWorkouts(workouts, signals),
    signals,
    personalized: !loadError && hasUsableSignals(signals),
    loadError,
  };
});

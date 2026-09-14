import type { Program } from "@/data/programs";
import type { Workout } from "@/data/workouts";
import type {
  EquipmentAccess,
  ExperienceLevel,
  GoalKey,
} from "@/types/database";
import {
  experienceDistance,
  GOAL_MAP,
  meetsEquipment,
  RECENT_SESSION_WINDOW,
  WEIGHTS,
  type CatalogGoal,
  type MatchReason,
} from "@/lib/recommendations/rules";

/**
 * The recommendation engine.
 *
 * Pure functions over data that is already in the repository: no database
 * access, no session, no React, no randomness. That makes it directly
 * testable, and it means the same member with the same saved answers and the
 * same history always gets the same list in the same order.
 *
 * What it does not do is as important as what it does. The program catalogue
 * carries a goal classification and the workout catalogue does not, so
 * programs are scored on goal and workouts are not — rather than inventing a
 * classification for workouts so the two could share a code path.
 */

/** Everything the engine is allowed to know about a member. */
export type MemberSignals = {
  goal: GoalKey | null;
  level: ExperienceLevel | null;
  equipment: EquipmentAccess | null;
  /** Sessions per week, 1–7. */
  trainingDays: number | null;
  /** Workout slugs from the most recent sessions, newest first. */
  recentWorkoutSlugs: readonly string[];
};

export const NO_SIGNALS: MemberSignals = {
  goal: null,
  level: null,
  equipment: null,
  trainingDays: null,
  recentWorkoutSlugs: [],
};

export type Scored<T> = {
  item: T;
  score: number;
  /** Only the reasons that actually contributed. */
  reasons: MatchReason[];
};

/** Accumulates a score and the reasons behind it, so they cannot disagree. */
class Tally {
  score = 0;
  readonly reasons: MatchReason[] = [];

  add(points: number, reason?: MatchReason): void {
    this.score += points;
    // A reason is recorded only when the signal helped. A penalty explains
    // itself by the item's position, not by a badge claiming a benefit.
    if (reason && points > 0 && !this.reasons.includes(reason)) {
      this.reasons.push(reason);
    }
  }
}

/** Experience component, shared by programs and workouts. */
function scoreExperience(
  tally: Tally,
  memberLevel: ExperienceLevel | null,
  itemLevel: ExperienceLevel,
): void {
  if (!memberLevel) return;

  const distance = experienceDistance(memberLevel, itemLevel);
  if (distance === 0) tally.add(WEIGHTS.EXPERIENCE_EXACT, "experience");
  else if (distance === 1) tally.add(WEIGHTS.EXPERIENCE_ADJACENT);
  else tally.add(WEIGHTS.EXPERIENCE_MISMATCH);
  // Only an exact match claims a reason; the rest move the score silently.
}

/**
 * Equipment component.
 *
 * Compatibility is already guaranteed by the filter that runs before scoring,
 * so this only rewards content built for the member's own setup — a full-gym
 * program for a full-gym member, rather than a bodyweight one they could also
 * technically do.
 */
function scoreEquipmentFit(
  tally: Tally,
  memberAccess: EquipmentAccess | null,
  required: readonly EquipmentAccess[],
): void {
  if (!memberAccess || required.length === 0) return;

  // Reachability is already guaranteed; content built for a lighter setup is
  // still perfectly usable, it just earns no bonus.
  if (required.includes(memberAccess)) {
    tally.add(WEIGHTS.EQUIPMENT_FIT, "equipment");
  }
}

/** "5 Days / Week" → 5. Null when the string is not in that shape. */
export function parseFrequencyDays(frequency: string): number | null {
  const match = /^(\d+)\s*Days?\s*\/\s*Week$/i.exec(frequency.trim());
  if (!match) return null;

  const days = Number(match[1]);
  return Number.isInteger(days) && days >= 1 && days <= 7 ? days : null;
}

/** Catalogue equipment values for a program, from its facet map. */
function programEquipment(program: Program): EquipmentAccess[] {
  return (program.facets.equipment ?? []) as EquipmentAccess[];
}

/** Catalogue goals for a program, from its facet map. */
function programGoals(program: Program): CatalogGoal[] {
  return (program.facets.goal ?? []) as CatalogGoal[];
}

/** Catalogue experience for a program, from its facet map. */
function programLevel(program: Program): ExperienceLevel | null {
  return (program.facets.experience?.[0] as ExperienceLevel | undefined) ?? null;
}

/**
 * Ranks programs for a member.
 *
 * Equipment is applied as a filter before anything is scored, because
 * recommending a full-gym block to somebody training in a bedroom is not a
 * worse suggestion, it is a wrong one. Every other signal is additive, which
 * is what produces the fallback behaviour: a program that matches nothing
 * still scores on whatever else fits, so the list is never empty while the
 * catalogue has anything the member can actually train.
 */
export function rankPrograms(
  programs: readonly Program[],
  signals: MemberSignals,
): Scored<Program>[] {
  const goals = signals.goal ? GOAL_MAP[signals.goal] : null;

  const reachable = programs.filter((program) =>
    meetsEquipment(signals.equipment, programEquipment(program)),
  );

  const scored = reachable.map((program) => {
    const tally = new Tally();

    if (goals) {
      const catalogGoals = programGoals(program);
      if (catalogGoals.some((goal) => goals.primary.includes(goal))) {
        tally.add(WEIGHTS.GOAL_PRIMARY, "goal");
      } else if (catalogGoals.some((goal) => goals.secondary.includes(goal))) {
        tally.add(WEIGHTS.GOAL_SECONDARY, "goal-related");
      }
    }

    const level = programLevel(program);
    if (level) scoreExperience(tally, signals.level, level);

    scoreEquipmentFit(tally, signals.equipment, programEquipment(program));

    if (signals.trainingDays !== null) {
      const days = parseFrequencyDays(program.frequency);
      if (days !== null) {
        const difference = days - signals.trainingDays;
        if (difference === 0) tally.add(WEIGHTS.SCHEDULE_EXACT, "schedule");
        else if (difference < 0) tally.add(WEIGHTS.SCHEDULE_LIGHTER, "schedule");
        else if (difference === 1) tally.add(WEIGHTS.SCHEDULE_ONE_MORE);
        else tally.add(WEIGHTS.SCHEDULE_TOO_HEAVY);
      }
    }

    if (program.featured) tally.add(WEIGHTS.FEATURED);

    return { item: program, score: tally.score, reasons: tally.reasons };
  });

  return sortDeterministically(scored, (program) => program.slug);
}

/**
 * Ranks workouts for a member.
 *
 * No goal component: the workout catalogue has no goal classification, and
 * assigning one here would be a guess dressed up as personalization. Workouts
 * are matched on what the catalogue does record — equipment, level — plus what
 * the member has recently trained.
 */
export function rankWorkouts(
  workouts: readonly Workout[],
  signals: MemberSignals,
): Scored<Workout>[] {
  const recent = new Set(
    signals.recentWorkoutSlugs.slice(0, RECENT_SESSION_WINDOW),
  );

  const reachable = workouts.filter((workout) => {
    const required = workoutEquipment(workout);
    return required === null || meetsEquipment(signals.equipment, [required]);
  });

  const scored = reachable.map((workout) => {
    const tally = new Tally();

    scoreExperience(tally, signals.level, workoutLevel(workout));

    const required = workoutEquipment(workout);
    if (required) scoreEquipmentFit(tally, signals.equipment, [required]);

    // Recency only ever demotes. It is not advertised as a reason, because
    // "you have not done this lately" is not why it suits the member.
    if (recent.has(workout.slug)) tally.add(WEIGHTS.RECENTLY_TRAINED);

    return { item: workout, score: tally.score, reasons: tally.reasons };
  });

  return sortDeterministically(scored, (workout) => workout.slug);
}

/** The three labels the workout catalogue uses, as ladder values. */
const WORKOUT_EQUIPMENT: Record<string, EquipmentAccess> = {
  "No Equipment": "no-equipment",
  Dumbbells: "dumbbells",
  "Home Gym": "home-gym",
  "Full Gym": "full-gym",
};

/**
 * A workout's equipment requirement, or null when its label is not one the
 * ladder recognises — in which case the workout is never filtered out on
 * equipment, because an unreadable label is not evidence of anything.
 */
function workoutEquipment(workout: Workout): EquipmentAccess | null {
  return WORKOUT_EQUIPMENT[workout.equipmentLabel] ?? null;
}

/** "Intermediate" → "intermediate". */
function workoutLevel(workout: Workout): ExperienceLevel {
  return workout.level.toLowerCase() as ExperienceLevel;
}

/**
 * Score descending, then by a stable key.
 *
 * The second key is what makes ties reproducible: without it the order would
 * depend on the catalogue's array order, and a reordering in src/data would
 * silently change what members see.
 */
function sortDeterministically<T>(
  scored: Scored<T>[],
  key: (item: T) => string,
): Scored<T>[] {
  return [...scored].sort(
    (a, b) => b.score - a.score || key(a.item).localeCompare(key(b.item)),
  );
}

/** True when the member has told us enough for the ranking to mean anything. */
export function hasUsableSignals(signals: MemberSignals): boolean {
  return (
    signals.goal !== null ||
    signals.level !== null ||
    signals.equipment !== null ||
    signals.trainingDays !== null
  );
}

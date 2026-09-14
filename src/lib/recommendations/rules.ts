import type {
  EquipmentAccess,
  ExperienceLevel,
  GoalKey,
} from "@/types/database";

/**
 * The rules the recommendation engine follows.
 *
 * Everything that could reasonably be argued about — which catalogue goal a
 * member's goal maps to, how much an experience match is worth, what counts as
 * compatible equipment — lives here as plain data, so the behaviour can be
 * read and changed without touching the scoring code or the UI.
 *
 * Two things this file does NOT do, on purpose:
 *
 * - It invents no metadata. Every value on the right-hand side of a mapping
 *   already exists in src/data. Where the catalogue cannot answer a question
 *   the engine leaves that signal out rather than guessing.
 * - It has no randomness. Identical inputs always produce identical scores.
 */

// ---------------------------------------------------------------------------
// Vocabularies
// ---------------------------------------------------------------------------

/**
 * Goals as the catalogue classifies them, from `programFilterGroups`.
 *
 * Deliberately different from the database's `primary_goal`: the catalogue was
 * written first and describes training styles, while the goals a member picks
 * describe intent. The bridge between them is GOAL_MAP below.
 */
export type CatalogGoal =
  | "muscle-gain"
  | "fat-loss"
  | "strength"
  | "endurance"
  | "general-fitness";

/**
 * A member's goal, translated into catalogue terms.
 *
 * `primary` is what the goal most directly asks for; `secondary` is content
 * that genuinely serves it too, scored lower. A member chasing size is well
 * served by a strength block, but not as directly as by a hypertrophy one.
 *
 * `improve-wellness` and `live-healthier` both land on general-fitness because
 * that is the closest thing the catalogue actually contains — there is no
 * wellness-classified program to point at, and inventing one would be worse
 * than being honest about the nearest fit.
 */
export const GOAL_MAP: Record<
  GoalKey,
  { primary: readonly CatalogGoal[]; secondary: readonly CatalogGoal[] }
> = {
  "build-muscle": { primary: ["muscle-gain"], secondary: ["strength"] },
  "lose-fat": { primary: ["fat-loss"], secondary: ["endurance", "general-fitness"] },
  "get-stronger": { primary: ["strength"], secondary: ["muscle-gain"] },
  "improve-fitness": { primary: ["general-fitness"], secondary: ["endurance"] },
  "improve-wellness": { primary: ["general-fitness"], secondary: ["endurance"] },
  "live-healthier": { primary: ["general-fitness"], secondary: ["fat-loss"] },
};

/**
 * Equipment as a capability ladder, least to most.
 *
 * Each level can do everything below it: a member with dumbbells can follow a
 * bodyweight program, but a member with nothing cannot follow a barbell one.
 * This ordering is what makes equipment a hard constraint rather than a
 * preference — see `meetsEquipment`.
 */
export const EQUIPMENT_LADDER: readonly EquipmentAccess[] = [
  "no-equipment",
  "dumbbells",
  "home-gym",
  "full-gym",
];

/**
 * Position on the ladder, or -1 for a value that is not on it.
 *
 * Callers must reject -1 rather than compare it: it sorts below every real
 * level, so an unchecked `-1 <= rank` would treat an unrecognised requirement
 * as the easiest possible one.
 */
export function equipmentRank(access: EquipmentAccess): number {
  return EQUIPMENT_LADDER.indexOf(access);
}

/**
 * Whether a value is one the ladder actually knows.
 *
 * The catalogue's facet maps are plain `Record<string, string[]>`, so the
 * `EquipmentAccess` types above are an assertion about that data rather than
 * something the compiler checks. This is the runtime check that makes the
 * assertion safe.
 */
export function isKnownEquipment(value: string): value is EquipmentAccess {
  return (EQUIPMENT_LADDER as readonly string[]).includes(value);
}

/**
 * Whether a member can actually train this content.
 *
 * `required` is every equipment level the content can be run at; the content
 * is reachable if its least demanding *recognised* option is within the
 * member's access. A member whose access is unknown is not blocked — an unset
 * preference is not evidence that they own nothing.
 *
 * Unrecognised requirements fail closed. Equipment is the one hard constraint
 * in the engine, so a requirement that cannot be read is refused rather than
 * waved through: a typo in the catalogue should hide a program, not push a
 * barbell block at somebody training in a bedroom. An empty list is different
 * and still reachable — it states that there is no requirement, rather than
 * stating one we failed to understand.
 */
export function meetsEquipment(
  memberAccess: EquipmentAccess | null,
  required: readonly EquipmentAccess[],
): boolean {
  if (memberAccess === null) return true;
  if (required.length === 0) return true;

  const known = required.filter((value) => isKnownEquipment(value));

  // Something was required, and none of it could be read.
  if (known.length === 0) return false;

  const cheapest = Math.min(...known.map(equipmentRank));
  return cheapest <= equipmentRank(memberAccess);
}

/** Experience levels in order, so "one step away" is measurable. */
export const EXPERIENCE_LADDER: readonly ExperienceLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];

/** How many rungs apart two experience levels are. */
export function experienceDistance(
  a: ExperienceLevel,
  b: ExperienceLevel,
): number {
  return Math.abs(EXPERIENCE_LADDER.indexOf(a) - EXPERIENCE_LADDER.indexOf(b));
}

// ---------------------------------------------------------------------------
// Weights
// ---------------------------------------------------------------------------

/**
 * Scoring weights, chosen against the actual catalogue rather than picked from
 * the air.
 *
 * The spread matters more than the absolute numbers. A primary goal match
 * (100) has to outrank any combination of the other signals put together
 * (40 + 10 + 25 + 5 = 80), because the goal is what the member said they came
 * for. A secondary goal match (55) beats experience alone but loses to a
 * primary match, so a hypertrophy block still comes ahead of a strength block
 * for someone building muscle even when the strength block fits them better on
 * every other axis.
 *
 * Equipment is absent from this table because it is not scored: incompatible
 * content is removed entirely, and EQUIPMENT_FIT is only a nudge toward
 * content built for the setup the member actually has.
 */
export const WEIGHTS = {
  /** Catalogue goal the member's goal maps to directly. */
  GOAL_PRIMARY: 100,
  /** Catalogue goal that serves the member's goal indirectly. */
  GOAL_SECONDARY: 55,

  /** Content graded at exactly the member's experience level. */
  EXPERIENCE_EXACT: 40,
  /** One rung away — a beginner reaching for intermediate work, or the reverse. */
  EXPERIENCE_ADJACENT: 15,
  /**
   * Two rungs away: beginner content for an advanced member, or the reverse.
   * A penalty rather than nothing, because without it a primary goal match
   * alone would float a beginner block above an intermediate one that suits an
   * advanced member better on every other axis.
   */
  EXPERIENCE_MISMATCH: -20,

  /** Content that lists the member's own equipment level among its options. */
  EQUIPMENT_FIT: 10,

  /** Program asks for exactly the number of days a week the member wants. */
  SCHEDULE_EXACT: 25,
  /** Program asks for fewer days than the member wants — easy to add to. */
  SCHEDULE_LIGHTER: 12,
  /** Program asks for one more day than the member wants. */
  SCHEDULE_ONE_MORE: 6,
  /** Program asks for two or more days beyond what the member committed to. */
  SCHEDULE_TOO_HEAVY: -12,

  /**
   * Trained recently. A demotion, not an exclusion: a member with one workout
   * in their history should still see it if nothing else suits them, just not
   * at the top.
   */
  RECENTLY_TRAINED: -50,

  /**
   * Baseline for catalogue-featured content. Small enough never to overturn a
   * real signal, and large enough to give a member with no personalization at
   * all a sensible order instead of an alphabetical one.
   */
  FEATURED: 5,
} as const;

/** How many recent sessions count as "recently trained". */
export const RECENT_SESSION_WINDOW = 5;

// ---------------------------------------------------------------------------
// Reasons
// ---------------------------------------------------------------------------

/**
 * Why a recommendation was made.
 *
 * Only ever produced by the branch of the scoring that actually fired, so a
 * badge on screen is a statement about the ranking rather than decoration.
 */
export type MatchReason =
  | "goal"
  | "goal-related"
  | "experience"
  | "equipment"
  | "schedule";

export const REASON_LABEL: Record<MatchReason, string> = {
  goal: "Matches your goal",
  "goal-related": "Supports your goal",
  experience: "Fits your experience",
  equipment: "Works with your equipment",
  schedule: "Fits your week",
};

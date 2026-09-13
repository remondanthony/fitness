import type {
  EquipmentAccess,
  ExperienceLevel,
  GoalKey,
  Units,
} from "@/types/database";

/**
 * The personalization contract.
 *
 * Five answers describe how a member trains, and they are spread across three
 * tables: the goal in `user_goals`, experience level on `profiles`, and
 * equipment, weekly frequency and units in `user_preferences`.
 *
 * Everything about those five values — the allowed set, the labels, the
 * validation and the completeness rule — lives here, so the onboarding UI, the
 * settings form and the Server Actions cannot drift apart from each other or
 * from the database CHECK constraints. Changing an allowed value means
 * changing this file and a migration, together.
 *
 * This module is safe to import from client components: it holds no secrets,
 * no Supabase client and no session lookup.
 */

export type PersonalizationOption<T extends string> = {
  value: T;
  label: string;
  /** One supporting line. Shown on the onboarding cards, not in settings. */
  description: string;
};

/** Mirrors `user_goals.primary_goal`. */
export const goalOptions: readonly PersonalizationOption<GoalKey>[] = [
  {
    value: "build-muscle",
    label: "Build Muscle",
    description: "Add size with progressive overload and enough volume to grow.",
  },
  {
    value: "lose-fat",
    label: "Lose Fat",
    description: "Keep your strength while training in a calorie deficit.",
  },
  {
    value: "get-stronger",
    label: "Get Stronger",
    description: "Heavier compound lifts, lower reps, longer rests.",
  },
  {
    value: "improve-fitness",
    label: "Improve Fitness",
    description: "Build work capacity and conditioning across the board.",
  },
  {
    value: "improve-wellness",
    label: "Improve Wellness",
    description: "Sleep, mobility and recovery alongside steady training.",
  },
  {
    value: "live-healthier",
    label: "Live Healthier",
    description: "Move regularly and build habits that hold up long term.",
  },
];

/** Mirrors `profiles.experience_level`. */
export const levelOptions: readonly PersonalizationOption<ExperienceLevel>[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to training, or coming back after a long break.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Training consistently for a year or more, lifts are steady.",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Several years in, training around specific weak points.",
  },
];

/** Mirrors `user_preferences.equipment_access`. */
export const equipmentOptions: readonly PersonalizationOption<EquipmentAccess>[] = [
  {
    value: "no-equipment",
    label: "No Equipment",
    description: "Bodyweight only — nothing to buy, nowhere to go.",
  },
  {
    value: "dumbbells",
    label: "Dumbbells",
    description: "A pair of dumbbells, maybe a bench.",
  },
  {
    value: "home-gym",
    label: "Home Gym",
    description: "Barbell, rack and plates at home.",
  },
  {
    value: "full-gym",
    label: "Full Gym",
    description: "Full range of racks, machines and free weights.",
  },
];

/** Mirrors `user_preferences.units`. */
export const unitOptions: readonly PersonalizationOption<Units>[] = [
  {
    value: "metric",
    label: "Metric (kg, cm)",
    description: "The standard almost everywhere outside the United States.",
  },
  {
    value: "imperial",
    label: "Imperial (lb, ft)",
    description: "Pounds for weight, feet and inches for height.",
  },
];

/**
 * Weekly training frequency.
 *
 * `user_preferences.preferred_training_days` is a smallint constrained to
 * 1–7: it is how many sessions a week the member wants, not which weekdays.
 * There is no weekday column, and inventing one would be a new scheduling
 * schema rather than a personalization input.
 *
 * The list covers the full 1–7 the constraint allows, so every value the
 * database will accept can also be shown back to the member. A narrower list
 * would silently reset anyone whose saved value fell outside it.
 */
export const TRAINING_DAYS_MIN = 1;
export const TRAINING_DAYS_MAX = 7;

export const trainingDayOptions: readonly PersonalizationOption<string>[] = [
  { value: "1", label: "1 day / week", description: "One focused full-body session." },
  { value: "2", label: "2 days / week", description: "A realistic minimum for steady progress." },
  { value: "3", label: "3 days / week", description: "Full-body work with a day between each." },
  { value: "4", label: "4 days / week", description: "An upper/lower split. Suits most people." },
  { value: "5", label: "5 days / week", description: "Room to give each area its own session." },
  { value: "6", label: "6 days / week", description: "High frequency, shorter sessions." },
  { value: "7", label: "7 days / week", description: "Daily movement, with easy days built in." },
];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Narrows a submitted string to an allowed value, or null.
 *
 * The allowed set is the option list itself, so a value the UI can offer is
 * exactly a value the action will accept — and both match the database.
 */
export function pickOption<T extends string>(
  options: readonly PersonalizationOption<T>[],
  value: unknown,
): T | null {
  if (typeof value !== "string") return null;
  return options.find((option) => option.value === value)?.value ?? null;
}

/** Parses weekly frequency, rejecting anything the CHECK constraint would. */
export function parseTrainingDays(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  if (parsed < TRAINING_DAYS_MIN || parsed > TRAINING_DAYS_MAX) return null;

  return parsed;
}

// ---------------------------------------------------------------------------
// State and completeness
// ---------------------------------------------------------------------------

/** The five answers as they are stored, with null meaning "not answered". */
export type PersonalizationState = {
  goal: GoalKey | null;
  level: ExperienceLevel | null;
  equipment: EquipmentAccess | null;
  trainingDays: number | null;
  units: Units | null;
};

/** The same five answers as form strings. Empty means "not answered". */
export type PersonalizationAnswers = {
  goal: string;
  level: string;
  equipment: string;
  trainingDays: string;
  units: string;
};

/**
 * The fields onboarding requires before it considers a member set up.
 *
 * `units` is deliberately absent. Its column is NOT NULL with a default of
 * 'metric', so it is populated the instant a preferences row exists — it
 * cannot tell a member who chose metric from one who was never asked. The
 * other four are nullable, so their presence is real evidence of an answer.
 */
export const REQUIRED_FIELDS = ["goal", "level", "equipment", "trainingDays"] as const;

export type RequiredField = (typeof REQUIRED_FIELDS)[number];

/** Which required answers are still missing. Empty means onboarding is done. */
export function missingPersonalization(state: PersonalizationState): RequiredField[] {
  return REQUIRED_FIELDS.filter((field) => state[field] === null);
}

/** True once every required answer is on record. */
export function isPersonalizationComplete(state: PersonalizationState): boolean {
  return missingPersonalization(state).length === 0;
}

/** Turns stored state into form strings, leaving unanswered fields blank. */
export function toAnswers(state: PersonalizationState): PersonalizationAnswers {
  return {
    goal: state.goal ?? "",
    level: state.level ?? "",
    equipment: state.equipment ?? "",
    trainingDays: state.trainingDays === null ? "" : String(state.trainingDays),
    units: state.units ?? "",
  };
}

/** The human label for a stored value, or null when it is unset. */
export function labelFor<T extends string>(
  options: readonly PersonalizationOption<T>[],
  value: T | null | undefined,
): string | null {
  if (!value) return null;
  return options.find((option) => option.value === value)?.label ?? null;
}

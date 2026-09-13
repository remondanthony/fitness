import {
  Armchair,
  Bed,
  Brain,
  Droplet,
  Footprints,
  HeartPulse,
  Moon,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";

import type { ImagePlaceholderVariant } from "@/components/ui/ImagePlaceholder";

/**
 * The daily targets the wellness metrics are measured against.
 *
 * These are product defaults, not member data — what a member actually did on
 * a given day comes from `wellness_logs`.
 */
export const wellnessGoals = {
  sleepHours: 8,
  waterLiters: 3,
  steps: 10000,
  mindfulnessMinutes: 15,
} as const;

/** 7.7 → "7h 42m". A blank reading has no sensible formatting, hence null. */
export function formatSleep(hours: number | null): string {
  if (hours === null) return "—";
  const totalMinutes = Math.round(hours * 60);
  return `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, "0")}m`;
}

/** One day of readings, as the member logged them. Null means not logged. */
export type DailyReadings = {
  sleepHours: number | null;
  waterLiters: number | null;
  steps: number | null;
  mindfulnessMinutes: number | null;
  recoveryScore: number | null;
};

export const emptyReadings: DailyReadings = {
  sleepHours: null,
  waterLiters: null,
  steps: null,
  mindfulnessMinutes: null,
  recoveryScore: null,
};

export type WellnessMetric = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  progress?: number;
  caption: string;
  ring?: boolean;
};

/** How much of a goal a reading covers, or undefined when nothing is logged. */
function share(reading: number | null, goal: number): number | undefined {
  return reading === null ? undefined : reading / goal;
}

/** Describes the gap to a goal, or invites the member to log the figure. */
function gap(
  reading: number | null,
  goal: number,
  format: (remaining: number) => string,
): string {
  if (reading === null) return "Not logged yet";
  const remaining = goal - reading;
  return remaining > 0 ? format(remaining) : "Goal reached";
}

/** Builds the five metric tiles from one day of readings. */
export function buildWellnessMetrics(readings: DailyReadings): WellnessMetric[] {
  return [
    {
      id: "sleep",
      label: "Sleep",
      value: formatSleep(readings.sleepHours),
      icon: Moon,
      progress: share(readings.sleepHours, wellnessGoals.sleepHours),
      caption: gap(
        readings.sleepHours,
        wellnessGoals.sleepHours,
        (remaining) => `${Math.round(remaining * 60)} min under your ${wellnessGoals.sleepHours}h target`,
      ),
    },
    {
      id: "water",
      label: "Water",
      value: readings.waterLiters === null ? "—" : `${readings.waterLiters}L`,
      icon: Droplet,
      progress: share(readings.waterLiters, wellnessGoals.waterLiters),
      caption: gap(
        readings.waterLiters,
        wellnessGoals.waterLiters,
        (remaining) => `${Math.round(remaining * 1000)} ml to go`,
      ),
    },
    {
      id: "steps",
      label: "Steps",
      value: readings.steps === null ? "—" : readings.steps.toLocaleString("en-US"),
      icon: Footprints,
      progress: share(readings.steps, wellnessGoals.steps),
      caption: gap(
        readings.steps,
        wellnessGoals.steps,
        (remaining) => `${Math.round(remaining).toLocaleString("en-US")} steps from your goal`,
      ),
    },
    {
      id: "mindfulness",
      label: "Mindfulness",
      value: readings.mindfulnessMinutes === null ? "—" : `${readings.mindfulnessMinutes} min`,
      icon: Brain,
      progress: share(readings.mindfulnessMinutes, wellnessGoals.mindfulnessMinutes),
      caption: gap(
        readings.mindfulnessMinutes,
        wellnessGoals.mindfulnessMinutes,
        (remaining) => `${Math.round(remaining)} min to go`,
      ),
    },
    {
      id: "recovery",
      label: "Recovery",
      value: readings.recoveryScore === null ? "—" : `${readings.recoveryScore}%`,
      icon: HeartPulse,
      progress: readings.recoveryScore === null ? undefined : readings.recoveryScore / 100,
      ring: true,
      caption:
        readings.recoveryScore === null
          ? "Not logged yet"
          : "How recovered you rated yourself today",
    },
  ];
}

/**
 * The starter habits a new member's list is seeded from.
 *
 * Once seeded these live in the `habits` table and the member owns them, so
 * the descriptions here are lasting guidance rather than a snapshot of a day.
 */
export type Habit = {
  id: string;
  title: string;
  detail: string;
  icon: LucideIcon;
};

export const habits: Habit[] = [
  {
    id: "water",
    title: "Drink 3L Water",
    detail: "Spread it across the day rather than all at once",
    icon: Droplet,
  },
  {
    id: "steps",
    title: "8,000 Steps",
    detail: "A brisk 20-minute walk covers most of it",
    icon: Footprints,
  },
  {
    id: "mobility",
    title: "10 Min Mobility",
    detail: "Pairs well with an upper body session",
    icon: Waves,
  },
  {
    id: "sleep",
    title: "Sleep Before 11:30 PM",
    detail: "Set a wind-down reminder for 11:00 PM",
    icon: Bed,
  },
];

/**
 * The icon for a habit, matched on its name.
 *
 * Habits are read back from the database, which stores no icon, so the starter
 * set keeps its own icon and anything a member adds later gets a neutral one.
 */
export function habitIconFor(name: string): LucideIcon {
  return habits.find((habit) => habit.title === name)?.icon ?? Sparkles;
}

export type RecoverySession = {
  slug: string;
  title: string;
  minutes: number;
  focus: string;
  summary: string;
  /** What the session is made up of. */
  blocks: string[];
  intensity: "Easy" | "Moderate";
  icon: LucideIcon;
  artwork: ImagePlaceholderVariant;
};

export const recoverySessions: RecoverySession[] = [
  {
    slug: "lower-body-mobility",
    title: "Lower Body Mobility",
    minutes: 12,
    focus: "Hips · Ankles · Hamstrings",
    summary:
      "Work through the positions your squat and hinge ask for, unloaded and unhurried.",
    blocks: ["90/90 hip switches", "Deep squat holds", "Ankle rocks", "Hamstring sweeps"],
    intensity: "Easy",
    icon: Waves,
    artwork: "recovery",
  },
  {
    slug: "full-body-stretch",
    title: "Full Body Stretch",
    minutes: 15,
    focus: "Head to toe",
    summary: "A slow pass over every major joint, one long hold at a time.",
    blocks: ["Thoracic opener", "Couch stretch", "Lat hang", "Pigeon", "Calf wall stretch"],
    intensity: "Easy",
    icon: Sparkles,
    artwork: "recovery",
  },
  {
    slug: "post-workout-recovery",
    title: "Post Workout Recovery",
    minutes: 10,
    focus: "Cool down",
    summary:
      "Bring your breathing back down and move the joints you just loaded through their range.",
    blocks: ["Nasal breathing", "Shoulder circles", "Hip flexor stretch", "Easy walk"],
    intensity: "Easy",
    icon: HeartPulse,
    artwork: "recovery",
  },
  {
    slug: "sleep-reset",
    title: "Sleep Reset",
    minutes: 20,
    focus: "Wind down",
    summary: "A quiet, low-effort routine to close the day out away from screens.",
    blocks: ["Legs up the wall", "Box breathing", "Neck and jaw release", "Lights down"],
    intensity: "Easy",
    icon: Moon,
    artwork: "recovery",
  },
];

/** Icon used for the "rest day" state in recovery lists. */
export const restIcon: LucideIcon = Armchair;

export function getRecoverySession(slug: string): RecoverySession | undefined {
  return recoverySessions.find((session) => session.slug === slug);
}

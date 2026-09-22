import { formatSleep, wellnessGoals, type DailyReadings } from "@/data/wellness";
import {
  Droplet,
  Footprints,
  HeartPulse,
  Moon,
  type LucideIcon,
} from "lucide-react";

/** A single point on a time series chart. */
export type SeriesPoint = {
  label: string;
  value: number;
  /** Marks an in-progress period so charts can style it differently. */
  current?: boolean;
};

export type DailyMetric = {
  id: string;
  label: string;
  /** Pre-formatted headline value, e.g. "2.1 / 3 L". */
  value: string;
  icon: LucideIcon;
  /** 0–1 completion against the day's goal, when the metric has one. */
  progress?: number;
  /** Short supporting line under the value. */
  caption: string;
  /** Renders the value inside a progress ring instead of a bar. */
  ring?: boolean;
};

/**
 * The dashboard's daily tiles.
 *
 * The four wellness figures come from the member's own `wellness_logs` row, so
 * the dashboard and /wellness can never disagree about the same day. Streak
 * and weekly workouts remain sample content until workout history feeds them.
 */
export function buildDailyMetrics(readings: DailyReadings): DailyMetric[] {
  const pending = "Not logged yet";

  return [
    {
      id: "water",
      label: "Water",
      value:
        readings.waterLiters === null
          ? `— / ${wellnessGoals.waterLiters} L`
          : `${readings.waterLiters} / ${wellnessGoals.waterLiters} L`,
      icon: Droplet,
      progress:
        readings.waterLiters === null
          ? undefined
          : readings.waterLiters / wellnessGoals.waterLiters,
      caption: readings.waterLiters === null ? pending : "Logged on your wellness page",
    },
    {
      id: "steps",
      label: "Steps",
      value:
        readings.steps === null
          ? `— / ${wellnessGoals.steps.toLocaleString("en-US")}`
          : `${readings.steps.toLocaleString("en-US")} / ${wellnessGoals.steps.toLocaleString("en-US")}`,
      icon: Footprints,
      progress: readings.steps === null ? undefined : readings.steps / wellnessGoals.steps,
      caption: readings.steps === null ? pending : "Logged on your wellness page",
    },
    {
      id: "recovery",
      label: "Recovery",
      value: readings.recoveryScore === null ? "—" : `${readings.recoveryScore}%`,
      icon: HeartPulse,
      progress: readings.recoveryScore === null ? undefined : readings.recoveryScore / 100,
      ring: true,
      caption: readings.recoveryScore === null ? pending : "How recovered you rated yourself",
    },
    {
      id: "sleep",
      label: "Sleep",
      value: formatSleep(readings.sleepHours),
      icon: Moon,
      progress:
        readings.sleepHours === null
          ? undefined
          : readings.sleepHours / wellnessGoals.sleepHours,
      caption: readings.sleepHours === null ? pending : `Against your ${wellnessGoals.sleepHours}h target`,
    },
  ];
}

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  earned: boolean;
  /** When it was unlocked, or how far off it is. */
  detail: string;
  /** 0–1 completion, for achievements still in progress. */
  progress?: number;
};

export type PersonalRecord = {
  id: string;
  lift: string;
  value: string;
  unit: string;
  /** Improvement since the previous record. Absent for a first-ever record. */
  delta?: string;
  achieved: string;
  /** Links to the exercise library when a matching entry exists. */
  exerciseSlug?: string;
};

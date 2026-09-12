import { dailyReadings, formatSleep } from "@/data/wellness";
import {
  Award,
  Dumbbell,
  Droplet,
  Flame,
  Footprints,
  HeartPulse,
  Medal,
  Moon,
  Scale,
  TrendingUp,
  Trophy,
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

export const dailyMetrics: DailyMetric[] = [
  {
    id: "streak",
    label: "Workout Streak",
    value: "12 Days",
    icon: Flame,
    caption: "Longest this year — keep it alive",
  },
  {
    id: "weekly-workouts",
    label: "Weekly Workouts",
    value: "4 / 5",
    icon: Dumbbell,
    progress: 4 / 5,
    caption: "One session left this week",
  },
  {
    id: "water",
    label: "Water",
    value: `${dailyReadings.waterLitres} / ${dailyReadings.waterGoalLitres} L`,
    icon: Droplet,
    progress: dailyReadings.waterLitres / dailyReadings.waterGoalLitres,
    caption: "900 ml to go",
  },
  {
    id: "steps",
    label: "Steps",
    value: `${dailyReadings.steps.toLocaleString("en-US")} / ${dailyReadings.stepsGoal.toLocaleString("en-US")}`,
    icon: Footprints,
    progress: dailyReadings.steps / dailyReadings.stepsGoal,
    caption: "1,580 steps from your goal",
  },
  {
    id: "recovery",
    label: "Recovery",
    value: `${dailyReadings.recoveryPercent}%`,
    icon: HeartPulse,
    progress: dailyReadings.recoveryPercent / 100,
    ring: true,
    caption: "Ready for a heavy session",
  },
  {
    id: "sleep",
    label: "Sleep",
    value: formatSleep(dailyReadings.sleepMinutes),
    icon: Moon,
    progress: dailyReadings.sleepMinutes / dailyReadings.sleepGoalMinutes,
    caption: "18 min under your 8h target",
  },
];

export type HeadlineStat = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  /** Change versus the start of the current block. */
  delta?: { value: string; direction: "up" | "down" };
  caption: string;
};

export const progressStats: HeadlineStat[] = [
  {
    id: "weight",
    label: "Weight",
    value: "74.2 kg",
    icon: Scale,
    delta: { value: "4.2 kg", direction: "down" },
    caption: "Down from 78.4 kg in 12 weeks",
  },
  {
    id: "strength",
    label: "Strength",
    value: "+18%",
    icon: TrendingUp,
    delta: { value: "52 kg", direction: "up" },
    caption: "Combined squat, bench and deadlift",
  },
  {
    id: "workouts",
    label: "Workouts",
    value: "47",
    icon: Dumbbell,
    caption: "Completed in the last 12 weeks",
  },
  {
    id: "streak",
    label: "Current Streak",
    value: "12 Days",
    icon: Flame,
    caption: "Personal best is 14 days",
  },
];

/** Bodyweight, weekly average, in kilograms. */
export const weightSeries: SeriesPoint[] = [
  { label: "W1", value: 78.4 },
  { label: "W2", value: 78.1 },
  { label: "W3", value: 77.6 },
  { label: "W4", value: 77.8 },
  { label: "W5", value: 77.1 },
  { label: "W6", value: 76.6 },
  { label: "W7", value: 76.4 },
  { label: "W8", value: 75.9 },
  { label: "W9", value: 75.5 },
  { label: "W10", value: 75.2 },
  { label: "W11", value: 74.6 },
  { label: "W12", value: 74.2 },
];

/** Combined estimated one-rep max across squat, bench and deadlift. */
export const strengthSeries: SeriesPoint[] = [
  { label: "W1", value: 283 },
  { label: "W2", value: 288 },
  { label: "W3", value: 292 },
  { label: "W4", value: 291 },
  { label: "W5", value: 298 },
  { label: "W6", value: 303 },
  { label: "W7", value: 307 },
  { label: "W8", value: 306 },
  { label: "W9", value: 313 },
  { label: "W10", value: 320 },
  { label: "W11", value: 328 },
  { label: "W12", value: 335 },
];

/** Sessions completed per week. The final week is still in progress. */
export const consistencySeries: SeriesPoint[] = [
  { label: "W1", value: 3 },
  { label: "W2", value: 3 },
  { label: "W3", value: 4 },
  { label: "W4", value: 4 },
  { label: "W5", value: 5 },
  { label: "W6", value: 4 },
  { label: "W7", value: 5 },
  { label: "W8", value: 4 },
  { label: "W9", value: 5 },
  { label: "W10", value: 3 },
  { label: "W11", value: 3 },
  { label: "W12", value: 4, current: true },
];

/** Sessions per week the plan asks for — drawn as a target line. */
export const weeklyTarget = 5;

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

export const achievements: Achievement[] = [
  {
    id: "first-10",
    title: "First 10 Workouts",
    description: "Turned up ten times. This is where the habit starts.",
    icon: Medal,
    earned: true,
    detail: "Earned 2 months ago",
  },
  {
    id: "7-day-streak",
    title: "7 Day Streak",
    description: "A full week without missing a scheduled session.",
    icon: Flame,
    earned: true,
    detail: "Earned 3 weeks ago",
  },
  {
    id: "50-workouts",
    title: "50 Workouts",
    description: "Fifty sessions logged since you started training here.",
    icon: Trophy,
    earned: false,
    detail: "3 workouts to go",
    progress: 47 / 50,
  },
  {
    id: "100kg-squat",
    title: "100 KG Squat",
    description: "Three plates on the bar and a clean rep out of the hole.",
    icon: Award,
    earned: true,
    detail: "Earned last week",
  },
];

export type PersonalRecord = {
  id: string;
  lift: string;
  value: string;
  unit: string;
  /** Improvement since the previous record. */
  delta: string;
  achieved: string;
  /** Links to the exercise library when a matching entry exists. */
  exerciseSlug?: string;
};

export const personalRecords: PersonalRecord[] = [
  {
    id: "bench",
    lift: "Bench Press",
    value: "85",
    unit: "kg",
    delta: "+5 kg",
    achieved: "2 weeks ago",
    exerciseSlug: "barbell-bench-press",
  },
  {
    id: "squat",
    lift: "Squat",
    value: "110",
    unit: "kg",
    delta: "+7.5 kg",
    achieved: "Last week",
    exerciseSlug: "back-squat",
  },
  {
    id: "deadlift",
    lift: "Deadlift",
    value: "140",
    unit: "kg",
    delta: "+10 kg",
    achieved: "3 weeks ago",
  },
  {
    id: "pull-ups",
    lift: "Pull Ups",
    value: "15",
    unit: "reps",
    delta: "+2 reps",
    achieved: "Last month",
    exerciseSlug: "chin-up",
  },
];

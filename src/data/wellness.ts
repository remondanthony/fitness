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
 * Raw readings for today. The dashboard and the wellness page both format
 * these, so the two screens can never show contradictory numbers.
 */
export const dailyReadings = {
  sleepMinutes: 462,
  sleepGoalMinutes: 480,
  waterLitres: 2.1,
  waterGoalLitres: 3,
  steps: 8420,
  stepsGoal: 10000,
  mindfulnessMinutes: 12,
  mindfulnessGoalMinutes: 15,
  recoveryPercent: 82,
} as const;

/** 462 → "7h 42m" */
export function formatSleep(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export type WellnessMetric = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  progress?: number;
  caption: string;
  ring?: boolean;
};

export const wellnessMetrics: WellnessMetric[] = [
  {
    id: "sleep",
    label: "Sleep",
    value: formatSleep(dailyReadings.sleepMinutes),
    icon: Moon,
    progress: dailyReadings.sleepMinutes / dailyReadings.sleepGoalMinutes,
    caption: "18 min under your 8h target",
  },
  {
    id: "water",
    label: "Water",
    value: `${dailyReadings.waterLitres}L`,
    icon: Droplet,
    progress: dailyReadings.waterLitres / dailyReadings.waterGoalLitres,
    caption: `Goal ${dailyReadings.waterGoalLitres}L · 900 ml to go`,
  },
  {
    id: "steps",
    label: "Steps",
    value: dailyReadings.steps.toLocaleString("en-US"),
    icon: Footprints,
    progress: dailyReadings.steps / dailyReadings.stepsGoal,
    caption: "1,580 steps from your goal",
  },
  {
    id: "mindfulness",
    label: "Mindfulness",
    value: `${dailyReadings.mindfulnessMinutes} min`,
    icon: Brain,
    progress:
      dailyReadings.mindfulnessMinutes / dailyReadings.mindfulnessGoalMinutes,
    caption: "One short session logged today",
  },
  {
    id: "recovery",
    label: "Recovery",
    value: `${dailyReadings.recoveryPercent}%`,
    icon: HeartPulse,
    progress: dailyReadings.recoveryPercent / 100,
    ring: true,
    caption: "Based on sleep, steps and training load",
  },
];

export type Habit = {
  id: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  /** Whether today's habit starts ticked. */
  completed: boolean;
};

export const habits: Habit[] = [
  {
    id: "water",
    title: "Drink 3L Water",
    detail: "2.1L logged so far",
    icon: Droplet,
    completed: false,
  },
  {
    id: "steps",
    title: "8,000 Steps",
    detail: "8,420 steps — done",
    icon: Footprints,
    completed: true,
  },
  {
    id: "mobility",
    title: "10 Min Mobility",
    detail: "Pairs well with today's upper body session",
    icon: Waves,
    completed: true,
  },
  {
    id: "sleep",
    title: "Sleep Before 11:30 PM",
    detail: "Set a wind-down reminder for 11:00 PM",
    icon: Bed,
    completed: false,
  },
];

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

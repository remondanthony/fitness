import { Dumbbell, Flame, Repeat, Timer, type LucideIcon } from "lucide-react";

import type { ImagePlaceholderVariant } from "@/components/ui/ImagePlaceholder";
import type { Difficulty } from "@/data/types";

/** One prescribed movement inside a workout. */
export type WorkoutExercise = {
  /** Stable id used as the key for logged sets. */
  id: string;
  name: string;
  /** Links to the exercise library when a matching entry exists. */
  exerciseSlug?: string;
  sets: number;
  /** Target reps for each set, e.g. "8" or "12". */
  reps: string;
  restSeconds: number;
  /** What the member lifted last time, used to prefill the set logger. */
  previous?: { weight: number; reps: number };
  note?: string;
};

export type CompletedSession = {
  date: string;
  /** Actual elapsed time in minutes. */
  minutes: number;
  volumeKg: number;
  sets: number;
};

export type Workout = {
  slug: string;
  title: string;
  focus: string;
  summary: string;
  /** Planned session length shown before you train. */
  estimatedMinutes: number;
  /** Typical completion time across members, shown on the detail page. */
  averageMinutes: number;
  targetMuscles: string[];
  level: Difficulty;
  equipmentLabel: string;
  artwork: ImagePlaceholderVariant;
  exercises: WorkoutExercise[];
  /** Present when this workout has already been trained. */
  lastCompleted?: CompletedSession;
};

/** Icons for the workout meta row, kept beside the data they label. */
export const workoutMetaIcons = {
  duration: Timer,
  exercises: Repeat,
  level: Flame,
  equipment: Dumbbell,
} satisfies Record<"duration" | "exercises" | "level" | "equipment", LucideIcon>;

export const workouts: Workout[] = [
  {
    slug: "upper-body-power",
    title: "Upper Body Power",
    focus: "Push · Pull · Arms",
    summary:
      "Two heavy presses to open, then controlled volume through the back, shoulders and arms.",
    estimatedMinutes: 45,
    averageMinutes: 42,
    targetMuscles: ["Chest", "Back", "Shoulders", "Arms"],
    level: "Intermediate",
    equipmentLabel: "Full Gym",
    artwork: "athlete",
    exercises: [
      {
        id: "ex-1",
        name: "Barbell Bench Press",
        exerciseSlug: "barbell-bench-press",
        sets: 4,
        reps: "8",
        restSeconds: 90,
        previous: { weight: 75, reps: 8 },
        note: "Top set at RPE 8, then hold the load for the remaining three.",
      },
      {
        id: "ex-2",
        name: "Incline Dumbbell Press",
        exerciseSlug: "incline-dumbbell-press",
        sets: 3,
        reps: "10",
        restSeconds: 75,
        previous: { weight: 28, reps: 10 },
      },
      {
        id: "ex-3",
        name: "Lat Pulldown",
        exerciseSlug: "lat-pulldown",
        sets: 3,
        reps: "10",
        restSeconds: 75,
        previous: { weight: 60, reps: 10 },
      },
      {
        id: "ex-4",
        name: "Seated Shoulder Press",
        exerciseSlug: "seated-shoulder-press",
        sets: 3,
        reps: "8",
        restSeconds: 75,
        previous: { weight: 24, reps: 8 },
      },
      {
        id: "ex-5",
        name: "Cable Fly",
        exerciseSlug: "cable-fly",
        sets: 3,
        reps: "12",
        restSeconds: 60,
        previous: { weight: 15, reps: 12 },
      },
      {
        id: "ex-6",
        name: "Rope Tricep Pushdown",
        exerciseSlug: "cable-triceps-pushdown",
        sets: 3,
        reps: "12",
        restSeconds: 60,
        previous: { weight: 25, reps: 12 },
      },
    ],
  },
  {
    slug: "lower-body-strength",
    title: "Lower Body Strength",
    focus: "Squat · Hinge · Core",
    summary:
      "Heavy bilateral work first, then posterior chain volume and a braced core finisher.",
    estimatedMinutes: 50,
    averageMinutes: 48,
    targetMuscles: ["Quads", "Hamstrings", "Glutes", "Core"],
    level: "Intermediate",
    equipmentLabel: "Full Gym",
    artwork: "program",
    exercises: [
      {
        id: "ex-1",
        name: "Back Squat",
        exerciseSlug: "back-squat",
        sets: 5,
        reps: "5",
        restSeconds: 150,
        previous: { weight: 100, reps: 5 },
      },
      {
        id: "ex-2",
        name: "Romanian Deadlift",
        exerciseSlug: "romanian-deadlift",
        sets: 4,
        reps: "8",
        restSeconds: 120,
        previous: { weight: 80, reps: 8 },
      },
      {
        id: "ex-3",
        name: "Leg Press",
        exerciseSlug: "leg-press",
        sets: 3,
        reps: "12",
        restSeconds: 90,
        previous: { weight: 140, reps: 12 },
      },
      {
        id: "ex-4",
        name: "Hip Thrust",
        exerciseSlug: "hip-thrust",
        sets: 3,
        reps: "10",
        restSeconds: 90,
        previous: { weight: 90, reps: 10 },
      },
      {
        id: "ex-5",
        name: "Hanging Leg Raise",
        exerciseSlug: "hanging-leg-raise",
        sets: 3,
        reps: "12",
        restSeconds: 60,
        previous: { weight: 0, reps: 12 },
        note: "Bodyweight — log 0 kg unless you add a dumbbell between your feet.",
      },
    ],
    lastCompleted: { date: "3 days ago", minutes: 47, volumeKg: 8460, sets: 18 },
  },
  {
    slug: "full-body-conditioning",
    title: "Full Body Conditioning",
    focus: "Circuit · Engine",
    summary:
      "Four rounds of hinge, press and carry with short rest. Breathing is the hard part.",
    estimatedMinutes: 30,
    averageMinutes: 28,
    targetMuscles: ["Full Body", "Glutes", "Shoulders", "Core"],
    level: "Beginner",
    equipmentLabel: "Dumbbells",
    artwork: "generic",
    exercises: [
      {
        id: "ex-1",
        name: "Kettlebell Swing",
        exerciseSlug: "kettlebell-swing",
        sets: 4,
        reps: "20",
        restSeconds: 45,
        previous: { weight: 24, reps: 20 },
      },
      {
        id: "ex-2",
        name: "Goblet Squat",
        exerciseSlug: "goblet-squat",
        sets: 4,
        reps: "15",
        restSeconds: 45,
        previous: { weight: 22, reps: 15 },
      },
      {
        id: "ex-3",
        name: "Push-Up",
        exerciseSlug: "push-up",
        sets: 4,
        reps: "12",
        restSeconds: 45,
        previous: { weight: 0, reps: 12 },
      },
      {
        id: "ex-4",
        name: "Plank",
        exerciseSlug: "plank",
        sets: 3,
        reps: "45s",
        restSeconds: 45,
        previous: { weight: 0, reps: 45 },
        note: "Log seconds held in the reps field.",
      },
    ],
  },
  {
    slug: "pull-day-volume",
    title: "Pull Day Volume",
    focus: "Back · Biceps",
    summary: "Vertical and horizontal pulling stacked with direct arm work to finish.",
    estimatedMinutes: 40,
    averageMinutes: 38,
    targetMuscles: ["Back", "Biceps", "Rear Delts"],
    level: "Intermediate",
    equipmentLabel: "Full Gym",
    artwork: "program",
    exercises: [
      {
        id: "ex-1",
        name: "Chin-Up",
        exerciseSlug: "chin-up",
        sets: 4,
        reps: "6",
        restSeconds: 120,
        previous: { weight: 10, reps: 6 },
        note: "Weight logged is the load added on the belt.",
      },
      {
        id: "ex-2",
        name: "Barbell Row",
        exerciseSlug: "barbell-row",
        sets: 4,
        reps: "8",
        restSeconds: 90,
        previous: { weight: 70, reps: 8 },
      },
      {
        id: "ex-3",
        name: "Lat Pulldown",
        exerciseSlug: "lat-pulldown",
        sets: 3,
        reps: "12",
        restSeconds: 75,
        previous: { weight: 55, reps: 12 },
      },
      {
        id: "ex-4",
        name: "Dumbbell Curl",
        exerciseSlug: "dumbbell-curl",
        sets: 3,
        reps: "12",
        restSeconds: 60,
        previous: { weight: 14, reps: 12 },
      },
    ],
    lastCompleted: { date: "Last week", minutes: 39, volumeKg: 6120, sets: 14 },
  },
  {
    slug: "push-day-volume",
    title: "Push Day Volume",
    focus: "Chest · Shoulders · Triceps",
    summary: "Moderate loads, high quality reps and enough volume to grow on.",
    estimatedMinutes: 40,
    averageMinutes: 37,
    targetMuscles: ["Chest", "Shoulders", "Triceps"],
    level: "Beginner",
    equipmentLabel: "Full Gym",
    artwork: "generic",
    exercises: [
      {
        id: "ex-1",
        name: "Incline Dumbbell Press",
        exerciseSlug: "incline-dumbbell-press",
        sets: 4,
        reps: "10",
        restSeconds: 90,
        previous: { weight: 26, reps: 10 },
      },
      {
        id: "ex-2",
        name: "Seated Shoulder Press",
        exerciseSlug: "seated-shoulder-press",
        sets: 3,
        reps: "10",
        restSeconds: 75,
        previous: { weight: 22, reps: 10 },
      },
      {
        id: "ex-3",
        name: "Cable Fly",
        exerciseSlug: "cable-fly",
        sets: 3,
        reps: "15",
        restSeconds: 60,
        previous: { weight: 12, reps: 15 },
      },
      {
        id: "ex-4",
        name: "Rope Tricep Pushdown",
        exerciseSlug: "cable-triceps-pushdown",
        sets: 3,
        reps: "15",
        restSeconds: 60,
        previous: { weight: 22, reps: 15 },
      },
    ],
  },
  {
    slug: "core-and-mobility",
    title: "Core & Mobility",
    focus: "Trunk · Recovery",
    summary: "A short, low-fatigue session for the day after something heavy.",
    estimatedMinutes: 20,
    averageMinutes: 19,
    targetMuscles: ["Core", "Hips", "Shoulders"],
    level: "Beginner",
    equipmentLabel: "No Equipment",
    artwork: "generic",
    exercises: [
      {
        id: "ex-1",
        name: "Plank",
        exerciseSlug: "plank",
        sets: 3,
        reps: "45s",
        restSeconds: 45,
        previous: { weight: 0, reps: 45 },
      },
      {
        id: "ex-2",
        name: "Hanging Leg Raise",
        exerciseSlug: "hanging-leg-raise",
        sets: 3,
        reps: "10",
        restSeconds: 60,
        previous: { weight: 0, reps: 10 },
      },
      {
        id: "ex-3",
        name: "Goblet Squat",
        exerciseSlug: "goblet-squat",
        sets: 2,
        reps: "15",
        restSeconds: 45,
        previous: { weight: 16, reps: 15 },
        note: "Slow and deep — this is mobility work, not a strength set.",
      },
    ],
    lastCompleted: { date: "Yesterday", minutes: 18, volumeKg: 480, sets: 8 },
  },
  {
    slug: "shoulders-and-arms",
    title: "Shoulders & Arms",
    focus: "Delts · Biceps · Triceps",
    summary: "A short accessory session for the days you want to train but not to grind.",
    estimatedMinutes: 35,
    averageMinutes: 33,
    targetMuscles: ["Shoulders", "Biceps", "Triceps"],
    level: "Beginner",
    equipmentLabel: "Dumbbells",
    artwork: "athlete",
    exercises: [
      {
        id: "ex-1",
        name: "Seated Shoulder Press",
        exerciseSlug: "seated-shoulder-press",
        sets: 4,
        reps: "10",
        restSeconds: 75,
        previous: { weight: 20, reps: 10 },
      },
      {
        id: "ex-2",
        name: "Dumbbell Lateral Raise",
        exerciseSlug: "dumbbell-lateral-raise",
        sets: 4,
        reps: "15",
        restSeconds: 45,
        previous: { weight: 9, reps: 15 },
      },
      {
        id: "ex-3",
        name: "Dumbbell Curl",
        exerciseSlug: "dumbbell-curl",
        sets: 3,
        reps: "12",
        restSeconds: 60,
        previous: { weight: 14, reps: 12 },
      },
      {
        id: "ex-4",
        name: "Rope Tricep Pushdown",
        exerciseSlug: "cable-triceps-pushdown",
        sets: 3,
        reps: "15",
        restSeconds: 60,
        previous: { weight: 22, reps: 15 },
      },
      {
        id: "ex-5",
        name: "Push-Up",
        exerciseSlug: "push-up",
        sets: 2,
        reps: "15",
        restSeconds: 45,
        previous: { weight: 0, reps: 15 },
        note: "Finisher — stop two reps short of failure.",
      },
    ],
  },
];

/** The session scheduled for today. */
export const todaysWorkoutSlug = "upper-body-power";

export function getWorkout(slug: string): Workout | undefined {
  return workouts.find((workout) => workout.slug === slug);
}

export const todaysWorkout = workouts.find(
  (workout) => workout.slug === todaysWorkoutSlug,
)!;

/** Sessions already trained, most recent first. */
export const recentWorkouts = [
  "core-and-mobility",
  "lower-body-strength",
  "pull-day-volume",
]
  .map(getWorkout)
  .filter((workout): workout is Workout => Boolean(workout));

/** Sessions suggested next. */
export const recommendedWorkouts = [
  "push-day-volume",
  "full-body-conditioning",
  "shoulders-and-arms",
]
  .map(getWorkout)
  .filter((workout): workout is Workout => Boolean(workout));

/** Total prescribed sets for a workout. */
export function totalSets(workout: Workout): number {
  return workout.exercises.reduce((total, exercise) => total + exercise.sets, 0);
}

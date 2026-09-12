import { CalendarDays, Dumbbell, Gauge, Repeat, type LucideIcon } from "lucide-react";

import type { ImagePlaceholderVariant } from "@/components/ui/ImagePlaceholder";
import type { Difficulty, Faceted, FilterGroupDef } from "@/data/types";

export type ProgramWeek = {
  week: number;
  /** Short name for the week's phase, e.g. "Accumulation". */
  title: string;
  focus: string;
  /** Prescribed effort for the week, e.g. "RPE 7 · 70% 1RM". */
  intensity: string;
  /** Overrides the program split when a week deviates from it. */
  sessions?: string[];
};

export type WorkoutExercise = {
  name: string;
  scheme: string;
  note?: string;
};

export type ProgramWorkout = {
  day: string;
  title: string;
  focus: string;
  duration: string;
  exercises: WorkoutExercise[];
};

export type Program = Faceted & {
  slug: string;
  title: string;
  summary: string;
  /** Long-form overview paragraphs shown on the detail page. */
  overview: string[];
  level: Difficulty;
  duration: string;
  frequency: string;
  equipmentLabel: string;
  sessionLength: string;
  goalLabels: string[];
  artwork: ImagePlaceholderVariant;
  outcomes: string[];
  /** Recurring session names that make up one training week. */
  split: string[];
  weeks: ProgramWeek[];
  workouts: ProgramWorkout[];
  featured?: boolean;
};

/** Filter groups rendered on /programs, in display order. */
export const programFilterGroups: FilterGroupDef[] = [
  {
    id: "goal",
    label: "Goal",
    options: [
      { value: "muscle-gain", label: "Muscle Gain" },
      { value: "fat-loss", label: "Fat Loss" },
      { value: "strength", label: "Strength" },
      { value: "endurance", label: "Endurance" },
      { value: "general-fitness", label: "General Fitness" },
    ],
  },
  {
    id: "experience",
    label: "Experience",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
  {
    id: "equipment",
    label: "Equipment",
    options: [
      { value: "no-equipment", label: "No Equipment" },
      { value: "dumbbells", label: "Dumbbells" },
      { value: "home-gym", label: "Home Gym" },
      { value: "full-gym", label: "Full Gym" },
    ],
  },
  {
    id: "duration",
    label: "Duration",
    options: [
      { value: "10-20", label: "10–20 min" },
      { value: "20-40", label: "20–40 min" },
      { value: "40-60", label: "40–60 min" },
      { value: "60-plus", label: "60+ min" },
    ],
  },
];

/** Icons used for program meta rows, kept beside the data they label. */
export const programMetaIcons = {
  duration: CalendarDays,
  level: Gauge,
  frequency: Repeat,
  equipment: Dumbbell,
} satisfies Record<"duration" | "level" | "frequency" | "equipment", LucideIcon>;

export const programs: Program[] = [
  {
    slug: "power-build",
    title: "Power Build",
    summary:
      "Heavy compound strength paired with hypertrophy volume for size and power.",
    overview: [
      "Power Build runs a classic strength-then-size structure: two heavy days anchored by the squat, bench and deadlift, followed by three volume days that chase the growth those heavy lifts earn you.",
      "Loads are auto-regulated with RPE, so a bad night of sleep never derails the block. You log the top set, the app scales the back-off work, and you keep progressing without grinding yourself into the floor.",
    ],
    level: "Intermediate",
    duration: "12 Weeks",
    frequency: "5 Days / Week",
    equipmentLabel: "Full Gym",
    sessionLength: "60–75 min",
    goalLabels: ["Muscle Gain", "Strength"],
    artwork: "program",
    outcomes: [
      "Add measurable weight to your squat, bench and deadlift",
      "Build visible size across chest, back and shoulders",
      "Learn to auto-regulate load with RPE instead of guessing",
      "Finish the block knowing exactly what your next one should be",
    ],
    split: ["Upper Power", "Lower Power", "Push Volume", "Pull Volume", "Legs & Core"],
    weeks: [
      { week: 1, title: "Calibration", focus: "Find honest top-set loads", intensity: "RPE 7" },
      { week: 2, title: "Accumulation", focus: "Add a set to every main lift", intensity: "RPE 7.5" },
      { week: 3, title: "Accumulation", focus: "Volume peak for the block", intensity: "RPE 8" },
      { week: 4, title: "Deload", focus: "Half the sets, keep the speed", intensity: "RPE 6", sessions: ["Upper Flush", "Lower Flush", "Mobility"] },
      { week: 5, title: "Intensification", focus: "Heavier top sets, tighter back-offs", intensity: "RPE 8" },
      { week: 6, title: "Intensification", focus: "First triple attempts", intensity: "RPE 8.5" },
      { week: 7, title: "Intensification", focus: "Hold volume, raise load", intensity: "RPE 8.5" },
      { week: 8, title: "Deload", focus: "Reset fatigue before the peak", intensity: "RPE 6", sessions: ["Upper Flush", "Lower Flush", "Mobility"] },
      { week: 9, title: "Peaking", focus: "Heavy doubles on main lifts", intensity: "RPE 9" },
      { week: 10, title: "Peaking", focus: "Singles at prescribed load", intensity: "RPE 9" },
      { week: 11, title: "Taper", focus: "Volume drops, sharpness stays", intensity: "RPE 8" },
      { week: 12, title: "Test", focus: "New one-rep maxes", intensity: "Max effort", sessions: ["Squat Test", "Bench Test", "Deadlift Test"] },
    ],
    workouts: [
      {
        day: "Day 1",
        title: "Upper Power",
        focus: "Chest · Back · Shoulders",
        duration: "70 min",
        exercises: [
          { name: "Barbell Bench Press", scheme: "4 × 5", note: "Top set @ RPE 8, then 3 back-offs at 85%" },
          { name: "Barbell Row", scheme: "4 × 6" },
          { name: "Overhead Press", scheme: "3 × 8" },
          { name: "Lat Pulldown", scheme: "3 × 10" },
          { name: "Cable Triceps Pushdown", scheme: "3 × 12" },
        ],
      },
      {
        day: "Day 2",
        title: "Lower Power",
        focus: "Quads · Hamstrings · Glutes",
        duration: "75 min",
        exercises: [
          { name: "Back Squat", scheme: "5 × 3", note: "Build to a heavy triple, then two back-off sets" },
          { name: "Romanian Deadlift", scheme: "4 × 6" },
          { name: "Leg Press", scheme: "3 × 10" },
          { name: "Hanging Leg Raise", scheme: "3 × 12" },
        ],
      },
      {
        day: "Day 3",
        title: "Push Volume",
        focus: "Chest · Shoulders · Triceps",
        duration: "60 min",
        exercises: [
          { name: "Incline Dumbbell Press", scheme: "4 × 10" },
          { name: "Dumbbell Lateral Raise", scheme: "4 × 15" },
          { name: "Close-Grip Bench Press", scheme: "3 × 10" },
          { name: "Push-Up", scheme: "2 × AMRAP", note: "Finisher — stop two reps short of failure" },
        ],
      },
    ],
    featured: true,
    facets: {
      goal: ["muscle-gain", "strength"],
      experience: ["intermediate"],
      equipment: ["full-gym"],
      duration: ["60-plus"],
    },
  },
  {
    slug: "lean-strong",
    title: "Lean & Strong",
    summary:
      "Keep your strength while you cut, with conditioning that never wrecks recovery.",
    overview: [
      "Most fat-loss plans strip away the strength you spent years building. Lean & Strong protects it: heavy work stays heavy, volume drops slightly, and the deficit does the rest.",
      "Each session closes with a short conditioning block — hard enough to matter, short enough that tomorrow's lifting session is unaffected.",
    ],
    level: "Intermediate",
    duration: "8 Weeks",
    frequency: "4 Days / Week",
    equipmentLabel: "Gym",
    sessionLength: "45–55 min",
    goalLabels: ["Fat Loss", "Muscle Gain"],
    artwork: "athlete",
    outcomes: [
      "Hold on to strength through a calorie deficit",
      "Improve work capacity without daily soreness",
      "Build a repeatable four-day week you can actually keep",
      "Finish leaner with your main lifts intact",
    ],
    split: ["Upper Strength", "Lower Strength", "Upper Volume", "Lower Volume"],
    weeks: [
      { week: 1, title: "Baseline", focus: "Set loads and conditioning pace", intensity: "RPE 7" },
      { week: 2, title: "Build", focus: "Add one conditioning round", intensity: "RPE 7.5" },
      { week: 3, title: "Build", focus: "Heavier strength doubles", intensity: "RPE 8" },
      { week: 4, title: "Deload", focus: "Cut volume by 40%", intensity: "RPE 6" },
      { week: 5, title: "Push", focus: "Density — shorter rest, same load", intensity: "RPE 8" },
      { week: 6, title: "Push", focus: "Top sets at week-3 loads for more reps", intensity: "RPE 8.5" },
      { week: 7, title: "Peak", focus: "Hardest conditioning of the block", intensity: "RPE 9" },
      { week: 8, title: "Consolidate", focus: "Retest strength, ease conditioning", intensity: "RPE 7" },
    ],
    workouts: [
      {
        day: "Day 1",
        title: "Upper Strength",
        focus: "Press · Pull · Finisher",
        duration: "50 min",
        exercises: [
          { name: "Barbell Bench Press", scheme: "5 × 4" },
          { name: "Chin-Up", scheme: "4 × 6", note: "Add load once you clear 8 clean reps" },
          { name: "Dumbbell Lateral Raise", scheme: "3 × 15" },
          { name: "Kettlebell Swing", scheme: "6 × 20s", note: "Conditioning finisher, 40s rest" },
        ],
      },
      {
        day: "Day 2",
        title: "Lower Strength",
        focus: "Squat · Hinge · Core",
        duration: "55 min",
        exercises: [
          { name: "Back Squat", scheme: "5 × 4" },
          { name: "Romanian Deadlift", scheme: "3 × 8" },
          { name: "Goblet Squat", scheme: "3 × 12" },
          { name: "Plank", scheme: "3 × 45s" },
        ],
      },
    ],
    featured: true,
    facets: {
      goal: ["fat-loss", "muscle-gain"],
      experience: ["intermediate"],
      equipment: ["full-gym", "home-gym"],
      duration: ["40-60"],
    },
  },
  {
    slug: "foundation",
    title: "Foundation",
    summary:
      "Learn the core lifts, build the habit and finish stronger than you started.",
    overview: [
      "Foundation is the first six weeks of training done properly. Three full-body sessions a week, six movement patterns, and enough repetition that the technique sticks.",
      "Every session is short by design. The goal of this block is not exhaustion — it is turning up three times a week, every week, and leaving with something learned.",
    ],
    level: "Beginner",
    duration: "6 Weeks",
    frequency: "3 Days / Week",
    equipmentLabel: "Home / Gym",
    sessionLength: "30–40 min",
    goalLabels: ["General Fitness", "Strength"],
    artwork: "generic",
    outcomes: [
      "Own the six fundamental movement patterns",
      "Build a training habit that survives a busy week",
      "Add your first real load to squat, hinge and press",
      "Walk into any gym knowing what to do",
    ],
    split: ["Full Body A", "Full Body B", "Full Body C"],
    weeks: [
      { week: 1, title: "Learn", focus: "Pattern practice with light load", intensity: "RPE 5" },
      { week: 2, title: "Learn", focus: "Same loads, cleaner reps", intensity: "RPE 6" },
      { week: 3, title: "Load", focus: "First meaningful weight jumps", intensity: "RPE 6.5" },
      { week: 4, title: "Load", focus: "Add a set to each main lift", intensity: "RPE 7" },
      { week: 5, title: "Build", focus: "Hold technique under heavier load", intensity: "RPE 7.5" },
      { week: 6, title: "Review", focus: "Retest every lift you started with", intensity: "RPE 8" },
    ],
    workouts: [
      {
        day: "Day 1",
        title: "Full Body A",
        focus: "Squat · Push · Pull",
        duration: "35 min",
        exercises: [
          { name: "Goblet Squat", scheme: "3 × 10" },
          { name: "Push-Up", scheme: "3 × 8", note: "Elevate your hands if reps get sloppy" },
          { name: "Lat Pulldown", scheme: "3 × 10" },
          { name: "Plank", scheme: "3 × 30s" },
        ],
      },
      {
        day: "Day 2",
        title: "Full Body B",
        focus: "Hinge · Press · Core",
        duration: "35 min",
        exercises: [
          { name: "Romanian Deadlift", scheme: "3 × 8" },
          { name: "Overhead Press", scheme: "3 × 8" },
          { name: "Dumbbell Curl", scheme: "2 × 12" },
          { name: "Hip Thrust", scheme: "3 × 12" },
        ],
      },
    ],
    featured: true,
    facets: {
      goal: ["general-fitness", "strength"],
      experience: ["beginner"],
      equipment: ["home-gym", "dumbbells", "full-gym"],
      duration: ["20-40"],
    },
  },
  {
    slug: "athlete",
    title: "Athlete",
    summary:
      "Speed, power and conditioning built on a heavy strength base for advanced lifters.",
    overview: [
      "Athlete is built for people who already lift well and now want to move well. Jumps and throws open every session, heavy strength work follows, and targeted conditioning closes it out.",
      "This is the most demanding block in the library. It expects a solid squat and deadlift, honest recovery habits, and five days a week you can genuinely commit to.",
    ],
    level: "Advanced",
    duration: "10 Weeks",
    frequency: "5 Days / Week",
    equipmentLabel: "Full Gym",
    sessionLength: "60–75 min",
    goalLabels: ["Strength", "Endurance"],
    artwork: "athlete",
    outcomes: [
      "Increase vertical jump and sprint acceleration",
      "Raise your strength ceiling without losing speed",
      "Build a conditioning base that holds up in the fourth quarter",
      "Move through a full training week without breaking down",
    ],
    split: ["Speed & Power", "Max Strength", "Lateral & Pull", "Repeat Power", "Engine"],
    weeks: [
      { week: 1, title: "Prepare", focus: "Low-volume plyos, submaximal lifts", intensity: "RPE 7" },
      { week: 2, title: "Prepare", focus: "Add contacts, keep quality", intensity: "RPE 7.5" },
      { week: 3, title: "Develop", focus: "Heavy strength, short sprints", intensity: "RPE 8" },
      { week: 4, title: "Develop", focus: "Peak plyometric contacts", intensity: "RPE 8" },
      { week: 5, title: "Deload", focus: "Movement quality only", intensity: "RPE 5", sessions: ["Mobility", "Tempo Run", "Light Full Body"] },
      { week: 6, title: "Express", focus: "Speed work against heavier bars", intensity: "RPE 8.5" },
      { week: 7, title: "Express", focus: "Contrast pairs — heavy then fast", intensity: "RPE 8.5" },
      { week: 8, title: "Express", focus: "Longest conditioning intervals", intensity: "RPE 9" },
      { week: 9, title: "Sharpen", focus: "Drop volume, hold intensity", intensity: "RPE 8" },
      { week: 10, title: "Test", focus: "Jump, sprint and strength retest", intensity: "Max effort", sessions: ["Jump Test", "Sprint Test", "Strength Test"] },
    ],
    workouts: [
      {
        day: "Day 1",
        title: "Speed & Power",
        focus: "Jumps · Squat · Sprint",
        duration: "70 min",
        exercises: [
          { name: "Box Jump", scheme: "5 × 3", note: "Full rest — every rep is a maximal effort" },
          { name: "Back Squat", scheme: "5 × 3" },
          { name: "Hip Thrust", scheme: "4 × 6" },
          { name: "Hanging Leg Raise", scheme: "3 × 10" },
        ],
      },
      {
        day: "Day 4",
        title: "Repeat Power",
        focus: "Contrast pairs · Carries",
        duration: "65 min",
        exercises: [
          { name: "Kettlebell Swing", scheme: "6 × 8", note: "Paired with a 10m sprint" },
          { name: "Close-Grip Bench Press", scheme: "4 × 5" },
          { name: "Barbell Row", scheme: "4 × 8" },
          { name: "Plank", scheme: "3 × 60s" },
        ],
      },
    ],
    facets: {
      goal: ["strength", "endurance"],
      experience: ["advanced"],
      equipment: ["full-gym"],
      duration: ["60-plus"],
    },
  },
  {
    slug: "home-reset",
    title: "Home Reset",
    summary:
      "Four weeks of short bodyweight sessions to restart training from your living room.",
    overview: [
      "No gym, no equipment, no excuses about the commute. Home Reset uses tempo, range of motion and short rest to make bodyweight work genuinely hard.",
      "Sessions are capped at twenty minutes. The point is to rebuild the habit first and let the intensity climb once turning up is automatic again.",
    ],
    level: "Beginner",
    duration: "4 Weeks",
    frequency: "4 Days / Week",
    equipmentLabel: "No Equipment",
    sessionLength: "15–20 min",
    goalLabels: ["General Fitness", "Fat Loss"],
    artwork: "generic",
    outcomes: [
      "Rebuild a consistent four-day training week",
      "Improve push-up and squat endurance",
      "Raise your resting work capacity without any kit",
      "Create a base that transfers straight into Foundation",
    ],
    split: ["Push Circuit", "Lower Circuit", "Core & Carry", "Full Body Flow"],
    weeks: [
      { week: 1, title: "Restart", focus: "Two rounds, generous rest", intensity: "RPE 6" },
      { week: 2, title: "Extend", focus: "Three rounds at the same tempo", intensity: "RPE 7" },
      { week: 3, title: "Compress", focus: "Same work, 30% less rest", intensity: "RPE 8" },
      { week: 4, title: "Finish", focus: "Timed test of every circuit", intensity: "RPE 8.5" },
    ],
    workouts: [
      {
        day: "Day 1",
        title: "Push Circuit",
        focus: "Chest · Shoulders · Triceps",
        duration: "18 min",
        exercises: [
          { name: "Push-Up", scheme: "3 × 10", note: "3-second lowering on every rep" },
          { name: "Plank", scheme: "3 × 40s" },
          { name: "Goblet Squat", scheme: "3 × 15", note: "Hold any household weight, or none" },
        ],
      },
    ],
    facets: {
      goal: ["general-fitness", "fat-loss"],
      experience: ["beginner"],
      equipment: ["no-equipment"],
      duration: ["10-20"],
    },
  },
  {
    slug: "dumbbell-engine",
    title: "Dumbbell Engine",
    summary:
      "One pair of dumbbells, eight weeks, and a noticeably bigger aerobic engine.",
    overview: [
      "Built for a single adjustable pair of dumbbells. Strength work is kept simple so the conditioning can carry the load — intervals, complexes and steady work rotated across the week.",
      "By week eight you will be holding paces that felt unsustainable in week one, and carrying more muscle through it.",
    ],
    level: "Intermediate",
    duration: "8 Weeks",
    frequency: "4 Days / Week",
    equipmentLabel: "Dumbbells",
    sessionLength: "25–35 min",
    goalLabels: ["Endurance", "Fat Loss"],
    artwork: "program",
    outcomes: [
      "Raise your aerobic ceiling with minimal equipment",
      "Hold technique while breathing hard",
      "Train four days a week in under 35 minutes",
      "Keep muscle while conditioning improves",
    ],
    split: ["Complex Day", "Strength Day", "Interval Day", "Steady Day"],
    weeks: [
      { week: 1, title: "Assess", focus: "Set paces and dumbbell loads", intensity: "RPE 6" },
      { week: 2, title: "Extend", focus: "Longer work intervals", intensity: "RPE 7" },
      { week: 3, title: "Extend", focus: "Add a complex round", intensity: "RPE 7.5" },
      { week: 4, title: "Deload", focus: "Halve the intervals", intensity: "RPE 5" },
      { week: 5, title: "Sharpen", focus: "Shorter rest between rounds", intensity: "RPE 8" },
      { week: 6, title: "Sharpen", focus: "Heavier complexes", intensity: "RPE 8" },
      { week: 7, title: "Overload", focus: "Longest steady session", intensity: "RPE 8.5" },
      { week: 8, title: "Retest", focus: "Repeat week 1 at new loads", intensity: "RPE 9" },
    ],
    workouts: [
      {
        day: "Day 1",
        title: "Complex Day",
        focus: "Full body · Unbroken rounds",
        duration: "30 min",
        exercises: [
          { name: "Goblet Squat", scheme: "5 × 8", note: "Unbroken with the next two movements" },
          { name: "Romanian Deadlift", scheme: "5 × 8" },
          { name: "Overhead Press", scheme: "5 × 8" },
          { name: "Kettlebell Swing", scheme: "5 × 15", note: "Substitute a single dumbbell" },
        ],
      },
    ],
    facets: {
      goal: ["endurance", "fat-loss"],
      experience: ["intermediate"],
      equipment: ["dumbbells"],
      duration: ["20-40"],
    },
  },
];

export const featuredPrograms = programs.filter((program) => program.featured);

export function getProgram(slug: string): Program | undefined {
  return programs.find((program) => program.slug === slug);
}

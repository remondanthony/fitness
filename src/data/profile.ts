import {
  Bell,
  CalendarDays,
  Dumbbell,
  Lock,
  Settings2,
  Target,
  User,
  type LucideIcon,
} from "lucide-react";

/**
 * Training preferences shown on the profile.
 *
 * Identity (name, email) now comes from the real Supabase session — it is
 * deliberately absent here. These remaining fields are still sample data;
 * Part 12 replaces them with the member's own records.
 */
export type Profile = {
  plan: string;
  /** Current goal, matching the goals offered on the homepage. */
  goal: string;
  trainingLevel: string;
  preferredEquipment: string;
  weeklyFrequency: string;
  /** Slug of the program they are currently running. */
  currentProgramSlug: string;
};

export const profile: Profile = {
  plan: "Pro",
  goal: "Build Muscle",
  trainingLevel: "Intermediate",
  preferredEquipment: "Full Gym",
  weeklyFrequency: "5 days / week",
  currentProgramSlug: "power-build",
};

export type ProfileDetail = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  hint: string;
};

export const profileDetails: ProfileDetail[] = [
  {
    id: "goal",
    label: "Current Goal",
    value: profile.goal,
    icon: Target,
    hint: "Drives program and nutrition recommendations",
  },
  {
    id: "level",
    label: "Training Level",
    value: profile.trainingLevel,
    icon: Dumbbell,
    hint: "Sets the starting difficulty of new programs",
  },
  {
    id: "equipment",
    label: "Preferred Equipment",
    value: profile.preferredEquipment,
    icon: Settings2,
    hint: "Filters the programs you are shown",
  },
  {
    id: "frequency",
    label: "Weekly Training Frequency",
    value: profile.weeklyFrequency,
    icon: CalendarDays,
    hint: "How many sessions a week the plan schedules",
  },
];

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export type SettingsSectionId = "account" | "preferences" | "notifications" | "privacy";

export const settingsSections: {
  id: SettingsSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "account",
    label: "Account",
    description: "Your name, email and password.",
    icon: User,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "How training is planned and measured for you.",
    icon: Settings2,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "What we contact you about, and when.",
    icon: Bell,
  },
  {
    id: "privacy",
    label: "Privacy",
    description: "Who can see your training and what data is used.",
    icon: Lock,
  },
];

/** Option sets shared by the profile and settings forms. */
export const goalOptions = [
  { value: "build-muscle", label: "Build Muscle" },
  { value: "lose-fat", label: "Lose Fat" },
  { value: "get-stronger", label: "Get Stronger" },
  { value: "improve-fitness", label: "Improve Fitness" },
  { value: "improve-wellness", label: "Improve Wellness" },
  { value: "live-healthier", label: "Live Healthier" },
];

export const levelOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const equipmentOptions = [
  { value: "no-equipment", label: "No Equipment" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "home-gym", label: "Home Gym" },
  { value: "full-gym", label: "Full Gym" },
];

export const frequencyOptions = [
  { value: "2", label: "2 days / week" },
  { value: "3", label: "3 days / week" },
  { value: "4", label: "4 days / week" },
  { value: "5", label: "5 days / week" },
  { value: "6", label: "6 days / week" },
];

export const unitOptions = [
  { value: "metric", label: "Metric (kg, cm)" },
  { value: "imperial", label: "Imperial (lb, ft)" },
];

export type ToggleSetting = {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
};

export const notificationSettings: ToggleSetting[] = [
  {
    id: "workout-reminders",
    label: "Workout reminders",
    description: "A nudge on the mornings you have a session scheduled.",
    defaultOn: true,
  },
  {
    id: "weekly-summary",
    label: "Weekly summary",
    description: "Sunday recap of your sessions, volume and streak.",
    defaultOn: true,
  },
  {
    id: "coach-messages",
    label: "Coach messages",
    description: "Email me when a coach replies to a check-in.",
    defaultOn: true,
  },
  {
    id: "product-updates",
    label: "Product updates",
    description: "Occasional notes about new programs and features.",
    defaultOn: false,
  },
];

export const privacySettings: ToggleSetting[] = [
  {
    id: "public-profile",
    label: "Public profile",
    description: "Let other members see your name and training level.",
    defaultOn: false,
  },
  {
    id: "share-with-coach",
    label: "Share progress with my coach",
    description: "Give your coach access to logs, weight and recovery data.",
    defaultOn: true,
  },
  {
    id: "leaderboards",
    label: "Appear in challenges",
    description: "Include me in challenge leaderboards and rankings.",
    defaultOn: false,
  },
  {
    id: "usage-analytics",
    label: "Usage analytics",
    description: "Help improve the app with anonymous usage data.",
    defaultOn: true,
  },
];

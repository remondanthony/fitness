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
  /** Slug of the program they are currently running. */
  currentProgramSlug: string;
};

export const profile: Profile = {
  currentProgramSlug: "power-build",
};

/** Labels and hints for the profile's training cards. Values come from the database. */
export const profileDetailMeta = {
  goal: {
    id: "goal",
    label: "Current Goal",
    icon: Target,
    hint: "Drives program and nutrition recommendations",
  },
  level: {
    id: "level",
    label: "Training Level",
    icon: Dumbbell,
    hint: "Sets the starting difficulty of new programs",
  },
  equipment: {
    id: "equipment",
    label: "Preferred Equipment",
    icon: Settings2,
    hint: "Filters the programs you are shown",
  },
  frequency: {
    id: "frequency",
    label: "Weekly Training Frequency",
    icon: CalendarDays,
    hint: "How many sessions a week the plan schedules",
  },
} as const;

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export type SettingsSectionId =
  | "account"
  | "preferences"
  | "notifications"
  | "privacy";

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

/**
 * Option sets for the profile and settings forms.
 *
 * These are re-exported from the personalization contract rather than
 * redeclared, so settings, onboarding and the Server Actions all offer the
 * same values as the database CHECK constraints allow.
 */
export {
  goalOptions,
  levelOptions,
  equipmentOptions,
  unitOptions,
  trainingDayOptions as frequencyOptions,
} from "@/lib/personalization";

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

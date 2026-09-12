import {
  Activity,
  Dumbbell,
  Flame,
  HeartPulse,
  Leaf,
  MoonStar,
  Salad,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Metric = { value: string; label: string; icon: LucideIcon };

export const heroMetrics: Metric[] = [
  { value: "10K+", label: "Active Members", icon: Users },
  { value: "150+", label: "Programs", icon: Dumbbell },
  { value: "50+", label: "Expert Coaches", icon: HeartPulse },
  { value: "4.9/5", label: "Member Rating", icon: Star },
];

export type Pillar = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const pillars: Pillar[] = [
  {
    id: "train",
    title: "Train",
    description:
      "Structured programs and workouts designed around your goals.",
    icon: Dumbbell,
  },
  {
    id: "eat",
    title: "Eat",
    description: "Simple nutrition guidance and meal planning.",
    icon: Salad,
  },
  {
    id: "recover",
    title: "Recover",
    description:
      "Mobility, sleep and recovery tools to help you perform better.",
    icon: MoonStar,
  },
];

export type Goal = { id: string; title: string; icon: LucideIcon };

export const goals: Goal[] = [
  { id: "build-muscle", title: "Build Muscle", icon: Dumbbell },
  { id: "lose-fat", title: "Lose Fat", icon: Flame },
  { id: "get-stronger", title: "Get Stronger", icon: TrendingUp },
  { id: "improve-fitness", title: "Improve Fitness", icon: Activity },
  { id: "improve-wellness", title: "Improve Wellness", icon: Leaf },
  { id: "live-healthier", title: "Live Healthier", icon: HeartPulse },
];

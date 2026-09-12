import { Crown, Dumbbell, Sparkles, type LucideIcon } from "lucide-react";

export type Plan = {
  id: string;
  name: string;
  price: string;
  /** Suffix shown next to the price, e.g. "/month". */
  period?: string;
  /** Short line under the price. */
  billingNote: string;
  description: string;
  features: string[];
  cta: string;
  icon: LucideIcon;
  recommended?: boolean;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    billingNote: "Free forever · No card required",
    description: "Everything you need to train properly on your own.",
    features: [
      "Exercise library",
      "Basic workouts",
      "Basic progress tracking",
      "Educational content",
    ],
    cta: "Start Free",
    icon: Dumbbell,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    period: "/month",
    billingNote: "Billed monthly · Cancel anytime",
    description: "The whole platform — programming, nutrition and recovery in one place.",
    features: [
      "Full programs",
      "Advanced tracking",
      "Nutrition plans",
      "Wellness dashboard",
      "Challenges",
    ],
    cta: "Choose Pro",
    icon: Sparkles,
    recommended: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "₹1,499",
    period: "/month",
    billingNote: "Billed monthly · Cancel anytime",
    description: "Pro, plus a coach who reads your logs and adjusts the plan.",
    features: [
      "Everything in Pro",
      "Personalized programs",
      "Coach access",
      "Monthly consultation",
      "Advanced progress analysis",
    ],
    cta: "Choose Elite",
    icon: Crown,
  },
];

/** Short reassurance points shown under the plan grid. */
export const pricingNotes = [
  "Switch or cancel your plan at any time",
  "Every plan includes the full exercise library",
  "Prices shown in INR, inclusive of tax",
];

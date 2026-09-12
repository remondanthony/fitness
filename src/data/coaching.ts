import {
  Activity,
  BicepsFlexed,
  CalendarCheck,
  Flame,
  Gauge,
  Home,
  ListChecks,
  Target,
  Timer,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { ImagePlaceholderVariant } from "@/components/ui/ImagePlaceholder";

export type Principle = {
  title: string;
  body: string;
};

export type Testimonial = {
  id: string;
  name: string;
  context: string;
  quote: string;
  rating: number;
};

export type Coach = {
  slug: string;
  name: string;
  /** Headline specialty shown on the card. */
  specialty: string;
  yearsExperience: number;
  rating: number;
  clients: number;
  location: string;
  availability: string;
  artwork: ImagePlaceholderVariant;
  /** One-line summary for the card. */
  tagline: string;
  bio: string[];
  specialties: { label: string; icon: LucideIcon }[];
  philosophy: Principle[];
  credentials: string[];
  /** Slugs from the programs catalogue. */
  programSlugs: string[];
  testimonials: Testimonial[];
};

export const coaches: Coach[] = [
  {
    slug: "alex-carter",
    name: "Alex Carter",
    specialty: "Strength & Hypertrophy",
    yearsExperience: 8,
    rating: 4.9,
    clients: 240,
    location: "Remote · UK",
    availability: "Taking 3 new clients this month",
    artwork: "coach",
    tagline:
      "Works with intermediate lifters who have stalled and want their numbers moving again.",
    bio: [
      "Alex spent six years on commercial gym floors before moving to online coaching full time. Most of his clients arrive after a year or two of training on their own, strong enough to be dangerous and stuck somewhere in the middle.",
      "His work is mostly unglamorous: fixing the setup, capping the junk volume, and making the heavy days genuinely heavy. Clients usually notice the first change in how their warm-up sets feel.",
    ],
    specialties: [
      { label: "Squat, bench and deadlift technique", icon: BicepsFlexed },
      { label: "Hypertrophy programming", icon: TrendingUp },
      { label: "Peaking for a meet", icon: Target },
      { label: "Training around a full week", icon: CalendarCheck },
    ],
    philosophy: [
      {
        title: "Earn the load before you chase it",
        body: "If the rep quality falls apart at 80%, adding weight only hides the problem. We fix the position first, then add plates.",
      },
      {
        title: "Volume is a tool, not a badge",
        body: "More sets are useful right up until they stop being recoverable. We use the least volume that still drives progress.",
      },
      {
        title: "The plan survives contact with real life",
        body: "A four-day week you complete beats a six-day week you abandon in March.",
      },
    ],
    credentials: [
      "8 years coaching, 240+ clients",
      "Competitive powerlifter since 2016",
      "Strength & conditioning certified",
    ],
    programSlugs: ["power-build", "foundation"],
    testimonials: [
      {
        id: "alex-1",
        name: "Marcus T.",
        context: "12 weeks · Power Build",
        quote:
          "I had not moved my squat in eighteen months. Alex cut my weekly sets by a third and it went up 15 kg. I was annoyed about how simple the fix was.",
        rating: 5,
      },
      {
        id: "alex-2",
        name: "Priya S.",
        context: "6 months · Custom programming",
        quote:
          "He actually reads the logs. Every check-in came back with two or three specific notes, never a copy-paste.",
        rating: 5,
      },
    ],
  },
  {
    slug: "sarah-morgan",
    name: "Sarah Morgan",
    specialty: "Fat Loss & Conditioning",
    yearsExperience: 6,
    rating: 4.8,
    clients: 310,
    location: "Remote · Singapore",
    availability: "Waitlist — next intake in 2 weeks",
    artwork: "coach",
    tagline:
      "Builds deficits people can actually hold, with conditioning that does not wreck the lifting.",
    bio: [
      "Sarah works almost entirely with people who have dieted before and did not enjoy how it went. Her approach is slower than most, and the weight tends to stay off afterwards.",
      "She is equally comfortable programming for a full gym or a pair of dumbbells in a spare room, which is where a good number of her clients train.",
    ],
    specialties: [
      { label: "Sustainable calorie deficits", icon: Flame },
      { label: "Conditioning that protects strength", icon: Activity },
      { label: "Habit and adherence coaching", icon: ListChecks },
      { label: "Home and minimal equipment setups", icon: Home },
    ],
    philosophy: [
      {
        title: "The deficit you can hold beats the one you can't",
        body: "An aggressive cut you quit in three weeks moves you backwards. We aim for a pace you barely notice.",
      },
      {
        title: "Conditioning should not cost you strength",
        body: "Short, hard and early in the week, so Thursday's session is unaffected.",
      },
      {
        title: "Track what you will actually track",
        body: "Two honest data points beat six you abandon by Wednesday.",
      },
    ],
    credentials: [
      "6 years coaching, 310+ clients",
      "Nutrition coaching certified",
      "Former endurance athlete",
    ],
    programSlugs: ["lean-strong", "dumbbell-engine", "home-reset"],
    testimonials: [
      {
        id: "sarah-1",
        name: "Dan K.",
        context: "8 weeks · Lean & Strong",
        quote:
          "Lost 6 kg and my bench went up. I had assumed those two things could not happen in the same block.",
        rating: 5,
      },
      {
        id: "sarah-2",
        name: "Amara O.",
        context: "4 months · Home training",
        quote:
          "Two dumbbells and a bench in my garage. She never once suggested I needed anything else.",
        rating: 5,
      },
    ],
  },
  {
    slug: "daniel-brooks",
    name: "Daniel Brooks",
    specialty: "Athletic Performance",
    yearsExperience: 10,
    rating: 5,
    clients: 180,
    location: "Remote · Australia",
    availability: "Open for pre-season blocks",
    artwork: "coach",
    tagline:
      "Ten years with field-sport athletes. Speed first, strength underneath it, conditioning last.",
    bio: [
      "Daniel came up through team environments, where the training has to fit around matches, travel and whatever the coaching staff decided that morning. That constraint shaped how he programs.",
      "He works with competitive athletes and with people who simply want to move like one again — the structure is the same, only the volume changes.",
    ],
    specialties: [
      { label: "Speed and power development", icon: Zap },
      { label: "Jump and sprint mechanics", icon: Gauge },
      { label: "In-season maintenance", icon: Timer },
      { label: "Strength for field sports", icon: BicepsFlexed },
    ],
    philosophy: [
      {
        title: "Fast is a skill",
        body: "Sprinting and jumping are practised fresh and in small doses, never used as a conditioning finisher.",
      },
      {
        title: "Strength is the base, not the goal",
        body: "We build enough of it to express power, then spend the rest of the time learning to express it quickly.",
      },
      {
        title: "Manage the week, not the session",
        body: "Any single day can be moved. What matters is the total load across seven of them.",
      },
    ],
    credentials: [
      "10 years coaching, 180+ athletes",
      "Accredited strength & conditioning coach",
      "Worked across two national league programmes",
    ],
    programSlugs: ["athlete"],
    testimonials: [
      {
        id: "daniel-1",
        name: "Jordan M.",
        context: "10 weeks · Athlete",
        quote:
          "Vertical up 6 cm and I finished the season without the usual late-year drop-off. The weekly structure was the difference.",
        rating: 5,
      },
      {
        id: "daniel-2",
        name: "Chris L.",
        context: "Pre-season block",
        quote:
          "He moved sessions around our fixture list every single week without ever losing the thread of the plan.",
        rating: 5,
      },
    ],
  },
];

export function getCoach(slug: string): Coach | undefined {
  return coaches.find((coach) => coach.slug === slug);
}

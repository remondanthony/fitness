import { HeartPulse, Microscope, Scale, type LucideIcon } from "lucide-react";

export type Principle = {
  title: string;
  body: string;
  icon: LucideIcon;
};

export const principles: Principle[] = [
  {
    title: "Programming over motivation",
    body: "A plan you can follow on a bad week beats one that only works when you feel great. Everything here is built to survive a busy month.",
    icon: Scale,
  },
  {
    title: "Evidence, not trends",
    body: "Our programs stick to what holds up: progressive overload, adequate protein, enough sleep. No detoxes, no shortcuts, no miracle claims.",
    icon: Microscope,
  },
  {
    title: "Training is one part of it",
    body: "Nutrition and recovery sit alongside the workouts rather than behind a separate paywall, because they decide how the training goes.",
    icon: HeartPulse,
  },
];

/** Sections rendered by the legal pages. */
export type LegalSection = {
  heading: string;
  body: string[];
};

export const privacySections: LegalSection[] = [
  {
    heading: "What this covers",
    body: [
      "STRONGER is a demonstration product. This page describes the approach we would take to handling member data, written so it can be reviewed before anything is collected.",
      "No accounts exist yet and no personal data is transmitted or stored on a server. Anything you enter in the app stays in your own browser.",
    ],
  },
  {
    heading: "Data we would collect",
    body: [
      "Account details you provide: name, email address and your training preferences.",
      "Training data you log: workouts completed, weights and reps, bodyweight entries and the wellness figures you choose to record.",
      "Basic technical data needed to run the service, such as the device and browser used to access it.",
    ],
  },
  {
    heading: "How it would be used",
    body: [
      "To generate your programs, targets and progress views, and to keep your training history available across devices.",
      "We would not sell member data, and we would not share training or health information with advertisers.",
    ],
  },
  {
    heading: "Your control",
    body: [
      "You would be able to export your training history, correct your details, or delete your account and its data permanently from the settings page.",
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    heading: "About these terms",
    body: [
      "STRONGER is a demonstration product and is not currently offered as a commercial service. No payment is taken and no contract is formed by using it.",
      "These terms describe the arrangement that would apply once the product is available.",
    ],
  },
  {
    heading: "Using the service",
    body: [
      "Membership is personal to you. Programs, exercise content and coaching material are provided for your own training and may not be redistributed.",
      "Plans can be changed or cancelled at any time, and cancellation takes effect at the end of the billing period.",
    ],
  },
  {
    heading: "Training safely",
    body: [
      "The programs, targets and calorie estimates here are general fitness guidance, not medical advice, and they are not tailored to any medical condition.",
      "Speak to a qualified professional before starting a new program if you have an injury, a health condition, or any doubt about whether an exercise is appropriate for you. Stop if something hurts.",
    ],
  },
  {
    heading: "Content and accuracy",
    body: [
      "Figures shown across the product — member counts, progress charts, personal records and coach profiles — are demonstration data, not real member records.",
    ],
  },
];

/** Single source of truth for site navigation, shared by the navbar and footer. */

import { LayoutDashboard, User, type LucideIcon } from "lucide-react";

export type NavLink = { label: string; href: string };

export const primaryNav: NavLink[] = [
  { label: "Programs", href: "/programs" },
  { label: "Exercises", href: "/exercises" },
  { label: "Nutrition", href: "/nutrition" },
  { label: "Wellness", href: "/wellness" },
  { label: "Coaching", href: "/coaching" },
  { label: "Pricing", href: "/pricing" },
];

/** Signed-in areas, reachable from the navbar's right-hand cluster. */
export const appNav: (NavLink & { icon: LucideIcon })[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: User },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Fitness",
    links: [
      { label: "Programs", href: "/programs" },
      { label: "Exercises", href: "/exercises" },
      { label: "Workouts", href: "/workouts" },
    ],
  },
  {
    title: "Wellness",
    links: [
      { label: "Nutrition", href: "/nutrition" },
      { label: "Recovery", href: "/recovery" },
      { label: "Wellness", href: "/wellness" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Coaching", href: "/coaching" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

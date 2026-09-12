import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "STRONGER — Fitness & Wellness",
    template: "%s | STRONGER",
  },
  description:
    "Personalized training, nutrition and wellness programs designed around your goals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="bg-ink-950 text-chalk flex min-h-full flex-col">{children}</body>
    </html>
  );
}

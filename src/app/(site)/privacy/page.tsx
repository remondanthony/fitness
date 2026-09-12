import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";
import { privacySections } from "@/data/company";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How STRONGER handles member accounts, training data and privacy.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy."
      description="What we would collect, why, and what you can do about it."
      updated="September 2026"
      sections={privacySections}
    />
  );
}

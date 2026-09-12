import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";
import { termsSections } from "@/data/company";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that apply to using STRONGER, including training safety.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms."
      description="The arrangement between you and STRONGER, in plain language."
      updated="September 2026"
      sections={termsSections}
    />
  );
}

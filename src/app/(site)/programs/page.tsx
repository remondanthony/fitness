import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { ProgramExplorer } from "@/components/programs/ProgramExplorer";
import { programs } from "@/data/programs";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Structured programs designed to help you train consistently and make measurable progress.",
};

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Programs"
        title="Train With Purpose."
        description="Structured programs designed to help you train consistently and make measurable progress."
      />

      <section className="py-14 lg:py-20">
        <Container>
          <ProgramExplorer programs={programs} />
        </Container>
      </section>
    </>
  );
}

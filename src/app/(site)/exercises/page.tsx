import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { ExerciseExplorer } from "@/components/exercises/ExerciseExplorer";
import { exercises } from "@/data/exercises";

export const metadata: Metadata = {
  title: "Exercise Library",
  description:
    "Technique breakdowns, common mistakes and set-and-rep guidance for every movement in the library.",
};

export default function ExercisesPage() {
  return (
    <>
      <PageHero
        eyebrow="Exercise Library"
        title="Master Every Movement."
        description="Technique breakdowns, common mistakes and set-and-rep guidance for every movement we program."
      />

      <section className="py-14 lg:py-20">
        <Container>
          <ExerciseExplorer exercises={exercises} />
        </Container>
      </section>
    </>
  );
}

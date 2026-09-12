import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { featuredPrograms } from "@/data/programs";

export function ProgramPreview() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="Programs"
          title="Train With Purpose."
          description="Every program is periodised, coach-built and adjusts to the equipment you actually have."
          action={
            <Button href="/programs" variant="secondary" className="hidden md:inline-flex">
              Browse All Programs
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                aria-hidden="true"
              />
            </Button>
          }
        />

        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredPrograms.map((program) => (
            <li key={program.slug}>
              <ProgramCard program={program} variant="preview" />
            </li>
          ))}
        </ul>

        <div className="mt-10 md:hidden">
          <Button href="/programs" variant="secondary" className="w-full">
            Browse All Programs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </Container>
    </section>
  );
}

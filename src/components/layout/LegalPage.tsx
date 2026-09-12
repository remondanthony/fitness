import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import type { LegalSection } from "@/data/company";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

/** Shared layout for the privacy and terms pages. */
export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  sections,
}: LegalPageProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} />

      <section className="py-14 lg:py-20">
        <Container size="md">
          <p className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
            Last updated {updated}
          </p>

          <div className="mt-10 flex flex-col gap-10">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-chalk text-2xl sm:text-3xl">
                  {section.heading}
                </h2>
                <div className="mt-5 flex flex-col gap-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-mist text-sm leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

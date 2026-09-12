import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pillars } from "@/lib/content";

export function Pillars() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="The System"
          title={
            <>
              Everything You Need
              <br className="hidden sm:block" /> To Become Stronger
            </>
          }
          description="Three pillars, one platform. Train with intent, fuel it properly and recover hard enough to do it again tomorrow."
        />

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <li key={pillar.id}>
              <Card interactive className="group flex h-full flex-col p-8">
                <span
                  className="font-display text-chalk/5 group-hover:text-accent-500/15 absolute top-4 right-6 text-7xl transition-colors duration-300"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="border-accent-500/25 bg-accent-500/10 text-accent-400 group-hover:border-accent-500/50 group-hover:bg-accent-500 inline-flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors duration-300 group-hover:text-white">
                  <pillar.icon className="h-6 w-6" aria-hidden="true" />
                </span>

                <h3 className="font-display text-chalk mt-8 text-3xl">{pillar.title}</h3>
                <p className="text-mist mt-4 text-[15px] leading-relaxed">
                  {pillar.description}
                </p>

                <span className="flex-1" aria-hidden="true" />

                <span
                  className="bg-chalk/8 group-hover:bg-accent-500/60 mt-8 block h-px w-full transition-colors duration-300"
                  aria-hidden="true"
                />
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

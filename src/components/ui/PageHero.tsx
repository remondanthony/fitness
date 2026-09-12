import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Rendered under the description — breadcrumbs, badges, CTAs. */
  children?: ReactNode;
  /** Slot above the heading, e.g. Breadcrumbs. */
  above?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

/** Interior-page header band. Reuses the homepage heading hierarchy and glow. */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  above,
  align = "left",
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "border-chalk/8 relative overflow-hidden border-b pt-10 pb-14 lg:pt-14 lg:pb-20",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_20%,transparent_78%)]" />
        <div className="bg-accent-500/15 absolute -top-52 left-1/4 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full blur-[140px]" />
      </div>

      <Container>
        {above ? <div className="mb-8">{above}</div> : null}
        <SectionHeading
          as="h1"
          size="xl"
          align={align}
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </section>
  );
}

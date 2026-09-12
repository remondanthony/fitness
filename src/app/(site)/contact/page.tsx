import { LifeBuoy, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/layout/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the STRONGER team about the app, coaching or plans.",
};

const routes = [
  {
    icon: LifeBuoy,
    title: "Help with the app",
    body: "Something not working as expected? Send the details and we will take a look.",
  },
  {
    icon: Users,
    title: "Coaching",
    body: "Questions about working with a coach, or which of them fits your goal.",
    href: "/coaching",
    linkLabel: "Meet the coaches",
  },
  {
    icon: MessageSquare,
    title: "Plans and billing",
    body: "Anything about what each membership level includes.",
    href: "/pricing",
    linkLabel: "See pricing",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get In Touch."
        description="Questions about training, coaching or your account — send them over and we'll come back to you."
      />

      <section className="py-14 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
                Send A Message
              </h2>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>

            <div className="lg:col-span-5">
              <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
                What We Can Help With
              </h2>

              <ul className="mt-6 flex flex-col gap-4">
                {routes.map((route) => (
                  <li key={route.title}>
                    <Card tone="raised" className="flex gap-4 p-5">
                      <span className="border-accent-500/25 bg-accent-500/10 text-accent-400 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                        <route.icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-chalk text-sm font-semibold">{route.title}</h3>
                        <p className="text-mist mt-1.5 text-xs leading-relaxed">
                          {route.body}
                        </p>
                        {route.href ? (
                          <Link
                            href={route.href}
                            className="text-accent-400 hover:text-accent-300 mt-3 inline-block py-1 text-xs font-semibold transition-colors"
                          >
                            {route.linkLabel} →
                          </Link>
                        ) : null}
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

import Link from "next/link";
import { AtSign, Camera, Podcast, Video } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { footerNav } from "@/lib/navigation";

const socials = [
  { label: "Instagram", href: "https://instagram.com", icon: Camera },
  { label: "YouTube", href: "https://youtube.com", icon: Video },
  { label: "X", href: "https://x.com", icon: AtSign },
  { label: "Podcast", href: "https://open.spotify.com", icon: Podcast },
];

/** Global footer: wordmark, promise line, sitemap columns and social links. */
export function Footer() {
  return (
    <footer className="border-chalk/8 bg-ink-950 relative border-t">
      <div
        className="from-accent-500/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r via-transparent to-transparent"
        aria-hidden="true"
      />

      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo />
            <p className="font-display text-chalk mt-6 text-2xl leading-tight">
              Train. Recover. Eat.
              <br />
              Become <span className="text-accent-500">Stronger</span>.
            </p>
            <ul className="mt-8 flex items-center gap-2">
              {socials.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="border-chalk/10 bg-chalk/5 text-mist hover:border-accent-500/40 hover:text-accent-400 inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-200"
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-7 lg:col-start-6">
            {footerNav.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-chalk text-[11px] font-semibold tracking-[0.24em] uppercase">
                  {column.title}
                </h2>
                <ul className="mt-3 space-y-0.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-mist hover:text-accent-400 inline-block py-1.5 text-sm transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="border-chalk/8 mt-14 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-fog text-xs">
            © {new Date().getFullYear()} STRONGER. All rights reserved.
          </p>
          <p className="text-fog text-[11px] tracking-[0.18em] uppercase">
            Built for people who keep showing up.
          </p>
        </div>
      </Container>
    </footer>
  );
}

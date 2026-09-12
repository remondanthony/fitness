"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/cn";
import { appNav, primaryNav } from "@/lib/navigation";

/** Sticky global navigation. Transparent over the hero, solid once scrolled. */
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent the page behind the mobile panel from scrolling.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header
      className={cn(
        "animate-fade-in sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter,box-shadow] duration-300",
        scrolled || open
          ? "border-chalk/8 bg-ink-950/85 border-b shadow-[0_10px_30px_-24px_rgb(0_0_0/0.9)] backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <Container className="flex h-18 items-center justify-between gap-6 py-4">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((link) => {
              // A detail page keeps its section highlighted.
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                      active ? "text-chalk" : "text-mist hover:text-chalk",
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        "bg-accent-500 absolute inset-x-4 -bottom-0.5 h-px origin-center scale-x-0 transition-transform duration-300",
                        active && "scale-x-100",
                      )}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ul className="flex items-center gap-1">
            {appNav.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    title={link.label}
                    aria-label={link.label}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "press inline-flex h-9 w-9 items-center justify-center rounded-xl border",
                      active
                        ? "border-accent-500/40 bg-accent-500/12 text-accent-400"
                        : "border-chalk/10 bg-chalk/[0.04] text-mist hover:border-chalk/25 hover:text-chalk",
                    )}
                  >
                    <link.icon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>

          <span className="bg-chalk/10 mx-1 h-5 w-px" aria-hidden="true" />

          <Button href="/login" variant="ghost" size="sm">
            Log In
          </Button>
          <Button href="/register" size="sm">
            Start Free
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="border-chalk/12 bg-chalk/5 text-chalk hover:border-chalk/25 inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors lg:hidden"
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </Container>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-chalk/8 bg-ink-950/95 animate-rise border-t backdrop-blur-xl lg:hidden"
      >
        <Container className="py-6">
          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {primaryNav.map((link) => (
                <li key={link.href} className="border-chalk/6 border-b last:border-0">
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "font-display flex items-center justify-between py-4 text-2xl transition-colors",
                      pathname === link.href || pathname.startsWith(`${link.href}/`)
                        ? "text-accent-500"
                        : "text-chalk hover:text-accent-400",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-chalk/8 mt-6 border-t pt-6">
            <p className="text-fog text-[10px] font-semibold tracking-[0.24em] uppercase">
              Your Account
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {appNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="border-chalk/10 bg-chalk/[0.04] text-mist hover:border-chalk/25 hover:text-chalk flex min-h-12 items-center gap-2.5 rounded-xl border px-4 text-sm font-medium transition-colors"
                  >
                    <link.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button href="/register" size="lg" className="w-full" onClick={() => setOpen(false)}>
              Start Free
            </Button>
            <Button
              href="/login"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Log In
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}

import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Shared frame for the login, register and password reset screens. */
export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <Card tone="raised" className="animate-rise rounded-3xl p-7 sm:p-9">
      <p className="text-accent-400 text-[11px] font-semibold tracking-[0.28em] uppercase">
        {eyebrow}
      </p>

      <h1 className="font-display text-chalk mt-4 text-4xl sm:text-5xl">{title}</h1>

      <p className="text-mist mt-4 text-sm leading-relaxed">{description}</p>

      <div className="mt-8">{children}</div>

      {footer ? (
        <div className="border-chalk/8 mt-8 border-t pt-6 text-center text-sm">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}

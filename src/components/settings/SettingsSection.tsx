import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";

type SettingsSectionProps = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
};

/** Anchored settings block with a consistent header. */
export function SettingsSection({
  id,
  title,
  description,
  icon: Icon,
  children,
}: SettingsSectionProps) {
  return (
    <section id={id} className="scroll-mt-28">
      <Card tone="raised" className="p-6 sm:p-8">
        <header className="border-chalk/8 flex items-start gap-4 border-b pb-6">
          <span className="border-accent-500/25 bg-accent-500/10 text-accent-400 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-chalk text-2xl">{title}</h2>
            <p className="text-fog mt-1.5 text-xs leading-relaxed">{description}</p>
          </div>
        </header>

        <div className="mt-7">{children}</div>
      </Card>
    </section>
  );
}

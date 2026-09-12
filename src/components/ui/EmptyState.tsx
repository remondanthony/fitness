import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

/** Shown when filters or a search return nothing. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card tone="raised" className="animate-rise flex flex-col items-center py-16 text-center">
      <span className="border-chalk/10 bg-chalk/5 text-fog inline-flex h-14 w-14 items-center justify-center rounded-2xl border">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="font-display text-chalk mt-6 text-2xl">{title}</h3>
      <p className="text-mist mt-3 max-w-sm text-sm leading-relaxed">{description}</p>
      {action ? <div className="mt-7">{action}</div> : null}
    </Card>
  );
}

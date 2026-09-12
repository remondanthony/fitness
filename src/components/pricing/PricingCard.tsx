import { Check } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { PlanButton } from "@/components/pricing/PlanButton";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { Plan } from "@/data/pricing";

/**
 * A single plan. The recommended plan gets the accent border, a lifted surface
 * and the solid button; the others stay deliberately quiet.
 */
export function PricingCard({ plan }: { plan: Plan }) {
  const Icon = plan.icon;
  const featured = Boolean(plan.recommended);

  return (
    <Card
      tone={featured ? "raised" : "default"}
      className={cn(
        "relative flex h-full flex-col p-7 sm:p-8",
        featured &&
          "border-accent-500/40 shadow-glow lg:-my-4 lg:py-11 lg:shadow-[0_0_0_1px_rgb(255_90_31/0.15),0_30px_80px_-30px_rgb(255_90_31/0.45)]",
      )}
    >
      {featured ? (
        <div className="absolute top-0 right-7 -translate-y-1/2">
          <Badge variant="solid" size="sm">
            Recommended
          </Badge>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-xl border",
            featured
              ? "border-accent-500/35 bg-accent-500/12 text-accent-400"
              : "border-chalk/10 bg-chalk/5 text-fog",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="font-display text-chalk text-2xl">{plan.name}</h3>
      </div>

      <p className="mt-7 flex items-baseline gap-1.5">
        <span className="font-display text-chalk text-5xl sm:text-6xl">
          {plan.price}
        </span>
        {plan.period ? (
          <span className="text-fog text-sm font-semibold">{plan.period}</span>
        ) : null}
      </p>

      <p className="text-fog mt-2 text-[11px] font-semibold tracking-[0.12em] uppercase">
        {plan.billingNote}
      </p>

      <p className="text-mist mt-6 text-sm leading-relaxed">{plan.description}</p>

      <ul className="border-chalk/8 mt-8 flex flex-1 flex-col gap-4 border-t pt-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                featured
                  ? "border-accent-500/35 bg-accent-500/15 text-accent-400"
                  : "border-chalk/12 bg-chalk/5 text-mist",
              )}
              aria-hidden="true"
            >
              <Check className="h-3 w-3" />
            </span>
            <span className="text-chalk text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <PlanButton plan={plan.name} label={plan.cta} featured={featured} />
    </Card>
  );
}

import { ArrowRight, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ENTITLEMENTS,
  hasEntitlement,
  tierLabel,
  type Tier,
} from "@/lib/membership/tiers";

/**
 * The member's current plan, read-only.
 *
 * Deliberately has no control that changes the tier. A plan picker here would
 * either be a lie — because nothing behind it can charge anyone yet — or a way
 * to self-upgrade. The database agrees: `user_memberships` grants members
 * SELECT and nothing else, so even a crafted request could not write it.
 */
export function MembershipSection({
  tier,
  loadError,
}: {
  tier: Tier;
  loadError: boolean;
}) {
  // Asks the entitlement rule rather than comparing tier names: tiers are
  // inclusive, so an Elite member must also see anything Pro unlocks. Matching
  // on `minimumTier === tier` would have hidden exactly that.
  const included = Object.values(ENTITLEMENTS).filter((entitlement) =>
    hasEntitlement(tier, entitlement.key),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="border-chalk/10 bg-chalk/[0.03] flex flex-wrap items-center justify-between gap-5 rounded-2xl border p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
            Current plan
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <p className="font-display text-chalk text-3xl">{tierLabel(tier)}</p>
            <Badge variant={tier === "free" ? "outline" : "accent"} className="gap-1.5">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Active
            </Badge>
          </div>
        </div>

        <Button href="/pricing" variant="secondary" className="shrink-0">
          Compare Plans
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
            aria-hidden="true"
          />
        </Button>
      </div>

      {loadError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
        >
          We couldn&apos;t confirm your plan just now, so this shows the Free tier.
          Refresh to try again.
        </p>
      ) : null}

      <div>
        <p className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
          Included with your plan
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {included.map((entitlement) => (
            <li key={entitlement.key} className="text-mist text-xs leading-relaxed">
              <span className="text-chalk font-semibold">{entitlement.label}</span>
              {" — "}
              {entitlement.description}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-fog text-xs leading-relaxed">
        Changing plan isn&apos;t available yet. Plans and pricing are on the{" "}
        <span className="text-mist">pricing page</span>.
      </p>
    </div>
  );
}

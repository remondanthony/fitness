import { ArrowRight, Lock } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { ENTITLEMENTS, tierLabel, type EntitlementKey } from "@/lib/membership/tiers";

/**
 * How a feature the member cannot reach is presented.
 *
 * One component for every locked surface, so a lock always looks and reads the
 * same. It states the feature, the tier that unlocks it, and that upgrading is
 * not available yet — because it is not. No countdown, no crossed-out price,
 * no urgency: a member who cannot use something should be told once, plainly.
 *
 * Locked state is carried by the word "Locked", the padlock, the named tier
 * and the explanatory sentence — four signals, none of which is colour. The
 * whole thing is static markup with one ordinary link, so it is keyboard
 * reachable and reads correctly in order to a screen reader without any
 * special handling.
 */
export function LockedFeature({
  entitlement,
  /** Overrides the catalogue description where a surface needs its own wording. */
  description,
  signedIn = true,
  className,
}: {
  entitlement: EntitlementKey;
  description?: string;
  signedIn?: boolean;
  className?: string;
}) {
  const { label, description: fallback, minimumTier } = ENTITLEMENTS[entitlement];
  const tier = tierLabel(minimumTier);

  return (
    <Card tone="raised" className={cn("p-6 sm:p-7", className)}>
      <div className="flex items-start gap-4">
        <span
          className="border-chalk/12 bg-chalk/5 text-fog inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
          aria-hidden="true"
        >
          <Lock className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-chalk text-sm font-semibold">{label}</h3>
            <Badge variant="outline" size="sm">
              Locked · {tier}
            </Badge>
          </div>

          <p className="text-fog mt-2 text-xs leading-relaxed">
            {description ?? fallback}
          </p>

          <p className="text-mist mt-3 text-xs leading-relaxed">
            {signedIn
              ? `This is part of ${tier} membership. Upgrading isn't available yet — plans are shown on the pricing page.`
              : `This is part of ${tier} membership. Sign in to see where your account stands.`}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/pricing" variant="secondary" size="sm">
              See {tier}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                aria-hidden="true"
              />
            </Button>

            {!signedIn ? (
              <Button href="/login" variant="ghost" size="sm">
                Sign In
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

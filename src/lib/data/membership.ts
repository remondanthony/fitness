import { cache } from "react";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_TIER,
  ENTITLEMENTS,
  hasEntitlement,
  requiredTier,
  tierLabel,
  toTier,
  type EntitlementKey,
  type Tier,
} from "@/lib/membership/tiers";

/**
 * Server-only. Who the member is, for entitlement purposes.
 *
 * The only place the application learns anyone's tier. It takes no arguments,
 * so there is no user id a request could supply and no way to ask about
 * somebody else; ownership comes from the session and RLS confines the read to
 * the caller's own row on top of that.
 *
 * A tier is never accepted from the browser. Anything a client sends about
 * membership is decoration — every decision that matters is made here or in
 * `requireEntitlement`.
 */

export type MembershipView = {
  tier: Tier;
  /** False for a signed-out visitor, who is treated as free. */
  signedIn: boolean;
  /**
   * The read failed. The tier falls back to free, so a database problem can
   * only ever withhold access, never grant it — and callers can say so rather
   * than implying the member has been downgraded.
   */
  loadError: boolean;
};

export const getMembership = cache(async (): Promise<MembershipView> => {
  const user = await getSessionUser();

  if (!user) return { tier: DEFAULT_TIER, signedIn: false, loadError: false };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_memberships")
    .select("tier")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { tier: DEFAULT_TIER, signedIn: true, loadError: true };
  }

  // No row is the normal case, not a missing one: members are free until
  // something says otherwise. `toTier` then refuses any value the CHECK
  // constraint would not have allowed, in case the two ever drift.
  return {
    tier: data ? toTier(data.tier) : DEFAULT_TIER,
    signedIn: true,
    loadError: false,
  };
});

/** The signed-in member's tier, or free for a visitor. */
export async function getCurrentTier(): Promise<Tier> {
  return (await getMembership()).tier;
}

/**
 * Whether the current member may use a feature.
 *
 * For rendering decisions. Use `requireEntitlement` to guard an action.
 */
export async function currentMemberHas(key: EntitlementKey): Promise<boolean> {
  return hasEntitlement(await getCurrentTier(), key);
}

export type EntitlementDenial = {
  allowed: false;
  /** The tier the member would need. */
  needs: Tier;
  /** Safe to show a member: no internal detail. */
  message: string;
};

export type EntitlementGrant = { allowed: true; tier: Tier };

export type EntitlementCheck = EntitlementGrant | EntitlementDenial;

/**
 * The guard for server-side work.
 *
 * Call this at the top of any Server Action or route handler whose feature is
 * gated, before it does anything. UI that hides a control is a courtesy; this
 * is the part that cannot be got around by editing the page, replaying the
 * request or calling the action directly, because the tier it compares is read
 * from the session here rather than taken from the caller.
 */
export async function requireEntitlement(
  key: EntitlementKey,
): Promise<EntitlementCheck> {
  const { tier, signedIn } = await getMembership();

  if (hasEntitlement(tier, key)) return { allowed: true, tier };

  const needs = requiredTier(key);

  return {
    allowed: false,
    needs,
    message: signedIn
      ? `${ENTITLEMENTS[key].label} is part of ${tierLabel(needs)}.`
      : `Sign in with a ${tierLabel(needs)} membership to use this.`,
  };
}

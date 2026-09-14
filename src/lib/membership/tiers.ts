/**
 * Membership tiers and what each one unlocks.
 *
 * The single authoritative answer to "is this allowed?". Every check in the
 * application resolves here, so there is one place to read, one place to
 * change, and no chance of two surfaces disagreeing about the same member.
 *
 * Pure and dependency-free: no session, no database, no React. That is what
 * makes it exhaustively testable, and it is safe to import from a client
 * component — the values here describe the product, not the member.
 *
 * Deciding what someone is entitled to is separate from deciding who they
 * are. This module only does the former; `getMembership()` in
 * lib/data/membership.ts is the only thing that answers the latter, and it
 * takes the answer from the session.
 */

/** Mirrors the `tier` CHECK constraint on public.user_memberships. */
export const TIERS = ["free", "pro", "elite"] as const;

export type Tier = (typeof TIERS)[number];

/** The tier a member has when nothing says otherwise. */
export const DEFAULT_TIER: Tier = "free";

/**
 * Tiers in ascending order of access.
 *
 * Entitlements are inclusive upward: elite has everything pro has, which has
 * everything free has. The pricing page already promises this — Elite reads
 * "Everything in Pro" — so the rank comparison below matches what members are
 * told they are buying.
 */
const RANK: Record<Tier, number> = { free: 0, pro: 1, elite: 2 };

/**
 * Narrows an untrusted string to a tier.
 *
 * Anything unrecognised — a value from an older schema, a typo, a string from
 * somewhere it should not have come from — resolves to free rather than
 * throwing. Failing to the least-privileged tier means a bad value can only
 * ever cost access, never grant it.
 */
export function toTier(value: unknown): Tier {
  return typeof value === "string" && (TIERS as readonly string[]).includes(value)
    ? (value as Tier)
    : DEFAULT_TIER;
}

export function tierRank(tier: Tier): number {
  return RANK[tier];
}

// ---------------------------------------------------------------------------
// Entitlements
// ---------------------------------------------------------------------------

/**
 * The capabilities membership controls.
 *
 * Kept deliberately short. The catalogue below describes what the product
 * already sells on /pricing; it is not a wish list, and an entry only earns
 * its place once there is something real to gate. Adding a key here does
 * nothing on its own — a gate exists only where a surface calls
 * `hasEntitlement` or `requireEntitlement`.
 */
export type EntitlementKey =
  | "core-training"
  | "personalized-recommendations"
  | "coach-consultation";

export type Entitlement = {
  key: EntitlementKey;
  /** Lowest tier that unlocks it. */
  minimumTier: Tier;
  /** Shown on locked UI. A plain description, not a sales line. */
  label: string;
  description: string;
};

export const ENTITLEMENTS: Record<EntitlementKey, Entitlement> = {
  /**
   * Everything the app does today for a signed-in member: programs, workouts,
   * logging, nutrition, wellness, habits, progress. Free on purpose, and
   * listed so that "free members can do this" is written down somewhere rather
   * than being an accident of nothing checking.
   */
  "core-training": {
    key: "core-training",
    minimumTier: "free",
    label: "Core training",
    description: "Programs, workouts, logging, nutrition, wellness and progress.",
  },

  /**
   * The Part 16 engine. Free, and deliberately so: it already works for every
   * member, and taking it away would be removing something that works rather
   * than adding something that does not exist.
   */
  "personalized-recommendations": {
    key: "personalized-recommendations",
    minimumTier: "free",
    label: "Personalized recommendations",
    description: "Programs and sessions ranked against your saved answers.",
  },

  /**
   * Requesting time with a coach. Elite because that is exactly what the
   * pricing page promises — "Coach access", "Monthly consultation" — and
   * because the booking flow is a placeholder today, so gating it takes
   * nothing away from anyone.
   */
  "coach-consultation": {
    key: "coach-consultation",
    minimumTier: "elite",
    label: "Coach consultation",
    description: "Request a consultation with a STRONGER coach.",
  },
};

/**
 * Whether a tier unlocks an entitlement.
 *
 * The whole decision, in one comparison. An unknown key is refused rather than
 * allowed, so a typo at a call site locks a feature instead of opening one.
 */
export function hasEntitlement(tier: Tier, key: EntitlementKey): boolean {
  const entitlement = ENTITLEMENTS[key];
  if (!entitlement) return false;

  return tierRank(tier) >= tierRank(entitlement.minimumTier);
}

/** The tier a member must reach for this entitlement. */
export function requiredTier(key: EntitlementKey): Tier {
  return ENTITLEMENTS[key]?.minimumTier ?? "elite";
}

/** Display name for a tier, e.g. "Elite". */
export function tierLabel(tier: Tier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

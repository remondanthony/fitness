import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_TIER,
  ENTITLEMENTS,
  hasEntitlement,
  requiredTier,
  tierLabel,
  tierRank,
  TIERS,
  toTier,
  type EntitlementKey,
  type Tier,
} from "./tiers.ts";

/**
 * Membership entitlements.
 *
 *   node --experimental-strip-types --test src/lib/membership/tiers.test.ts
 *
 * These pin down an access-control decision, so the matrix below is written
 * out in full rather than generated: every tier against every entitlement,
 * with the expected answer stated literally. A generated expectation would
 * reproduce whatever bug the implementation has.
 */

/** tier → entitlement → allowed. The whole product rule, written out. */
const MATRIX: Record<Tier, Record<EntitlementKey, boolean>> = {
  free: {
    "core-training": true,
    "personalized-recommendations": true,
    "coach-consultation": false,
  },
  pro: {
    "core-training": true,
    "personalized-recommendations": true,
    "coach-consultation": false,
  },
  elite: {
    "core-training": true,
    "personalized-recommendations": true,
    "coach-consultation": true,
  },
};

describe("hasEntitlement — the full matrix", () => {
  for (const tier of TIERS) {
    for (const key of Object.keys(MATRIX[tier]) as EntitlementKey[]) {
      const expected = MATRIX[tier][key];
      it(`${tier} ${expected ? "may" : "may NOT"} use ${key}`, () => {
        assert.equal(hasEntitlement(tier, key), expected);
      });
    }
  }
});

describe("tiers are inclusive upward", () => {
  it("never grants a lower tier something a higher tier lacks", () => {
    for (const key of Object.keys(ENTITLEMENTS) as EntitlementKey[]) {
      for (const lower of TIERS) {
        for (const higher of TIERS) {
          if (tierRank(higher) < tierRank(lower)) continue;
          if (!hasEntitlement(lower, key)) continue;
          assert.equal(
            hasEntitlement(higher, key),
            true,
            `${higher} should inherit ${key} from ${lower}`,
          );
        }
      }
    }
  });

  it("orders free < pro < elite", () => {
    assert.ok(tierRank("free") < tierRank("pro"));
    assert.ok(tierRank("pro") < tierRank("elite"));
  });
});

describe("toTier — untrusted input cannot become access", () => {
  it("accepts the three real tiers", () => {
    for (const tier of TIERS) assert.equal(toTier(tier), tier);
  });

  it("falls back to free for anything else", () => {
    const rubbish = [
      "ELITE",
      "Pro",
      "premium",
      "admin",
      "",
      " elite",
      "elite ",
      null,
      undefined,
      0,
      1,
      true,
      {},
      [],
      ["elite"],
      { tier: "elite" },
    ];
    for (const value of rubbish) {
      assert.equal(toTier(value), "free", JSON.stringify(value) ?? String(value));
    }
  });

  it("defaults to the least-privileged tier", () => {
    assert.equal(DEFAULT_TIER, "free");
    assert.equal(tierRank(DEFAULT_TIER), 0);
  });

  it("cannot be escalated by a value shaped like a tier object", () => {
    // Reproduces a client sending {tier:"elite"} somewhere it should not.
    const fromBrowser = JSON.parse('{"tier":"elite"}') as unknown;
    assert.equal(toTier(fromBrowser), "free");
    assert.equal(hasEntitlement(toTier(fromBrowser), "coach-consultation"), false);
  });
});

describe("hasEntitlement — unknown keys fail closed", () => {
  it("refuses a key that is not in the catalogue", () => {
    const unknown = "coach-consultation-v2" as EntitlementKey;
    for (const tier of TIERS) {
      assert.equal(hasEntitlement(tier, unknown), false, tier);
    }
  });

  it("reports the strictest tier for an unknown key", () => {
    assert.equal(requiredTier("made-up" as EntitlementKey), "elite");
  });
});

describe("requiredTier matches the catalogue", () => {
  it("returns each entitlement's own minimum", () => {
    for (const entitlement of Object.values(ENTITLEMENTS)) {
      assert.equal(requiredTier(entitlement.key), entitlement.minimumTier);
    }
  });

  it("agrees with hasEntitlement at the boundary", () => {
    for (const entitlement of Object.values(ENTITLEMENTS)) {
      const needed = entitlement.minimumTier;
      assert.equal(hasEntitlement(needed, entitlement.key), true);

      const below = TIERS.filter((tier) => tierRank(tier) < tierRank(needed));
      for (const tier of below) {
        assert.equal(hasEntitlement(tier, entitlement.key), false);
      }
    }
  });
});

describe("determinism", () => {
  it("gives the same answer every time", () => {
    for (const tier of TIERS) {
      for (const key of Object.keys(ENTITLEMENTS) as EntitlementKey[]) {
        const answers = [0, 1, 2].map(() => hasEntitlement(tier, key));
        assert.equal(new Set(answers).size, 1);
      }
    }
  });
});

describe("existing free functionality is not taken away", () => {
  it("keeps core training and Part 16 recommendations free", () => {
    // A regression guard, not a preference: both already worked for every
    // member before Part 17, so both must stay at minimumTier "free".
    assert.equal(ENTITLEMENTS["core-training"].minimumTier, "free");
    assert.equal(ENTITLEMENTS["personalized-recommendations"].minimumTier, "free");
    assert.equal(hasEntitlement("free", "core-training"), true);
    assert.equal(hasEntitlement("free", "personalized-recommendations"), true);
  });
});

describe("tierLabel", () => {
  it("capitalises for display", () => {
    assert.equal(tierLabel("free"), "Free");
    assert.equal(tierLabel("pro"), "Pro");
    assert.equal(tierLabel("elite"), "Elite");
  });
});

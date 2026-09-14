import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  EQUIPMENT_LADDER,
  equipmentRank,
  isKnownEquipment,
  meetsEquipment,
} from "./rules.ts";
import type { EquipmentAccess } from "../../types/database.ts";

/**
 * Equipment compatibility.
 *
 * Run with Node's built-in test runner, which needs no dependency:
 *
 *   node --experimental-strip-types --test src/lib/recommendations/rules.test.ts
 *
 * The focus is the hard constraint. Everything else the engine does is a
 * preference that can be got wrong without harm; recommending a barbell
 * program to someone who owns nothing is simply a wrong answer, so the rules
 * around it are pinned down here.
 *
 * `as EquipmentAccess` on the invalid values below is deliberate: it reproduces
 * exactly what the engine does when it casts the catalogue's untyped facet
 * strings, which is the only way an unrecognised value can reach this function.
 */

const UNKNOWN = "typo-gym" as EquipmentAccess;

describe("isKnownEquipment", () => {
  it("accepts every value on the ladder", () => {
    for (const value of EQUIPMENT_LADDER) {
      assert.equal(isKnownEquipment(value), true, value);
    }
  });

  it("rejects anything else", () => {
    for (const value of ["typo-gym", "", "Full Gym", "barbell", "full_gym"]) {
      assert.equal(isKnownEquipment(value), false, value);
    }
  });
});

describe("meetsEquipment — valid values behave as before", () => {
  it("lets a member reach their own level and everything below it", () => {
    assert.equal(meetsEquipment("no-equipment", ["no-equipment"]), true);
    assert.equal(meetsEquipment("dumbbells", ["no-equipment"]), true);
    assert.equal(meetsEquipment("dumbbells", ["dumbbells"]), true);
    assert.equal(meetsEquipment("full-gym", ["home-gym"]), true);
    assert.equal(meetsEquipment("full-gym", ["full-gym"]), true);
  });

  it("blocks anything above their level", () => {
    assert.equal(meetsEquipment("no-equipment", ["dumbbells"]), false);
    assert.equal(meetsEquipment("no-equipment", ["full-gym"]), false);
    assert.equal(meetsEquipment("dumbbells", ["home-gym"]), false);
    assert.equal(meetsEquipment("home-gym", ["full-gym"]), false);
  });

  it("takes the cheapest option when several are offered", () => {
    assert.equal(meetsEquipment("no-equipment", ["full-gym", "no-equipment"]), true);
    assert.equal(meetsEquipment("dumbbells", ["full-gym", "home-gym"]), false);
    assert.equal(
      meetsEquipment("dumbbells", ["full-gym", "home-gym", "dumbbells"]),
      true,
    );
  });
});

describe("meetsEquipment — unknown values fail closed", () => {
  it("refuses an entirely unrecognised requirement, at every access level", () => {
    assert.equal(meetsEquipment("no-equipment", [UNKNOWN]), false);
    assert.equal(meetsEquipment("dumbbells", [UNKNOWN]), false);
    assert.equal(meetsEquipment("home-gym", [UNKNOWN]), false);
    assert.equal(meetsEquipment("full-gym", [UNKNOWN]), false);
  });

  it("ignores an unknown option rather than letting it lower the bar", () => {
    // Was the bug: -1 from indexOf sorted below every real level, so the
    // unknown entry made the whole requirement look free.
    assert.equal(meetsEquipment("no-equipment", [UNKNOWN, "full-gym"]), false);
    assert.equal(meetsEquipment("dumbbells", [UNKNOWN, "home-gym"]), false);
  });

  it("still honours the valid options alongside an unknown one", () => {
    assert.equal(meetsEquipment("full-gym", [UNKNOWN, "full-gym"]), true);
    assert.equal(meetsEquipment("dumbbells", [UNKNOWN, "no-equipment"]), true);
  });

  it("refuses when every option is unreadable", () => {
    assert.equal(
      meetsEquipment("full-gym", [UNKNOWN, "" as EquipmentAccess]),
      false,
    );
  });
});

describe("meetsEquipment — the two 'no constraint' cases stay reachable", () => {
  it("does not filter when the member's preference is unset", () => {
    assert.equal(meetsEquipment(null, ["full-gym"]), true);
    assert.equal(meetsEquipment(null, [UNKNOWN]), true);
    assert.equal(meetsEquipment(null, []), true);
  });

  it("treats an empty requirement as no requirement", () => {
    assert.equal(meetsEquipment("no-equipment", []), true);
    assert.equal(meetsEquipment("full-gym", []), true);
  });
});

describe("equipmentRank", () => {
  it("orders the ladder from least to most", () => {
    assert.equal(equipmentRank("no-equipment"), 0);
    assert.equal(equipmentRank("dumbbells"), 1);
    assert.equal(equipmentRank("home-gym"), 2);
    assert.equal(equipmentRank("full-gym"), 3);
  });

  it("returns -1 for an unknown value, which callers must reject", () => {
    assert.equal(equipmentRank(UNKNOWN), -1);
  });
});

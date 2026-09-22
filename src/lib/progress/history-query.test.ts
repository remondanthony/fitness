import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  encodeCursor,
  filterRange,
  filtersAreActive,
  filtersToQuery,
  NO_FILTERS,
  normaliseFilters,
  parseCursor,
} from "./history-query.ts";

/**
 * History cursors and filters.
 *
 *   node --experimental-strip-types --test src/lib/progress/history-query.test.ts
 *
 * Every value here arrives from a URL and is interpolated into a database
 * filter, so these cover what happens when the input is wrong as carefully as
 * when it is right.
 */

const ID = "11111111-2222-3333-4444-555555555555";

describe("encodeCursor / parseCursor", () => {
  it("round-trips a position", () => {
    const cursor = { completedAt: "2026-09-20T10:02:00.000Z", id: ID };
    assert.deepEqual(parseCursor(encodeCursor(cursor)), cursor);
  });

  it("normalises the timestamp it returns", () => {
    // Whatever spelling arrives, what reaches the query is ISO from here.
    const parsed = parseCursor(`2026-09-20T10:02:00Z~${ID}`);
    assert.equal(parsed?.completedAt, "2026-09-20T10:02:00.000Z");
  });

  it("returns null for a missing or empty cursor", () => {
    assert.equal(parseCursor(undefined), null);
    assert.equal(parseCursor(null), null);
    assert.equal(parseCursor(""), null);
  });

  it("returns null when the id is not a uuid", () => {
    assert.equal(parseCursor("2026-09-20T10:02:00.000Z~not-a-uuid"), null);
    assert.equal(parseCursor("2026-09-20T10:02:00.000Z~"), null);
  });

  it("returns null when the timestamp is unreadable", () => {
    assert.equal(parseCursor(`nonsense~${ID}`), null);
  });

  it("returns null when the separator is missing or leading", () => {
    assert.equal(parseCursor(`2026-09-20T10:02:00.000Z${ID}`), null);
    assert.equal(parseCursor(`~${ID}`), null);
  });

  it("refuses a cursor carrying filter syntax", () => {
    // These would change the shape of a PostgREST filter, not just its values.
    for (const hostile of [
      `2026-09-20T10:02:00.000Z,id.gt.0~${ID}`,
      `2026-09-20T10:02:00.000Z)~${ID}`,
      `2026-09-20T10:02:00.000Z~${ID},user_id.neq.x`,
      `2026-09-20T10:02:00.000Z~' or '1'='1`,
    ]) {
      assert.equal(parseCursor(hostile), null, hostile);
    }
  });

  it("takes the last separator, so a timestamp containing one is safe", () => {
    assert.equal(parseCursor(`2026-09-20T10:02:00.000Z~extra~${ID}`), null);
  });
});

describe("normaliseFilters", () => {
  it("accepts well-formed dates and a slug", () => {
    assert.deepEqual(
      normaliseFilters({ from: "2026-09-01", to: "2026-09-30", workout: "upper-body-power" }),
      { from: "2026-09-01", to: "2026-09-30", workoutSlug: "upper-body-power" },
    );
  });

  it("returns no filters for empty input", () => {
    assert.deepEqual(normaliseFilters({}), NO_FILTERS);
    assert.deepEqual(normaliseFilters({ from: "", to: "", workout: "" }), NO_FILTERS);
  });

  it("drops a malformed date rather than failing", () => {
    assert.equal(normaliseFilters({ from: "20-09-2026" }).from, null);
    assert.equal(normaliseFilters({ from: "2026-9-1" }).from, null);
    assert.equal(normaliseFilters({ to: "yesterday" }).to, null);
  });

  it("drops a date that matches the shape but is not a real day", () => {
    assert.equal(normaliseFilters({ from: "2026-02-31" }).from, null);
    assert.equal(normaliseFilters({ from: "2026-13-01" }).from, null);
  });

  it("corrects a reversed range rather than returning nothing", () => {
    const filters = normaliseFilters({ from: "2026-09-30", to: "2026-09-01" });
    assert.equal(filters.from, "2026-09-01");
    assert.equal(filters.to, "2026-09-30");
  });

  it("drops a workout value that is not a slug", () => {
    for (const hostile of [
      "Upper Body Power",
      "upper,workout_slug.neq.x",
      "upper')--",
      "UPPER-BODY",
      "-leading",
      "a".repeat(200),
    ]) {
      assert.equal(normaliseFilters({ workout: hostile }).workoutSlug, null, hostile);
    }
  });

  it("keeps a slug the catalogue no longer lists", () => {
    // History must stay filterable by a workout that has since been removed.
    assert.equal(normaliseFilters({ workout: "retired-workout" }).workoutSlug, "retired-workout");
  });
});

describe("filtersAreActive", () => {
  it("is false only when nothing is set", () => {
    assert.equal(filtersAreActive(NO_FILTERS), false);
    assert.equal(filtersAreActive(normaliseFilters({ from: "2026-09-01" })), true);
    assert.equal(filtersAreActive(normaliseFilters({ to: "2026-09-01" })), true);
    assert.equal(filtersAreActive(normaliseFilters({ workout: "push-day-volume" })), true);
  });

  it("is false when every supplied value was rejected", () => {
    assert.equal(filtersAreActive(normaliseFilters({ from: "nope", workout: "NOPE" })), false);
  });
});

describe("filterRange", () => {
  it("covers whole UTC days at both ends", () => {
    assert.deepEqual(filterRange(normaliseFilters({ from: "2026-09-01", to: "2026-09-30" })), {
      fromIso: "2026-09-01T00:00:00.000Z",
      toIso: "2026-09-30T23:59:59.999Z",
    });
  });

  it("covers a single day when both ends are the same date", () => {
    const range = filterRange(normaliseFilters({ from: "2026-09-20", to: "2026-09-20" }));
    assert.equal(range.fromIso, "2026-09-20T00:00:00.000Z");
    assert.equal(range.toIso, "2026-09-20T23:59:59.999Z");
  });

  it("is open-ended when a bound is absent", () => {
    assert.deepEqual(filterRange(NO_FILTERS), { fromIso: null, toIso: null });
  });
});

describe("filtersToQuery", () => {
  it("builds a shareable query string", () => {
    assert.equal(
      filtersToQuery(normaliseFilters({ from: "2026-09-01", to: "2026-09-30", workout: "push-day-volume" })),
      "?from=2026-09-01&to=2026-09-30&workout=push-day-volume",
    );
  });

  it("is empty when nothing is filtered", () => {
    assert.equal(filtersToQuery(NO_FILTERS), "");
  });

  it("never carries a cursor, so a filter link starts the list again", () => {
    const query = filtersToQuery(normaliseFilters({ workout: "push-day-volume" }));
    assert.equal(query.includes("cursor"), false);
  });
});

describe("ordering and tie behaviour the cursor relies on", () => {
  /** The comparison the keyset query expresses in SQL. */
  const isAfter = (
    row: { completedAt: string; id: string },
    cursor: { completedAt: string; id: string },
  ) =>
    row.completedAt < cursor.completedAt ||
    (row.completedAt === cursor.completedAt && row.id < cursor.id);

  const at = "2026-09-20T10:00:00.000Z";

  it("excludes the cursor row itself, so no session repeats", () => {
    assert.equal(isAfter({ completedAt: at, id: ID }, { completedAt: at, id: ID }), false);
  });

  it("orders ties by id so a shared timestamp is still a total order", () => {
    const cursor = { completedAt: at, id: "bbbbbbbb-2222-3333-4444-555555555555" };
    assert.equal(isAfter({ completedAt: at, id: "aaaaaaaa-2222-3333-4444-555555555555" }, cursor), true);
    assert.equal(isAfter({ completedAt: at, id: "cccccccc-2222-3333-4444-555555555555" }, cursor), false);
  });

  it("includes every older session regardless of id", () => {
    const cursor = { completedAt: at, id: "aaaaaaaa-2222-3333-4444-555555555555" };
    assert.equal(
      isAfter({ completedAt: "2026-09-19T23:59:59.999Z", id: "ffffffff-2222-3333-4444-555555555555" }, cursor),
      true,
    );
  });

  it("partitions a page boundary with no gap and no overlap", () => {
    const rows = [
      { completedAt: "2026-09-20T10:00:00.000Z", id: "dddddddd-2222-3333-4444-555555555555" },
      { completedAt: at, id: "cccccccc-2222-3333-4444-555555555555" },
      { completedAt: at, id: "bbbbbbbb-2222-3333-4444-555555555555" },
      { completedAt: "2026-09-19T10:00:00.000Z", id: "aaaaaaaa-2222-3333-4444-555555555555" },
    ];

    const cursor = rows[1];
    const before = rows.filter((r) => !isAfter(r, cursor));
    const after = rows.filter((r) => isAfter(r, cursor));

    assert.equal(before.length + after.length, rows.length);
    assert.equal(new Set([...before, ...after].map((r) => r.id)).size, rows.length);
    assert.deepEqual(after.map((r) => r.id.slice(0, 1)), ["b", "a"]);
  });
});

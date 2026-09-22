import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatRecordDate,
  formatWeekLabel,
  summariseWindow,
  toRecordCards,
  toSessionSeries,
  toTrendSeries,
  toVolumeSeries,
} from "./view.ts";
import type { PeriodBucket } from "../../lib/progress/aggregate.ts";

/**
 * Progress view mapping.
 *
 *   node --experimental-strip-types --test src/components/progress/view.test.ts
 *
 * Covers only what this layer is responsible for — labels, series shape and
 * window totals. The aggregation itself is already pinned down by
 * lib/progress/aggregate.test.ts and is not re-tested here.
 */

function bucket(over: Partial<PeriodBucket> & { start: string }): PeriodBucket {
  return { sessions: 0, volume: 0, current: false, ...over };
}

describe("formatWeekLabel", () => {
  it("formats a period start as a short day and month", () => {
    assert.equal(formatWeekLabel("2026-09-14"), "14 Sep");
    assert.equal(formatWeekLabel("2026-01-05"), "5 Jan");
    assert.equal(formatWeekLabel("2025-12-29"), "29 Dec");
  });

  it("is stable — the same input always gives the same label", () => {
    const labels = [0, 1, 2].map(() => formatWeekLabel("2026-09-14"));
    assert.equal(new Set(labels).size, 1);
  });

  it("labels in UTC, so the label names the day the bucket was cut on", () => {
    // Were this formatted in a negative-offset timezone, midnight UTC on the
    // 14th would render as the 13th and disagree with its own bucket.
    assert.equal(formatWeekLabel("2026-09-14"), "14 Sep");
    assert.equal(formatWeekLabel("2026-03-01"), "1 Mar");
  });
});

describe("toSessionSeries / toVolumeSeries", () => {
  const buckets: PeriodBucket[] = [
    bucket({ start: "2026-08-31", sessions: 3, volume: 4200 }),
    bucket({ start: "2026-09-07", sessions: 0, volume: 0 }),
    bucket({ start: "2026-09-14", sessions: 2, volume: 3100, current: true }),
  ];

  it("maps weekly session counts onto labelled points", () => {
    assert.deepEqual(toSessionSeries(buckets), [
      { label: "31 Aug", value: 3, current: false },
      { label: "7 Sep", value: 0, current: false },
      { label: "14 Sep", value: 2, current: true },
    ]);
  });

  it("maps weekly volume onto labelled points", () => {
    assert.deepEqual(toVolumeSeries(buckets), [
      { label: "31 Aug", value: 4200, current: false },
      { label: "7 Sep", value: 0, current: false },
      { label: "14 Sep", value: 3100, current: true },
    ]);
  });

  it("keeps empty weeks as zero rather than dropping them", () => {
    // A skipped week would draw a continuous line across a gap in training.
    assert.equal(toSessionSeries(buckets).length, 3);
    assert.equal(toSessionSeries(buckets)[1].value, 0);
    assert.equal(toVolumeSeries(buckets)[1].value, 0);
  });

  it("carries the in-progress flag through for chart styling", () => {
    assert.deepEqual(
      toSessionSeries(buckets).map((point) => point.current),
      [false, false, true],
    );
  });

  it("returns an empty series for no buckets", () => {
    assert.deepEqual(toSessionSeries([]), []);
    assert.deepEqual(toVolumeSeries([]), []);
  });
});

describe("summariseWindow", () => {
  it("totals sessions and volume across the window", () => {
    const summary = summariseWindow([
      bucket({ start: "2026-08-31", sessions: 3, volume: 4200 }),
      bucket({ start: "2026-09-07", sessions: 1, volume: 900.5 }),
      bucket({ start: "2026-09-14", sessions: 2, volume: 3100, current: true }),
    ]);

    assert.equal(summary.sessions, 6);
    assert.equal(summary.volume, 8200.5);
    assert.equal(summary.currentWeekSessions, 2);
    assert.equal(summary.hasHistory, true);
  });

  it("averages finished weeks only, excluding the week in progress", () => {
    // 3 + 1 across two finished weeks = 2.0. Including the part-way current
    // week would give 2.0 -> 1.33 and understate their consistency.
    const summary = summariseWindow([
      bucket({ start: "2026-08-31", sessions: 3 }),
      bucket({ start: "2026-09-07", sessions: 1 }),
      bucket({ start: "2026-09-14", sessions: 0, current: true }),
    ]);

    assert.equal(summary.averagePerWeek, 2);
  });

  it("rounds the average to one decimal", () => {
    const summary = summariseWindow([
      bucket({ start: "2026-08-31", sessions: 2 }),
      bucket({ start: "2026-09-07", sessions: 3 }),
      bucket({ start: "2026-09-14", sessions: 2 }),
    ]);

    assert.equal(summary.averagePerWeek, 2.3);
  });

  it("never produces NaN for an empty window", () => {
    const summary = summariseWindow([]);

    assert.equal(summary.sessions, 0);
    assert.equal(summary.volume, 0);
    assert.equal(summary.currentWeekSessions, 0);
    assert.equal(summary.averagePerWeek, 0);
    assert.equal(Number.isNaN(summary.averagePerWeek), false);
    assert.equal(summary.hasHistory, false);
  });

  it("never produces NaN when every week is the current one", () => {
    // No finished week to divide by — the guard has to hold here too.
    const summary = summariseWindow([
      bucket({ start: "2026-09-14", sessions: 1, current: true }),
    ]);

    assert.equal(summary.averagePerWeek, 0);
    assert.equal(Number.isNaN(summary.averagePerWeek), false);
  });

  it("reports no history for a member whose weeks are all empty", () => {
    const summary = summariseWindow([
      bucket({ start: "2026-08-31" }),
      bucket({ start: "2026-09-07" }),
      bucket({ start: "2026-09-14", current: true }),
    ]);

    assert.equal(summary.hasHistory, false);
    assert.equal(summary.sessions, 0);
  });

  it("produces no undefined values anywhere in the summary", () => {
    const summary = summariseWindow([]);
    for (const [key, value] of Object.entries(summary)) {
      assert.notEqual(value, undefined, key);
    }
  });
});

describe("toRecordCards", () => {
  const entry = (value: number, previous: number | null = null) => ({
    value,
    achievedAt: "2026-09-08T10:00:00Z",
    previous,
  });

  const base = {
    exerciseSlug: "back-squat",
    maxWeight: null,
    bestReps: null,
    bestSetVolume: null,
    totalSets: 1,
    loadedSets: 1,
    lastLoggedAt: "2026-09-08T10:00:00Z",
  };

  it("builds a weight card and a reps card from real records", () => {
    const cards = toRecordCards(
      { ...base, maxWeight: entry(120, 110), bestReps: entry(8) },
      "Back Squat",
    );

    assert.equal(cards.length, 2);
    assert.deepEqual(
      cards.map((c) => [c.value, c.unit, c.delta]),
      [
        ["120", "kg", "+10"],
        ["8", "reps", undefined],
      ],
    );
    assert.equal(cards[0].achieved, "8 Sep 2026");
    assert.equal(cards[0].exerciseSlug, "back-squat");
  });

  it("omits a 0 kg weight card but keeps the reps record", () => {
    const cards = toRecordCards(
      { ...base, exerciseSlug: "push-up", maxWeight: entry(0), bestReps: entry(30) },
      "Push-Up",
    );

    assert.deepEqual(
      cards.map((c) => c.unit),
      ["reps"],
    );
    assert.equal(cards[0].value, "30");
  });

  it("produces no cards for an exercise with no usable record", () => {
    assert.deepEqual(toRecordCards(base, "Back Squat"), []);
  });

  it("shows no improvement when the record was never beaten", () => {
    const cards = toRecordCards({ ...base, maxWeight: entry(100, 100) }, "Back Squat");
    assert.equal(cards[0].delta, undefined);
  });

  it("uses the supplied display name, whatever the slug", () => {
    const cards = toRecordCards(
      { ...base, exerciseSlug: "not-in-catalogue", maxWeight: entry(50) },
      "not-in-catalogue",
    );
    assert.equal(cards[0].lift, "not-in-catalogue");
  });
});

describe("formatRecordDate / toTrendSeries", () => {
  it("formats a record date deterministically in UTC", () => {
    assert.equal(formatRecordDate("2026-09-08T10:00:00Z"), "8 Sep 2026");
    assert.equal(formatRecordDate("2026-01-01T00:00:00Z"), "1 Jan 2026");
  });

  it("returns an empty label rather than throwing on a bad date", () => {
    assert.equal(formatRecordDate("nonsense"), "");
  });

  it("maps trend points onto labelled chart points", () => {
    assert.deepEqual(
      toTrendSeries([
        { start: "2026-08-31", best: 105, sets: 2 },
        { start: "2026-09-07", best: 110, sets: 1 },
      ]),
      [
        { label: "31 Aug", value: 105 },
        { label: "7 Sep", value: 110 },
      ],
    );
  });

  it("returns an empty series for no points", () => {
    assert.deepEqual(toTrendSeries([]), []);
  });
});

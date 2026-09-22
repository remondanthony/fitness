import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildStreakSummary,
  currentStreak,
  lastSevenDays,
  longestStreak,
  utcDayKey,
  workoutDays,
} from "./streaks.ts";

/**
 * Workout streaks.
 *
 *   node --experimental-strip-types --test src/lib/progress/streaks.test.ts
 *
 * A streak is a claim a member will check against their own memory, so the
 * expectations here are written out literally.
 *
 * Definition under test: consecutive UTC calendar days ending on the most
 * recent day a workout was completed. A lapsed streak keeps its length and is
 * marked inactive rather than reset to zero.
 */

const NOW = new Date("2026-09-20T12:00:00Z"); // a Sunday

describe("utcDayKey / workoutDays", () => {
  it("reduces a timestamp to its UTC calendar day", () => {
    assert.equal(utcDayKey("2026-09-20T23:59:59Z"), "2026-09-20");
    assert.equal(utcDayKey("2026-09-20T00:00:00Z"), "2026-09-20");
  });

  it("returns null for an unreadable timestamp", () => {
    assert.equal(utcDayKey("nonsense"), null);
  });

  it("counts two sessions on one day as a single training day", () => {
    assert.deepEqual(
      workoutDays(["2026-09-20T07:00:00Z", "2026-09-20T19:00:00Z"]),
      ["2026-09-20"],
    );
  });

  it("sorts days oldest first and drops unreadable ones", () => {
    assert.deepEqual(
      workoutDays(["2026-09-20T07:00:00Z", "bad", "2026-09-18T07:00:00Z"]),
      ["2026-09-18", "2026-09-20"],
    );
  });

  it("uses UTC, not local time, at the midnight boundary", () => {
    // 23:30Z on the 19th is already the 20th at +02:00. UTC decides.
    assert.deepEqual(workoutDays(["2026-09-19T23:30:00Z"]), ["2026-09-19"]);
    assert.deepEqual(workoutDays(["2026-09-20T00:30:00Z"]), ["2026-09-20"]);
  });
});

describe("currentStreak", () => {
  it("is zero with no workouts", () => {
    assert.equal(currentStreak([]), 0);
  });

  it("is one for a single workout", () => {
    assert.equal(currentStreak(["2026-09-20"]), 1);
  });

  it("counts consecutive days", () => {
    assert.equal(currentStreak(["2026-09-18", "2026-09-19", "2026-09-20"]), 3);
  });

  it("stops at a gap, counting only the run that ends the history", () => {
    assert.equal(
      currentStreak(["2026-09-10", "2026-09-11", "2026-09-19", "2026-09-20"]),
      2,
    );
  });

  it("counts a run that ended in the past at its full length", () => {
    // Trained three days then stopped. The run was three days long; whether it
    // is still alive is `isActive`, not a different number.
    assert.equal(currentStreak(["2026-09-01", "2026-09-02", "2026-09-03"]), 3);
  });

  it("crosses a month boundary", () => {
    assert.equal(currentStreak(["2026-08-31", "2026-09-01"]), 2);
  });

  it("crosses a year boundary", () => {
    assert.equal(currentStreak(["2025-12-31", "2026-01-01"]), 2);
  });
});

describe("longestStreak", () => {
  it("is zero with no workouts", () => {
    assert.equal(longestStreak([]), 0);
  });

  it("finds the best run anywhere in the history", () => {
    assert.equal(
      longestStreak([
        "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04",
        "2026-09-10",
        "2026-09-19", "2026-09-20",
      ]),
      4,
    );
  });

  it("is never smaller than the current streak", () => {
    const days = ["2026-09-18", "2026-09-19", "2026-09-20"];
    assert.ok(longestStreak(days) >= currentStreak(days));
  });
});

describe("lastSevenDays", () => {
  it("returns seven cells ending today, oldest first", () => {
    const cells = lastSevenDays([], NOW);

    assert.equal(cells.length, 7);
    assert.deepEqual(
      cells.map((c) => c.date),
      [
        "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17",
        "2026-09-18", "2026-09-19", "2026-09-20",
      ],
    );
    assert.equal(cells[6].isToday, true);
    assert.equal(cells.filter((c) => c.isToday).length, 1);
  });

  it("labels each cell with its real UTC weekday", () => {
    // 2026-09-14 is a Monday, 2026-09-20 a Sunday.
    assert.deepEqual(
      lastSevenDays([], NOW).map((c) => c.label),
      ["M", "T", "W", "T", "F", "S", "S"],
    );
  });

  it("marks only the days actually trained", () => {
    const cells = lastSevenDays(["2026-09-16", "2026-09-20"], NOW);

    assert.deepEqual(
      cells.map((c) => c.trained),
      [false, false, true, false, false, false, true],
    );
  });

  it("ignores training older than the window", () => {
    assert.equal(
      lastSevenDays(["2026-01-01"], NOW).every((c) => !c.trained),
      true,
    );
  });
});

describe("buildStreakSummary", () => {
  it("reports an empty history without NaN or undefined", () => {
    const summary = buildStreakSummary([], NOW);

    assert.equal(summary.current, 0);
    assert.equal(summary.longest, 0);
    assert.equal(summary.lastTrainedOn, null);
    assert.equal(summary.daysSince, null);
    assert.equal(summary.isActive, false);
    assert.equal(summary.totalDays, 0);
    assert.equal(summary.lastSevenDays.length, 7);

    for (const [key, value] of Object.entries(summary)) {
      assert.notEqual(value, undefined, key);
      if (typeof value === "number") assert.equal(Number.isNaN(value), false, key);
    }
  });

  it("is active when the member trained today", () => {
    const summary = buildStreakSummary(["2026-09-20T08:00:00Z"], NOW);

    assert.equal(summary.current, 1);
    assert.equal(summary.daysSince, 0);
    assert.equal(summary.isActive, true);
  });

  it("is still active the day after, before the streak lapses", () => {
    const summary = buildStreakSummary(["2026-09-19T08:00:00Z"], NOW);

    assert.equal(summary.daysSince, 1);
    assert.equal(summary.isActive, true);
  });

  it("keeps a lapsed streak's length but marks it inactive", () => {
    const summary = buildStreakSummary(
      ["2026-09-01T08:00:00Z", "2026-09-02T08:00:00Z", "2026-09-03T08:00:00Z"],
      NOW,
    );

    assert.equal(summary.current, 3);
    assert.equal(summary.isActive, false);
    assert.equal(summary.daysSince, 17);
    assert.equal(summary.lastTrainedOn, "2026-09-03");
  });

  it("does not inflate a streak from two sessions on the same day", () => {
    const summary = buildStreakSummary(
      ["2026-09-20T07:00:00Z", "2026-09-20T18:00:00Z"],
      NOW,
    );

    assert.equal(summary.current, 1);
    assert.equal(summary.totalDays, 1);
  });

  it("handles a gap, reporting the recent run and the better older one", () => {
    const summary = buildStreakSummary(
      [
        "2026-09-01T08:00:00Z", "2026-09-02T08:00:00Z",
        "2026-09-03T08:00:00Z", "2026-09-04T08:00:00Z",
        "2026-09-19T08:00:00Z", "2026-09-20T08:00:00Z",
      ],
      NOW,
    );

    assert.equal(summary.current, 2);
    assert.equal(summary.longest, 4);
    assert.equal(summary.isActive, true);
    assert.equal(summary.totalDays, 6);
  });

  it("is reproducible — the same inputs always give the same summary", () => {
    const sessions = ["2026-09-19T08:00:00Z", "2026-09-20T08:00:00Z"];
    assert.deepEqual(
      buildStreakSummary(sessions, NOW),
      buildStreakSummary([...sessions].reverse(), NOW),
    );
  });

  it("treats a workout at 23:59 UTC and one at 00:01 the next day as two days", () => {
    const summary = buildStreakSummary(
      ["2026-09-19T23:59:00Z", "2026-09-20T00:01:00Z"],
      NOW,
    );

    assert.equal(summary.current, 2);
    assert.equal(summary.totalDays, 2);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatDashboardDate, formatGreeting } from "./daily.ts";

/**
 * Dashboard date and greeting.
 *
 *   node --experimental-strip-types --test src/lib/progress/daily.test.ts
 *
 * Regression guard for a defect found in the Part 20A audit: the dashboard
 * displayed the literal string "Monday · Week 12" to every member on every day,
 * and greeted everyone with "Good Morning" regardless of the hour.
 *
 * The date is UTC, matching `currentLogDate()` and every progress window, so
 * the dashboard cannot disagree with the streak beneath it.
 */

describe("formatDashboardDate", () => {
  it("names the real UTC weekday and date", () => {
    assert.equal(formatDashboardDate(new Date("2026-09-30T12:00:00Z")), "Wednesday · 30 Sep");
    assert.equal(formatDashboardDate(new Date("2026-09-28T09:00:00Z")), "Monday · 28 Sep");
    assert.equal(formatDashboardDate(new Date("2026-01-01T00:00:00Z")), "Thursday · 1 Jan");
  });

  it("covers every weekday", () => {
    const labels = [
      "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30",
      "2026-10-01", "2026-10-02", "2026-10-03",
    ].map((d) => formatDashboardDate(new Date(`${d}T12:00:00Z`)).split(" · ")[0]);

    assert.deepEqual(labels, [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    ]);
  });

  it("reads in UTC at the day boundary, not local time", () => {
    assert.equal(formatDashboardDate(new Date("2026-09-30T23:59:59Z")), "Wednesday · 30 Sep");
    assert.equal(formatDashboardDate(new Date("2026-10-01T00:00:00Z")), "Thursday · 1 Oct");
  });

  it("is deterministic — no ICU-dependent month names", () => {
    // toLocaleDateString returns "Sept" on some Node builds and "Sep" on
    // others; the month table here removes that variance.
    const label = formatDashboardDate(new Date("2026-09-30T12:00:00Z"));
    assert.equal(label.endsWith("30 Sep"), true);
    assert.equal(label.includes("Sept"), false);
  });

  it("never renders the old hardcoded string", () => {
    for (const iso of ["2026-09-28T12:00:00Z", "2026-09-30T12:00:00Z", "2026-12-25T12:00:00Z"]) {
      assert.equal(formatDashboardDate(new Date(iso)).includes("Week"), false);
    }
  });

  it("returns an empty label rather than throwing on an invalid date", () => {
    assert.equal(formatDashboardDate(new Date("nonsense")), "");
  });
});

describe("formatGreeting", () => {
  it("greets by first name when one is saved", () => {
    assert.equal(formatGreeting("Anthony"), "Welcome back, Anthony.");
  });

  it("stays generic when no name is saved", () => {
    assert.equal(formatGreeting(null), "Welcome back.");
  });

  it("makes no claim about the time of day", () => {
    // Deriving "morning" from UTC would be wrong by up to twelve hours for most
    // of the world, and no member timezone is stored.
    for (const greeting of [formatGreeting("Anthony"), formatGreeting(null)]) {
      for (const forbidden of ["Morning", "Afternoon", "Evening", "Night"]) {
        assert.equal(greeting.includes(forbidden), false, forbidden);
      }
    }
  });
});

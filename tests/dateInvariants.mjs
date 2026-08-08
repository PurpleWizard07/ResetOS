/**
 * Date invariants that must hold in every timezone.
 *
 * Run standalone (the harness in dateUtils.test.mjs re-runs this file under a
 * range of TZ values, since date bugs here are timezone-dependent by nature).
 */
import assert from "node:assert/strict";
import {
  toDay,
  shiftDate,
  daysAgo,
  daysBetween,
  calcStreak,
  hoursBetweenTimes,
} from "../src/lib/dateUtils.js";

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const label = (m) => `[${tz}] ${m}`;

// toDay() must agree with the local calendar, not the UTC one.
const localToday = new Date().toLocaleDateString("en-CA"); // en-CA formats as YYYY-MM-DD
assert.equal(toDay(), localToday, label("toDay() must be the local date"));

// A zero shift is the identity. This is the regression that broke sleep logs
// and the vitamin/skin week grids in UTC+ timezones.
assert.equal(shiftDate(toDay(), 0), toDay(), label("shiftDate(d, 0) === d"));
assert.equal(daysAgo(0), toDay(), label("daysAgo(0) === today"));

// Shifts compose and invert.
const t = toDay();
assert.equal(shiftDate(shiftDate(t, -1), 1), t, label("-1 then +1 round-trips"));
assert.equal(shiftDate(t, -7), daysAgo(7), label("shiftDate(-7) === daysAgo(7)"));
assert.equal(daysBetween(shiftDate(t, -1), t), 1, label("yesterday is 1 day back"));
assert.equal(daysBetween(t, t), 0, label("today is 0 days from itself"));

// A trailing 7-day window must end on today.
const week = Array.from({ length: 7 }, (_, i) => shiftDate(t, i - 6));
assert.equal(week[6], t, label("trailing week ends today"));
assert.equal(week[0], daysAgo(6), label("trailing week starts 6 days back"));
assert.equal(new Set(week).size, 7, label("trailing week has 7 distinct days"));

// Calendar edges: month, year, and leap-year boundaries.
assert.equal(shiftDate("2026-01-01", -1), "2025-12-31", label("year boundary back"));
assert.equal(shiftDate("2025-12-31", 1), "2026-01-01", label("year boundary forward"));
assert.equal(shiftDate("2026-02-28", 1), "2026-03-01", label("non-leap February"));
assert.equal(shiftDate("2024-02-28", 1), "2024-02-29", label("leap February"));
assert.equal(shiftDate("2024-03-01", -1), "2024-02-29", label("leap February back"));
assert.equal(daysBetween("2026-01-01", "2026-12-31"), 364, label("full-year span"));

// DST transitions must not add or drop a day (US spring forward / fall back 2026).
assert.equal(shiftDate("2026-03-07", 1), "2026-03-08", label("into DST"));
assert.equal(shiftDate("2026-03-08", 1), "2026-03-09", label("out of DST day"));
assert.equal(shiftDate("2026-11-01", 1), "2026-11-02", label("fall back"));
assert.equal(daysBetween("2026-03-07", "2026-03-09"), 2, label("span across DST"));

// Streaks.
assert.equal(calcStreak([]), 0, label("no dates"));
assert.equal(calcStreak([t]), 1, label("today only"));
assert.equal(calcStreak([daysAgo(1)]), 1, label("yesterday keeps the streak alive"));
assert.equal(calcStreak([daysAgo(2)]), 0, label("two days ago is broken"));
assert.equal(calcStreak([t, daysAgo(1), daysAgo(2)]), 3, label("three in a row"));
assert.equal(calcStreak([t, t, daysAgo(1)]), 2, label("duplicates collapse"));
assert.equal(calcStreak([t, daysAgo(2)]), 1, label("gap ends the run"));
assert.equal(calcStreak([daysAgo(1), daysAgo(3)]), 1, label("gap ends the run from yesterday"));
// A future-dated entry must not zero out a live streak.
assert.equal(calcStreak([shiftDate(t, 5), t, daysAgo(1)]), 2, label("future dates ignored"));

// Sleep durations, including the past-midnight wrap.
assert.equal(hoursBetweenTimes("23:30", "07:00"), 7.5, label("wraps midnight"));
assert.equal(hoursBetweenTimes("22:00", "06:00"), 8, label("wraps midnight, whole hours"));
assert.equal(hoursBetweenTimes("01:00", "09:30"), 8.5, label("same-day span"));
assert.equal(hoursBetweenTimes("08:00", "08:00"), 24, label("equal times span a full day"));
assert.equal(hoursBetweenTimes("", "07:00"), 0, label("missing start"));
assert.equal(hoursBetweenTimes("bad", "07:00"), 0, label("unparseable input"));

console.log(`ok ${tz}`);

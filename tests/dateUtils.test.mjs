import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const invariants = fileURLToPath(new URL("./dateInvariants.mjs", import.meta.url));

/**
 * The date helpers were previously written with toISOString(), which silently
 * shifted every date back a day in UTC+ timezones. Asserting only in the
 * machine's local timezone would not have caught it, so run the whole suite
 * across the extremes.
 */
const TIMEZONES = [
  "UTC",
  "Asia/Kolkata", // UTC+5:30 — the half-hour offset this app is used in
  "Asia/Kathmandu", // UTC+5:45 — quarter-hour offset
  "Pacific/Kiritimati", // UTC+14 — furthest ahead
  "Pacific/Niue", // UTC-11 — furthest behind
  "America/New_York", // DST, negative offset
  "Australia/Lord_Howe", // half-hour DST shift
];

for (const tz of TIMEZONES) {
  test(`date invariants hold in ${tz}`, () => {
    let output;
    try {
      output = execFileSync(process.execPath, [invariants], {
        env: { ...process.env, TZ: tz },
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (err) {
      assert.fail(`${tz}: ${err.stderr || err.message}`);
    }
    assert.match(output, /^ok /m, `${tz}: invariant script did not report ok`);
  });
}

/**
 * Every date in this app is a local-calendar "YYYY-MM-DD" string.
 *
 * Never use toISOString() to produce one: it serializes in UTC, so in any
 * timezone east of Greenwich local midnight lands on the previous UTC day and
 * every date shifts back by one. Use isoLocal() instead.
 */
const isoLocal = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

/** Parse a "YYYY-MM-DD" string as local midnight. */
const parseDay = (dStr) => {
  const [y, m, d] = String(dStr).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const toDay = () => isoLocal(new Date());

export const shiftDate = (dStr, delta) => {
  const d = parseDay(dStr);
  d.setDate(d.getDate() + delta);
  return isoLocal(d);
};

export const daysAgo = (n) => shiftDate(toDay(), -n);

/** Whole days between two "YYYY-MM-DD" strings (later - earlier). */
export const daysBetween = (fromStr, toStr) =>
  Math.round((parseDay(toStr) - parseDay(fromStr)) / 86400000);

export const fmt = (d) =>
  parseDay(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const fmtLong = (d) =>
  parseDay(d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

export const nowT = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
};

export const getDayName = (n) =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][n];

/**
 * Consecutive-day run ending today or yesterday (so a streak stays alive until
 * the day is actually missed). Future-dated entries are ignored rather than
 * zeroing the streak.
 */
export const calcStreak = (dates) => {
  const today = toDay();
  const unique = [...new Set(dates)]
    .filter((d) => d && daysBetween(d, today) >= 0)
    .sort()
    .reverse();
  if (!unique.length) return 0;

  const gapToNewest = daysBetween(unique[0], today);
  if (gapToNewest > 1) return 0;

  let streak = 0;
  let expected = gapToNewest;
  for (const d of unique) {
    if (daysBetween(d, today) === expected) {
      streak++;
      expected++;
    } else break;
  }
  return streak;
};

/** Duration in hours between two "HH:MM" times, wrapping past midnight. */
export const hoursBetweenTimes = (start, end) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some(Number.isNaN)) return 0;
  const startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (endMin <= startMin) endMin += 24 * 60;
  return (endMin - startMin) / 60;
};

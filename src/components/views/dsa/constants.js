import { C } from "@/ui/theme";
import { CATEGORY_NAMES, DIFFICULTIES } from "@/lib/neetcode150";

export { DIFFICULTIES };

/** Badge/Chip palette key per difficulty, for the primitives that take one. */
export const DIFF_COLOR = { Easy: "suc", Medium: "war", Hard: "dan" };

/**
 * Raw hex per difficulty. Difficulty is the one thing that has to be
 * recognisable without reading — so it is carried by colour on plain text
 * rather than by yet another filled pill.
 */
export const DIFF_HEX = { Easy: C.suc, Medium: C.war, Hard: C.dan };

export const SOURCES = ["LeetCode", "GeeksForGeeks", "CodeForces", "HackerRank", "InterviewBit", "Other"];

export const EMPTY_ADD_FORM = {
  name: "",
  source: "LeetCode",
  link: "",
  tags: "",
  difficulty: "Medium",
  category: "",
  pattern: "",
};

/** A row is solved iff it has a solved date. See supabase/schema.sql. */
export const isSolved = (p) => Boolean(p.date);

/**
 * Whether you have written anything down about a problem. Drives the small
 * "has notes" mark in the list and the "Needs notes" filter — solving a
 * problem without writing the insight down is the thing worth surfacing.
 */
export const hasWriteup = (p, approachCount = 0) =>
  Boolean(p.restated || p.key_insight || p.why_it_works || p.pitfalls || p.notes) || approachCount > 0;

export const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "next", label: "Next up" },
  { id: "unsolved", label: "Unsolved" },
  { id: "solved", label: "Solved" },
  { id: "nonotes", label: "Needs notes" },
];

/** How many unsolved problems "Next up" shows, walking down catalog order. */
export const NEXT_UP_COUNT = 10;

export const CATEGORY_ORDER = CATEGORY_NAMES;

/**
 * Solved/total plus a percentage, for a set of problems. Used for the overall
 * bar, each difficulty, and each category — one helper so a 0/0 category can
 * never render NaN%.
 */
export const progressOf = (problems) => {
  const total = problems.length;
  const solved = problems.filter(isSolved).length;
  return { solved, total, pct: total ? Math.round((solved / total) * 100) : 0 };
};

/**
 * Groups problems by category, in NeetCode's order, carrying each group's
 * progress. Categories the catalog defines but that hold no rows are dropped,
 * so a partially seeded database doesn't render 18 empty headings; anything
 * with a category outside the catalog (your own additions) is appended last.
 */
export const groupByCategory = (problems) => {
  const buckets = new Map();
  for (const p of problems) {
    const key = p.category || "Uncategorised";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(p);
  }
  const known = CATEGORY_ORDER.filter((name) => buckets.has(name));
  const extra = [...buckets.keys()].filter((name) => !CATEGORY_ORDER.includes(name)).sort();
  return [...known, ...extra].map((name) => ({
    name,
    problems: buckets.get(name),
    ...progressOf(buckets.get(name)),
  }));
};

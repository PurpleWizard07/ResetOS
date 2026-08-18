import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORIES,
  CATEGORY_NAMES,
  DIFFICULTIES,
  NEETCODE_150,
  PROBLEM_BY_SLUG,
  TOTAL_PROBLEMS,
  catalogFields,
  seedRow,
} from "../src/lib/neetcode150.js";

/**
 * The catalog is data, and data that is seeded straight into a database is
 * worth asserting on. A silently duplicated slug would make the seed skip a
 * problem; a title typo'd into an existing title would make the count look
 * right while a problem was missing; a bad slug would produce a 404 link on a
 * row that otherwise looks fine. None of those are visible by reading.
 */

/** The official per-category counts. These sum to 150 — that is the point. */
const EXPECTED_COUNTS = {
  "Arrays & Hashing": 9,
  "Two Pointers": 5,
  "Sliding Window": 6,
  Stack: 7,
  "Binary Search": 7,
  "Linked List": 11,
  Trees: 15,
  Tries: 3,
  "Heap / Priority Queue": 7,
  Backtracking: 9,
  Graphs: 13,
  "Advanced Graphs": 6,
  "1-D Dynamic Programming": 12,
  "2-D Dynamic Programming": 11,
  Greedy: 8,
  Intervals: 6,
  "Math & Geometry": 8,
  "Bit Manipulation": 7,
};

test("there are exactly 150 problems", () => {
  assert.equal(NEETCODE_150.length, 150);
  assert.equal(TOTAL_PROBLEMS, 150);
});

test("all 18 categories are present, in NeetCode order", () => {
  assert.equal(CATEGORIES.length, 18);
  assert.deepEqual(CATEGORY_NAMES, Object.keys(EXPECTED_COUNTS));
  // Every category must be non-empty, or a heading would render with no rows.
  for (const name of CATEGORY_NAMES) {
    assert.ok(
      NEETCODE_150.some((p) => p.category === name),
      `category "${name}" has no problems`
    );
  }
});

test("each category holds its official number of problems", () => {
  for (const [name, expected] of Object.entries(EXPECTED_COUNTS)) {
    const actual = NEETCODE_150.filter((p) => p.category === name).length;
    assert.equal(actual, expected, `${name}: expected ${expected}, got ${actual}`);
  }
  const summed = Object.values(EXPECTED_COUNTS).reduce((a, b) => a + b, 0);
  assert.equal(summed, 150, "per-category counts must sum to 150");
});

test("slugs are unique — the seed is keyed on them", () => {
  const slugs = NEETCODE_150.map((p) => p.slug);
  assert.equal(new Set(slugs).size, 150, "duplicate slug would make the seed skip a problem");
  assert.equal(PROBLEM_BY_SLUG.size, 150);
});

test("titles are unique", () => {
  const titles = NEETCODE_150.map((p) => p.title);
  assert.equal(new Set(titles).size, 150);
});

test("every problem has a well-formed LeetCode URL matching its slug", () => {
  for (const p of NEETCODE_150) {
    assert.equal(p.source, "LeetCode", `${p.title}: platform must be LeetCode`);
    assert.equal(p.url, `https://leetcode.com/problems/${p.slug}/`, `${p.title}: url must derive from slug`);
    // Parses as a real URL, and the slug is a plausible LeetCode slug.
    const parsed = new URL(p.url);
    assert.equal(parsed.protocol, "https:");
    assert.equal(parsed.host, "leetcode.com");
    assert.match(p.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${p.title}: slug "${p.slug}" is not url-safe`);
  }
});

test("difficulties are one of Easy/Medium/Hard, and all three are used", () => {
  for (const p of NEETCODE_150) {
    assert.ok(DIFFICULTIES.includes(p.difficulty), `${p.title}: bad difficulty "${p.difficulty}"`);
  }
  for (const d of DIFFICULTIES) {
    assert.ok(NEETCODE_150.some((p) => p.difficulty === d), `no ${d} problems`);
  }
});

test("problem numbers run 1..150 in category order", () => {
  NEETCODE_150.forEach((p, i) => {
    assert.equal(p.number, i + 1, `${p.title}: expected number ${i + 1}`);
  });
  // Numbering must not interleave categories: each group is a contiguous run,
  // and the runs appear in CATEGORIES order.
  let cursor = 0;
  for (const [ci, name] of CATEGORY_NAMES.entries()) {
    const group = NEETCODE_150.filter((p) => p.category === name);
    assert.equal(group[0].number, cursor + 1, `${name} does not start where the previous category ended`);
    group.forEach((p, i) => {
      assert.equal(p.number, cursor + i + 1, `${p.title} is out of order within ${name}`);
      assert.equal(p.categoryOrder, ci + 1, `${p.title}: categoryOrder must be ${ci + 1}`);
    });
    cursor += group.length;
  }
  assert.equal(cursor, 150);
});

test("every problem carries a pattern and at least one tag", () => {
  for (const p of NEETCODE_150) {
    assert.ok(p.pattern && p.pattern.trim(), `${p.title}: missing pattern`);
    assert.ok(Array.isArray(p.tags) && p.tags.length > 0, `${p.title}: missing tags`);
    assert.ok(p.tags.every((t) => typeof t === "string" && t.trim()), `${p.title}: blank tag`);
  }
});

test("seed rows start unsolved with clean writeup fields", () => {
  for (const p of NEETCODE_150) {
    const row = seedRow(p);
    // Solved state IS the date, so a fresh row must have none.
    assert.equal(row.date, null, `${p.title}: must seed as not solved`);
    assert.equal(row.last_revised, null);
    for (const field of ["restated", "key_insight", "why_it_works", "pitfalls", "notes"]) {
      assert.equal(row[field], "", `${p.title}: ${field} must seed empty`);
    }
    assert.equal(row.slug, p.slug);
    assert.equal(row.problem_order, p.number);
    assert.equal(row.category_order, p.categoryOrder);
  }
});

test("a re-seed refreshes catalog columns but never touches your writing", () => {
  const fields = Object.keys(catalogFields(NEETCODE_150[0]));
  assert.deepEqual(fields.sort(), [
    "category",
    "category_order",
    "difficulty",
    "link",
    "name",
    "problem_order",
    "source",
  ]);
  // The whole point: nothing the user owns may appear in an update-on-re-seed.
  for (const owned of ["date", "notes", "restated", "key_insight", "why_it_works", "pitfalls", "pattern", "tags", "last_revised"]) {
    assert.ok(!fields.includes(owned), `re-seeding would overwrite "${owned}"`);
  }
});

test("a handful of known problems are exactly right", () => {
  // Spot-checks across the list — a sanity net for a bulk edit to the data.
  const expected = [
    ["two-sum", "Two Sum", "Easy", "Arrays & Hashing", 3],
    ["trapping-rain-water", "Trapping Rain Water", "Hard", "Two Pointers", 14],
    ["largest-rectangle-in-histogram", "Largest Rectangle In Histogram", "Hard", "Stack", 27],
    ["lru-cache", "LRU Cache", "Medium", "Linked List", 43],
    ["word-search-ii", "Word Search II", "Hard", "Tries", 63],
    ["n-queens", "N Queens", "Hard", "Backtracking", 79],
    ["alien-dictionary", "Alien Dictionary", "Hard", "Advanced Graphs", 97],
    ["edit-distance", "Edit Distance", "Medium", "2-D Dynamic Programming", 119],
    ["meeting-rooms-ii", "Meeting Rooms II", "Medium", "Intervals", 134],
    ["reverse-integer", "Reverse Integer", "Medium", "Bit Manipulation", 150],
  ];
  for (const [slug, title, difficulty, category, number] of expected) {
    const p = PROBLEM_BY_SLUG.get(slug);
    assert.ok(p, `missing ${slug}`);
    assert.equal(p.title, title);
    assert.equal(p.difficulty, difficulty);
    assert.equal(p.category, category);
    assert.equal(p.number, number);
  }
});

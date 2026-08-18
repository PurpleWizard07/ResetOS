"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/contexts/ToastContext";
import { supabase } from "@/lib/supabase";
import { toDay } from "@/lib/dateUtils";
import { NEETCODE_150, TOTAL_PROBLEMS, catalogFields, seedRow } from "@/lib/neetcode150";

// Kept out of the eager mount fetch below — code can run to a few hundred
// lines per approach, and dragging that down for every problem on every
// page load is the exact payload growth the child-table split exists to
// avoid. `loadApproachDetails` fetches it separately, only when a problem's
// detail view actually opens.
const APPROACH_LIST_COLUMNS = "id, problem_id, sort_index, label, time_complexity, space_complexity, is_primary";

/** Postgres rejects a 150-row insert in one statement far less happily than five 30-row ones. */
const SEED_CHUNK = 30;

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export function useDsa() {
  const { rows, setRows, add, update, remove, loading } = useSupabaseTable("dsa_problems", {
    // Deliberately no `orderBy`. Ordering by `problem_order` server-side would
    // make the very first page load fail with a raw "column does not exist"
    // error on a database where the migration has not been run yet — the one
    // moment the user most needs a comprehensible screen. `select *` always
    // succeeds, the rows come back with no slug, and the setup card explains
    // itself. Catalog order is applied below instead.
    label: "DSA problem",
  });
  const approaches = useSupabaseTable("dsa_approaches", {
    orderBy: "sort_index",
    ascending: true,
    label: "approach",
    select: APPROACH_LIST_COLUMNS,
  });
  const { notify, notifyError } = useToast();
  const [seeding, setSeeding] = useState(false);

  /**
   * Catalog order — NeetCode's study order — applied once here so every
   * consumer (the list, the grouping, "Next up", the export) sees the same
   * order without sorting again. Problems you added yourself have no
   * problem_order and sort last, alphabetically among themselves.
   */
  const problems = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const ao = a.problem_order ?? Infinity;
        const bo = b.problem_order ?? Infinity;
        if (ao !== bo) return ao - bo;
        return (a.name || "").localeCompare(b.name || "");
      }),
    [rows]
  );

  /**
   * How much of the 150 is actually in the database. Drives the setup card:
   * `missing > 0` means the catalog has never been seeded (or a row was
   * deleted), and `legacy` counts pre-NeetCode hand-logged rows that the
   * seed will clear out.
   */
  const catalogStatus = useMemo(() => {
    const present = new Set(rows.filter((r) => r.slug).map((r) => r.slug));
    return {
      present: present.size,
      total: TOTAL_PROBLEMS,
      missing: TOTAL_PROBLEMS - present.size,
      legacy: rows.filter((r) => !r.slug).length,
      complete: present.size === TOTAL_PROBLEMS,
    };
  }, [rows]);

  // Belt-and-braces against a double-click race: `seeding` state only disables
  // the button after React re-renders, which is one tick too late to stop a
  // second call fired in the same event-loop turn. Both invocations would
  // otherwise compute the same "150 missing" snapshot and insert the same
  // rows twice, in which case the second insert to reach any given slug hits
  // the unique index and hard-fails that whole batch — which is exactly the
  // shape of bug below, just from concurrency instead of a transient error.
  const seedingRef = useRef(false);

  /**
   * Brings the database in line with src/lib/neetcode150.js. Safe to run any
   * number of times — it is keyed on `slug`, so it:
   *   - deletes rows with no slug (the old hand-logged sample problems, which
   *     are not part of the curriculum)
   *   - inserts only the problems that aren't there yet
   *   - refreshes the catalog columns (title/url/difficulty/category/order) on
   *     rows that are, and touches nothing else — your solved date, writeup,
   *     pitfalls, notes, pattern, tags and approaches all survive a re-run.
   *
   * Insertion is chunked (Postgres/PostgREST handle a 150-row insert far less
   * happily than five 30-row ones), and every chunk is attempted even if an
   * earlier one fails: each `insert` is committed the moment it succeeds, so
   * a bug that stopped at the first error used to strand whatever had already
   * landed — e.g. two good chunks committing 60 rows, a third chunk failing,
   * and the run aborting before ever trying the remaining 90. Failing soft
   * and continuing means one bad or timed-out chunk costs only itself, and
   * pressing the button again (still perfectly safe — see above) mops up
   * whatever didn't make it in.
   */
  const seedCatalog = useCallback(async () => {
    if (seedingRef.current) return false;
    seedingRef.current = true;
    setSeeding(true);
    try {
      const { data: existing, error: readErr } = await supabase.from("dsa_problems").select("id, slug");
      if (readErr) {
        // The overwhelmingly likely cause is the migration not having been run
        // yet — "column dsa_problems.slug does not exist" is not self-evidently
        // a missing-migration message unless you already know to look for it.
        notifyError("Could not read the DSA table. Run supabase/migrations/001_dsa_neetcode150.sql first", readErr);
        return false;
      }

      const legacyIds = existing.filter((r) => !r.slug).map((r) => r.id);
      if (legacyIds.length) {
        const { error } = await supabase.from("dsa_problems").delete().in("id", legacyIds);
        if (error) notifyError("Could not clear the old DSA entries", error);
      }

      const have = new Set(existing.filter((r) => r.slug).map((r) => r.slug));
      const toInsert = NEETCODE_150.filter((p) => !have.has(p.slug)).map(seedRow);
      let insertedCount = 0;
      let insertError = null;
      for (const batch of chunk(toInsert, SEED_CHUNK)) {
        // `ignoreDuplicates` turns "this slug already exists" from a hard
        // failure (the whole 30-row batch rejected) into a silent no-op for
        // just that row — the same protection a retry after a partial failure
        // above relies on, and a second guard against the double-click race.
        const { error, count } = await supabase
          .from("dsa_problems")
          .upsert(batch, { onConflict: "slug", ignoreDuplicates: true, count: "exact" });
        if (error) {
          insertError = error;
          continue; // keep going — a later chunk failing here shouldn't cost the rest
        }
        insertedCount += count ?? batch.length;
      }
      if (insertError) notifyError("Some NeetCode problems could not be added — press Import again to retry", insertError);

      // Re-point rows that already existed at the current catalog text, so a
      // correction here reaches a database seeded before it was made.
      const stale = NEETCODE_150.filter((p) => have.has(p.slug));
      const results = await Promise.all(
        stale.map((p) => supabase.from("dsa_problems").update(catalogFields(p)).eq("slug", p.slug))
      );
      const failed = results.find((r) => r.error);
      if (failed) notifyError("Could not refresh some problem details", failed.error);

      // Re-read rather than patching state by hand: the inserts happened in
      // batches and the updates by slug, so a fresh fetch is both simpler and
      // the only way to be sure state matches the database — always, even
      // when a chunk above failed, so the screen never shows stale counts.
      const { data, error } = await supabase.from("dsa_problems").select("*");
      if (error) {
        notifyError("Problems were saved, but could not be re-loaded — refresh the page", error);
        return false;
      }
      setRows(data);
      if (!insertError && !failed) {
        notify(
          insertedCount
            ? `Added ${insertedCount} problem${insertedCount === 1 ? "" : "s"} — NeetCode 150 is ready`
            : "NeetCode 150 is already complete"
        );
      }
      return !insertError && !failed;
    } finally {
      setSeeding(false);
      seedingRef.current = false;
    }
  }, [notify, notifyError, setRows]);

  const addProblem = useCallback(
    (form) =>
      add({
        name: form.name,
        source: form.source,
        link: form.link,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        difficulty: form.difficulty,
        category: form.category || null,
        pattern: form.pattern || "",
        date: null,
      }),
    [add]
  );

  /**
   * Patches writeup/metadata fields from the detail view. `tags` arrives as a
   * comma string when it comes from a text field, and as an array when it does
   * not — accept either rather than making every caller normalise it.
   */
  const updateProblem = useCallback(
    (id, patch) =>
      update(id, {
        ...patch,
        ...(typeof patch.tags === "string"
          ? { tags: patch.tags.split(",").map((t) => t.trim()).filter(Boolean) }
          : {}),
      }),
    [update]
  );

  /** Solved state IS `date`: stamp today to solve, null it to un-solve. */
  const toggleSolved = useCallback(
    (id, solved) => update(id, { date: solved ? toDay() : null }),
    [update]
  );

  const markReviewed = useCallback((id) => update(id, { last_revised: toDay() }), [update]);

  /** Fetches idea/code for one problem's approaches and merges them into the light rows already in state. */
  const loadApproachDetails = useCallback(
    async (problemId) => {
      const { data, error } = await supabase
        .from("dsa_approaches")
        .select("id, idea, code")
        .eq("problem_id", problemId);
      if (error) {
        notifyError("Could not load approach code", error);
        return;
      }
      const byId = new Map(data.map((d) => [d.id, d]));
      approaches.setRows((rows) => rows.map((r) => (byId.has(r.id) ? { ...r, ...byId.get(r.id) } : r)));
    },
    [approaches, notifyError]
  );

  /** New approaches append after the current highest sort_index and become primary only if they're the first for this problem. */
  const addApproach = useCallback(
    (problemId, payload = {}) => {
      const mine = approaches.rows.filter((a) => a.problem_id === problemId);
      const sortIndex = mine.length ? Math.max(...mine.map((a) => a.sort_index)) + 1 : 0;
      return approaches.add({
        problem_id: problemId,
        sort_index: sortIndex,
        label: payload.label || "New approach",
        idea: payload.idea || "",
        code: payload.code || "",
        time_complexity: payload.time_complexity || "",
        space_complexity: payload.space_complexity || "",
        is_primary: mine.length === 0,
      });
    },
    [approaches]
  );

  const updateApproach = useCallback((id, patch) => approaches.update(id, patch), [approaches]);

  const removeApproach = useCallback((id) => approaches.remove(id), [approaches]);

  /** Marks one approach primary (the one you'd reproduce under pressure) and un-marks every other approach on the same problem. */
  const setPrimaryApproach = useCallback(
    async (problemId, approachId) => {
      const others = approaches.rows.filter((a) => a.problem_id === problemId && a.id !== approachId && a.is_primary);
      await Promise.all([
        approaches.update(approachId, { is_primary: true }),
        ...others.map((a) => approaches.update(a.id, { is_primary: false })),
      ]);
    },
    [approaches]
  );

  return {
    problems,
    addProblem,
    updateProblem,
    toggleSolved,
    markReviewed,
    remove,
    loading,
    catalogStatus,
    seedCatalog,
    seeding,
    approaches: approaches.rows,
    approachesLoading: approaches.loading,
    loadApproachDetails,
    addApproach,
    updateApproach,
    removeApproach,
    setPrimaryApproach,
  };
}

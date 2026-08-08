"use client";
import { useState } from "react";

/**
 * A form that reloads from `entity` (the row matching `activeDate`, or
 * `undefined` if none exists yet) whenever the date *or* the matched row
 * changes — instead of carrying over whatever was last typed for a
 * different date, which could silently overwrite a different day's real
 * entry with stale toggle state.
 *
 * Keying the resync on `entity?.id` (every row from useSupabaseTable has one)
 * as well as `activeDate` matters because `entity` starts `undefined` while
 * the table's initial Supabase fetch is still in flight — keying on the date
 * alone would only resync on a date *switch*, so a day that already had an
 * entry would show an empty form until the user switched away and back.
 *
 * State is adjusted during render (React's documented escape hatch for
 * "derive state from a prop change") rather than in an effect, so the reset
 * lands in the same commit instead of an extra render pass.
 *
 * Usage:
 * ```
 * const entryForDate = logs.find((l) => l.date === activeDate);
 * const [form, setForm] = usePerDateForm(activeDate, entryForDate, EMPTY_FORM, (e) => ({
 *   content: e.content, act: e.act, urge: e.urge, note: e.note || "",
 * }));
 * ```
 */
export function usePerDateForm(activeDate, entity, emptyForm, toForm = (e) => e) {
  const derive = () => (entity ? toForm(entity) : emptyForm);
  const key = `${activeDate}:${entity?.id ?? ""}`;

  const [form, setForm] = useState(derive);
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setForm(derive());
  }

  return [form, setForm];
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

/**
 * Generic CRUD-over-a-table hook. Every mutation reports failures through the
 * toast instead of silently no-opping — the failure mode the original app
 * had at every one of its ~30 call sites (an RLS denial or a dropped
 * connection just looked like the button did nothing).
 *
 * `map` transforms a raw row (e.g. renaming duration_hours -> durationHours);
 * it is applied on load and on every insert/update so state is consistent.
 *
 * `select` narrows the initial fetch (default "*"). Pass an explicit column
 * list to keep a heavy column (e.g. approach code) out of the eager mount
 * fetch — load it separately, on demand, via a raw supabase call instead.
 */
export function useSupabaseTable(
  table,
  { orderBy, ascending = true, map, label, select = "*" } = {}
) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifyError } = useToast();
  const name = label || table;
  const toRow = map || ((r) => r);

  useEffect(() => {
    let active = true;
    (async () => {
      let q = supabase.from(table).select(select);
      if (orderBy) q = q.order(orderBy, { ascending });
      const { data, error } = await q;
      if (!active) return;
      if (error) notifyError(`Could not load ${name}`, error);
      else if (data) setRows(data.map(toRow));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
    // Intentionally mount-only: table/orderBy/map/select are static per hook instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = useCallback(
    async (payload) => {
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select()
        .single();
      if (error) {
        notifyError(`Could not save ${name}`, error);
        return null;
      }
      const row = toRow(data);
      setRows((p) => [...p, row]);
      return row;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, name]
  );

  const update = useCallback(
    async (id, patch) => {
      const { data, error } = await supabase
        .from(table)
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        notifyError(`Could not update ${name}`, error);
        return null;
      }
      const row = toRow(data);
      setRows((p) => p.map((r) => (r.id === id ? row : r)));
      return row;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, name]
  );

  const remove = useCallback(
    async (id) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        notifyError(`Could not delete from ${name}`, error);
        return false;
      }
      setRows((p) => p.filter((r) => r.id !== id));
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, name]
  );

  return { rows, setRows, add, update, remove, loading };
}

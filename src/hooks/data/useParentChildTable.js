"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

/**
 * Shared shape for a "parent item + logs against it, keyed by date" pair —
 * vitamins/vitamin_logs, skin_routine_items/skin_routine_logs, etc. Every
 * child table here has an `on delete cascade` FK to its parent (see
 * supabase/schema.sql), so deleting the parent is enough on the server;
 * `removeParent` only needs to patch the *local* child cache afterward,
 * rather than issuing its own child-table delete first.
 *
 * Usage:
 * ```
 * const { parent: vitamins, child: logs, removeParent, toggleChild } = useParentChildTable(
 *   "vitamins", "vitamin_logs", "vitamin_id",
 *   { parent: { orderBy: "created_at", label: "vitamin" }, child: { label: "vitamin log" } }
 * );
 * ```
 */
export function useParentChildTable(parentTable, childTable, childFk, opts = {}) {
  const parent = useSupabaseTable(parentTable, opts.parent);
  const child = useSupabaseTable(childTable, opts.child);

  const removeParent = useCallback(
    async (parentId) => {
      const ok = await parent.remove(parentId);
      if (ok) child.setRows((rows) => rows.filter((r) => r[childFk] !== parentId));
      return ok;
    },
    [parent, child, childFk]
  );

  const toggleChild = useCallback(
    async (parentId, date) => {
      const existing = child.rows.find((r) => r[childFk] === parentId && r.date === date);
      if (existing) await child.remove(existing.id);
      else await child.add({ [childFk]: parentId, date });
    },
    [child, childFk]
  );

  return { parent, child, removeParent, toggleChild };
}

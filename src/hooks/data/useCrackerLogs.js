"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

export function useCrackerLogs() {
  const { rows, add, update, remove, loading } = useSupabaseTable(
    "cracker_logs",
    { orderBy: "date", ascending: false, label: "check-in" }
  );

  /**
   * Upserts by date; if every field is at its empty default, deletes the
   * entry instead of storing a row that says nothing.
   */
  const saveEntry = useCallback(
    async (date, form) => {
      const existing = rows.find((l) => l.date === date);
      const hasData = form.content || form.act || form.urge || form.note.trim();
      const note = form.note.trim();

      if (!hasData) {
        if (existing) await remove(existing.id);
        return null;
      }
      const patch = { content: form.content, act: form.act, urge: form.urge, note };
      return existing ? update(existing.id, patch) : add({ date, ...patch });
    },
    [rows, add, update, remove]
  );

  return { logs: rows, saveEntry, remove, loading };
}

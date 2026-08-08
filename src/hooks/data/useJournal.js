"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

export function useJournal() {
  const { rows, add, update, remove, loading } = useSupabaseTable(
    "journal_entries",
    { orderBy: "date", ascending: false, label: "journal entry" }
  );

  const save = useCallback(
    async (date, title, content) => {
      const existing = rows.find((e) => e.date === date);
      return existing
        ? update(existing.id, { title, content })
        : add({ date, title, content });
    },
    [rows, add, update]
  );

  return { entries: rows, save, remove, loading };
}

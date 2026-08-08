"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

export function useSystemDesign() {
  const { rows, add, update, remove, loading } = useSupabaseTable(
    "system_design",
    { orderBy: "created_at", ascending: false, label: "topic" }
  );

  const save = useCallback(
    (form, editingId) => {
      const refs = form.refs.split(",").map((r) => r.trim()).filter(Boolean);
      const payload = { topic: form.topic, notes: form.notes, refs };
      return editingId ? update(editingId, payload) : add(payload);
    },
    [add, update]
  );

  return { topics: rows, save, remove, loading };
}

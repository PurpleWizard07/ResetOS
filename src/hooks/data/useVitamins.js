"use client";
import { useCallback } from "react";
import { useParentChildTable } from "@/hooks/data/useParentChildTable";

export function useVitamins() {
  const {
    parent: vitamins,
    child: logs,
    removeParent,
    toggleChild,
  } = useParentChildTable("vitamins", "vitamin_logs", "vitamin_id", {
    parent: { orderBy: "created_at", ascending: true, label: "vitamin" },
    child: { label: "vitamin log" },
  });

  const save = useCallback(
    (form, editingId) => (editingId ? vitamins.update(editingId, form) : vitamins.add(form)),
    [vitamins]
  );

  /** Deletes the vitamin and every log recorded against it, server and local. */
  const remove = useCallback((vitamin) => removeParent(vitamin.id), [removeParent]);

  const toggleLog = useCallback((vitaminId, date) => toggleChild(vitaminId, date), [toggleChild]);

  return {
    vitamins: vitamins.rows,
    vitaminLogs: logs.rows,
    save,
    remove,
    toggleLog,
    loading: vitamins.loading || logs.loading,
  };
}

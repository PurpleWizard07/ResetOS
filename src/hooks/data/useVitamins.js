"use client";
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/contexts/ToastContext";

export function useVitamins() {
  const vitamins = useSupabaseTable("vitamins", {
    orderBy: "created_at",
    ascending: true,
    label: "vitamin",
  });
  const logs = useSupabaseTable("vitamin_logs", { label: "vitamin log" });
  const { notifyError } = useToast();

  const save = useCallback(
    (form, editingId) =>
      editingId ? vitamins.update(editingId, form) : vitamins.add(form),
    [vitamins]
  );

  /** Deletes the vitamin and every log recorded against it, server and local. */
  const remove = useCallback(
    async (vitamin) => {
      const { error } = await supabase
        .from("vitamin_logs")
        .delete()
        .eq("vitamin_id", vitamin.id);
      if (error) {
        notifyError("Could not delete vitamin logs", error);
        return false;
      }
      const ok = await vitamins.remove(vitamin.id);
      if (ok) {
        logs.setRows((p) => p.filter((l) => l.vitamin_id !== vitamin.id));
      }
      return ok;
    },
    [vitamins, logs, notifyError]
  );

  const toggleLog = useCallback(
    async (vitaminId, date) => {
      const existing = logs.rows.find(
        (l) => l.vitamin_id === vitaminId && l.date === date
      );
      if (existing) await logs.remove(existing.id);
      else await logs.add({ vitamin_id: vitaminId, date });
    },
    [logs]
  );

  return {
    vitamins: vitamins.rows,
    vitaminLogs: logs.rows,
    save,
    remove,
    toggleLog,
    loading: vitamins.loading || logs.loading,
  };
}

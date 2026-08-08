"use client";
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/contexts/ToastContext";

export function useSkinRoutine() {
  const items = useSupabaseTable("skin_routine_items", {
    orderBy: "created_at",
    ascending: true,
    label: "routine item",
  });
  const logs = useSupabaseTable("skin_routine_logs", { label: "routine log" });
  const { notifyError } = useToast();

  const addItem = useCallback(
    (routine, name) => items.add({ routine, name }),
    [items]
  );

  const removeItem = useCallback(
    async (item) => {
      const { error } = await supabase
        .from("skin_routine_logs")
        .delete()
        .eq("item_id", item.id);
      if (error) {
        notifyError("Could not delete routine logs", error);
        return false;
      }
      const ok = await items.remove(item.id);
      if (ok) logs.setRows((p) => p.filter((l) => l.item_id !== item.id));
      return ok;
    },
    [items, logs, notifyError]
  );

  const toggleLog = useCallback(
    async (itemId, date) => {
      const existing = logs.rows.find((l) => l.item_id === itemId && l.date === date);
      if (existing) await logs.remove(existing.id);
      else await logs.add({ item_id: itemId, date });
    },
    [logs]
  );

  return {
    items: items.rows,
    logs: logs.rows,
    addItem,
    removeItem,
    toggleLog,
    loading: items.loading || logs.loading,
  };
}

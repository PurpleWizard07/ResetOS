"use client";
import { useCallback } from "react";
import { useParentChildTable } from "@/hooks/data/useParentChildTable";

export function useSkinRoutine() {
  const {
    parent: items,
    child: logs,
    removeParent,
    toggleChild,
  } = useParentChildTable("skin_routine_items", "skin_routine_logs", "item_id", {
    parent: { orderBy: "created_at", ascending: true, label: "routine item" },
    child: { label: "routine log" },
  });

  const addItem = useCallback((routine, name) => items.add({ routine, name }), [items]);

  const removeItem = useCallback((item) => removeParent(item.id), [removeParent]);

  const toggleLog = useCallback((itemId, date) => toggleChild(itemId, date), [toggleChild]);

  return {
    items: items.rows,
    logs: logs.rows,
    addItem,
    removeItem,
    toggleLog,
    loading: items.loading || logs.loading,
  };
}

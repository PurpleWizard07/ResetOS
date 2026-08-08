"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

export function useStrengthLogs() {
  const { rows, add, update, remove, loading } = useSupabaseTable(
    "strength_logs",
    { orderBy: "date", ascending: false, label: "workout log" }
  );

  const logWorkout = useCallback(
    (date, type, notes) => add({ date, type, notes }),
    [add]
  );

  return { logs: rows, logWorkout, update, remove, loading };
}

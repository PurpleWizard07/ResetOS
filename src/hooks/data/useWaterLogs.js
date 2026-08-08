"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { nowT } from "@/lib/dateUtils";

export function useWaterLogs() {
  const { rows, add, update, remove, loading } = useSupabaseTable("water_logs", {
    orderBy: "created_at",
    ascending: true,
    label: "water log",
  });

  const logAmount = useCallback(
    (amount, date) => add({ date, amount, time: nowT() }),
    [add]
  );

  return { logs: rows, logAmount, updateAmount: update, remove, loading };
}

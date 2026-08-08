"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

export function useWeightLogs() {
  const { rows, add, remove, loading } = useSupabaseTable("weight_logs", {
    orderBy: "date",
    ascending: false,
    label: "weight entry",
  });

  const logWeight = useCallback(
    (date, weight, note) => add({ date, weight: parseFloat(weight), note }),
    [add]
  );

  return { logs: rows, logWeight, remove, loading };
}

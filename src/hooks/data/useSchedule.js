"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

export function useSchedule() {
  const { rows, add, update, remove, loading } = useSupabaseTable("schedule_entries", {
    orderBy: "start_time",
    ascending: true,
    label: "schedule",
  });

  const addEntry = useCallback(
    (date, startTime, endTime, activity) =>
      add({ date, start_time: startTime, end_time: endTime || null, activity }),
    [add]
  );

  /**
   * Copies a day's blocks onto other dates as plain independent rows — not
   * linked back to the source, so editing any one day afterwards never
   * touches another.
   */
  const replicateDay = useCallback(
    async (sourceDate, targetDates) => {
      const sourceEntries = rows.filter((r) => r.date === sourceDate);
      if (!sourceEntries.length || !targetDates.length) return;
      for (const date of targetDates) {
        for (const entry of sourceEntries) {
          await add({ date, start_time: entry.start_time, end_time: entry.end_time, activity: entry.activity });
        }
      }
    },
    [rows, add]
  );

  return { entries: rows, addEntry, updateEntry: update, remove, replicateDay, loading };
}

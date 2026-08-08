"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { hoursBetweenTimes } from "@/lib/dateUtils";

const mapSleep = (r) => ({ ...r, durationHours: r.duration_hours });

export function useSleepLogs() {
  const { rows, add, update, remove, loading } = useSupabaseTable("sleep_logs", {
    orderBy: "date",
    ascending: false,
    map: mapSleep,
    label: "sleep log",
  });

  /** Insert, or overwrite the existing entry for that night. */
  const save = useCallback(
    async (date, startTime, endTime) => {
      const duration = hoursBetweenTimes(startTime, endTime);
      if (!duration) return null;
      const existing = rows.find((l) => l.date === date);
      const patch = {
        start_time: startTime,
        end_time: endTime,
        duration_hours: duration,
      };
      return existing
        ? update(existing.id, patch)
        : add({ date, ...patch });
    },
    [rows, add, update]
  );

  return { logs: rows, save, remove, loading };
}

"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

export function useInterviews() {
  const { rows, add, remove, loading } = useSupabaseTable("interviews", {
    orderBy: "date",
    ascending: false,
    label: "interview",
  });

  const addInterview = useCallback((date, form) => add({ date, ...form }), [add]);

  return { interviews: rows, addInterview, remove, loading };
}

"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

export function useDsa() {
  const { rows, add, remove, loading } = useSupabaseTable("dsa_problems", {
    orderBy: "date",
    ascending: false,
    label: "DSA entry",
  });

  const addProblem = useCallback(
    (date, form) =>
      add({
        date,
        name: form.name,
        source: form.source,
        link: form.link,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        difficulty: form.difficulty,
        notes: form.notes,
      }),
    [add]
  );

  return { problems: rows, addProblem, remove, loading };
}

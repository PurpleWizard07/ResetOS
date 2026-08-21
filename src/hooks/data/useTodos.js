"use client";
import { useCallback } from "react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

export function useTodos() {
  const { rows, add, update, remove, loading } = useSupabaseTable("todos", {
    orderBy: "created_at",
    ascending: false,
    label: "to-do",
  });

  const addTodo = useCallback(
    (text, priority = "normal") => add({ text, priority }),
    [add]
  );

  const toggle = useCallback(
    (id, done) =>
      update(id, {
        done,
        completed_at: done ? new Date().toISOString() : null,
      }),
    [update]
  );

  const updateText = useCallback(
    (id, text) => update(id, { text }),
    [update]
  );

  const setPriority = useCallback(
    (id, priority) => update(id, { priority }),
    [update]
  );

  return { todos: rows, addTodo, toggle, updateText, setPriority, remove, loading };
}

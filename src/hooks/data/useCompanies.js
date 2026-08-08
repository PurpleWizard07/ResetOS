"use client";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

export function useCompanies() {
  const { rows, add, update, remove, loading } = useSupabaseTable("companies", {
    orderBy: "created_at",
    ascending: false,
    label: "company",
  });

  return { companies: rows, add, update, remove, loading };
}

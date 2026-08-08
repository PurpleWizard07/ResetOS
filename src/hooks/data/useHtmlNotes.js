"use client";
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/contexts/ToastContext";

const BUCKET = "html-notes";

export function useHtmlNotes() {
  const { rows, add, remove, loading } = useSupabaseTable("html_notes", {
    orderBy: "created_at",
    ascending: true,
    label: "note",
  });
  const { notifyError } = useToast();

  const upload = useCallback(
    async (section, name, file) => {
      const safeName =
        name.trim().replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "-").toLowerCase() ||
        "note";
      const ext = (file.name.split(".").pop() || "html").toLowerCase();
      const filename = `${safeName}-${Date.now()}.${ext === "htm" ? "html" : ext}`;
      const storagePath = `${section}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { upsert: true, contentType: "text/html" });
      if (uploadError) {
        notifyError("Could not upload note", uploadError);
        return null;
      }

      const row = await add({ section, name: name.trim(), storage_path: storagePath });
      if (!row) {
        // Row insert failed after a successful upload — don't leave an orphan file.
        await supabase.storage.from(BUCKET).remove([storagePath]);
      }
      return row;
    },
    [add, notifyError]
  );

  const deleteNote = useCallback(
    async (note) => {
      const ok = await remove(note.id);
      if (ok && note.storage_path) {
        const { error } = await supabase.storage.from(BUCKET).remove([note.storage_path]);
        if (error) notifyError("Note removed, but its file could not be deleted", error);
      }
      return ok;
    },
    [remove, notifyError]
  );

  const fetchHtml = useCallback(
    async (note) => {
      const { data, error } = await supabase.storage.from(BUCKET).download(note.storage_path);
      if (error) {
        notifyError("Could not open note", error);
        return null;
      }
      return data.text();
    },
    [notifyError]
  );

  return { notes: rows, upload, deleteNote, fetchHtml, loading };
}

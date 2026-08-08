"use client";
import { useState } from "react";
import { Btn, Card, Input, Modal, PH, EmptyState } from "@/ui/primitives";
import { C, MONO } from "@/ui/theme";
import { useConfirm } from "@/contexts/ConfirmContext";

/**
 * Fundamentals and Miscellaneous were previously ~100 lines of identical JSX
 * each, differing only in the section key and placeholder copy. One
 * parameterized component replaces both.
 */
export default function HtmlNotesSection({
  title,
  section,
  namePlaceholder,
  notes,
  upload,
  deleteNote,
  fetchHtml,
  fullscreenInsetLeft = 0,
}) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [openNote, setOpenNote] = useState(null);
  const [html, setHtml] = useState("");
  const confirm = useConfirm();

  const sectionNotes = notes
    .filter((n) => n.section === section)
    .slice()
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));

  const open = async (note) => {
    setOpenNote(note);
    setHtml("Loading…");
    const text = await fetchHtml(note);
    setHtml(text ?? "Failed to load note.");
  };

  const canUpload = name.trim() && file;

  return (
    <div>
      <PH title={title} />

      <Card style={{ marginBottom: "14px" }}>
        <div style={{ color: C.mut, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>
          Add note
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1.4fr)", gap: "10px", alignItems: "stretch" }}>
          <Input value={name} onChange={setName} placeholder={namePlaceholder} />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: `1px dashed ${C.bord}`,
                background: C.high,
                color: C.mut,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <span style={{ whiteSpace: "nowrap" }}>Upload HTML</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: file ? C.text : C.mut }}>
                {file ? file.name : "Choose HTML file"}
              </span>
              <input
                type="file"
                accept=".html,.htm,text/html"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <span style={{ color: C.mut, fontSize: "11px" }}>Your own HTML notes will render inside the app.</span>
          </div>
        </div>
        <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
          <Btn
            onClick={async () => {
              if (!canUpload) return;
              await upload(section, name, file);
              setName("");
              setFile(null);
            }}
            disabled={!canUpload}
          >
            Upload
          </Btn>
          <Btn
            onClick={() => {
              setName("");
              setFile(null);
            }}
            variant="ghost"
          >
            Clear
          </Btn>
        </div>
      </Card>

      <div style={{ display: "grid", gap: "10px" }}>
        {sectionNotes.map((n) => (
          <Card key={n.id} style={{ padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.name}</div>
                <div style={{ color: C.mut, fontSize: "11px", marginTop: "2px", fontFamily: MONO }}>{n.storage_path}</div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <Btn size="sm" variant="ghost" onClick={() => open(n)}>
                  Open
                </Btn>
                <Btn
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    if (await confirm("Delete this note?")) deleteNote(n);
                  }}
                >
                  Delete
                </Btn>
              </div>
            </div>
          </Card>
        ))}
        {sectionNotes.length === 0 && <EmptyState pad="50px">No notes yet. Upload an HTML file above.</EmptyState>}
      </div>

      {openNote && (
        <Modal
          fullscreen
          fullscreenInsetLeft={fullscreenInsetLeft}
          title={openNote.name}
          onClose={() => {
            setOpenNote(null);
            setHtml("");
          }}
        >
          <div style={{ border: `1px solid ${C.bord}`, borderRadius: "10px", overflow: "hidden", background: C.bg, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <iframe
              title={openNote.name}
              sandbox="allow-scripts allow-popups"
              srcDoc={html || ""}
              style={{ width: "100%", flex: 1, minHeight: 0, border: "none", background: "#fff" }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

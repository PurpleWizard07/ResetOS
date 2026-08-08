"use client";
import { useState } from "react";
import { Badge, Btn, Card, IconBtn, Input, Modal, PH, Textarea, Field, Skeleton, Reveal, RevealItem } from "@/ui/primitives";
import { C } from "@/ui/theme";
import { useConfirm } from "@/contexts/ConfirmContext";

const EMPTY_FORM = { topic: "", notes: "", refs: "" };

export default function SystemDesign({ isMobile, topics, save, remove, loading }) {
  const [modal, setModal] = useState(null); // "new" | topic object | null
  const [form, setForm] = useState(EMPTY_FORM);
  const confirm = useConfirm();

  const openNew = () => {
    setModal("new");
    setForm(EMPTY_FORM);
  };
  const openEdit = (t) => {
    setModal(t);
    setForm({ topic: t.topic, notes: t.notes, refs: t.refs.join(", ") });
  };
  const submit = async () => {
    if (!form.topic.trim()) return;
    await save(form, modal === "new" ? null : modal.id);
    setModal(null);
  };

  const showSkeleton = loading && topics.length === 0;

  return (
    <div>
      <PH title="System Design" right={<Btn size="sm" onClick={openNew}>+ Add Topic</Btn>} />
      {showSkeleton ? (
        <Reveal style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: "12px" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <RevealItem key={i}>
              <Card style={{ padding: "0", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", background: C.high, borderBottom: `1px solid ${C.bord}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <Skeleton width="60%" height={14} />
                </div>
                <div style={{ padding: "14px 18px", display: "grid", gap: "8px" }}>
                  <Skeleton width="100%" height={12} />
                  <Skeleton width="80%" height={12} />
                </div>
              </Card>
            </RevealItem>
          ))}
        </Reveal>
      ) : (
        <Reveal style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: "12px" }}>
          {topics.map((s) => (
            <RevealItem key={s.id}>
              <Card style={{ padding: "0", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", background: C.high, borderBottom: `1px solid ${C.bord}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", flex: 1 }}>{s.topic}</div>
                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    <Btn size="sm" variant="ghost" onClick={() => openEdit(s)}>
                      Edit
                    </Btn>
                    <IconBtn
                      label={`Delete ${s.topic}`}
                      danger
                      onClick={async () => {
                        if (await confirm(`Delete "${s.topic}"?`)) remove(s.id);
                      }}
                    >
                      Delete
                    </IconBtn>
                  </div>
                </div>
                <div style={{ padding: "14px 18px" }}>
                  {s.notes ? (
                    <div style={{ color: C.mut, fontSize: "13px", lineHeight: 1.7, marginBottom: s.refs.length ? "10px" : "0" }}>{s.notes}</div>
                  ) : (
                    <div style={{ color: C.mut, fontSize: "12px", fontStyle: "italic" }}>No notes yet.</div>
                  )}
                  {s.refs.length > 0 && (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {s.refs.map((r, ri) => (
                        <Badge key={ri} color="acc">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </RevealItem>
          ))}
          <Card
            dashed
            onClick={openNew}
            label="Add a new system design topic"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minHeight: "120px",
              color: C.mut,
            }}
          >
            <div style={{ fontSize: "24px" }}>+</div>
            <div style={{ fontSize: "13px" }}>New Topic</div>
          </Card>
        </Reveal>
      )}

      {modal && (
        <Modal title={modal === "new" ? "New System Design Topic" : "Edit Topic"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gap: "10px" }}>
            <Input value={form.topic} onChange={(v) => setForm((f) => ({ ...f, topic: v }))} placeholder="Topic (e.g. Design WhatsApp) *" />
            <Textarea value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="Key concepts, architecture decisions, trade-offs..." rows={8} />
            <Field label="References" htmlFor="sd-refs" hint="Comma separated">
              <Input id="sd-refs" value={form.refs} onChange={(v) => setForm((f) => ({ ...f, refs: v }))} placeholder="e.g. Grokking System Design" />
            </Field>
            <div style={{ display: "flex", gap: "8px" }}>
              <Btn onClick={submit} disabled={!form.topic.trim()} full>
                Save
              </Btn>
              <Btn onClick={() => setModal(null)} variant="ghost">
                Cancel
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

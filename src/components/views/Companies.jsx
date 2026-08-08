"use client";
import { useState } from "react";
import { Badge, Btn, Card, IconBtn, Input, Modal, PH, Sel, SLabel, Stat, EmptyState } from "@/ui/primitives";
import { C } from "@/ui/theme";
import { useConfirm } from "@/contexts/ConfirmContext";

const STATUS_OPTS = ["Not Applied", "Applied", "OA", "Interview", "Rejected", "Offer"];
const STATUS_COLOR = { "Not Applied": "mut", Applied: "acc", OA: "war", Interview: "war", Rejected: "dan", Offer: "suc" };
const EMPTY_FORM = { name: "", ctc: "", role: "", status: "Not Applied", note: "" };

function CompanyFormFields({ form, setForm }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "8px" }}>
        <Input value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Company *" />
        <Input value={form.ctc} onChange={(v) => setForm((f) => ({ ...f, ctc: v }))} placeholder="Target CTC" />
        <Input value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v }))} placeholder="Role" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px", marginBottom: "8px" }}>
        <Sel value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={STATUS_OPTS} />
        <Input value={form.note} onChange={(v) => setForm((f) => ({ ...f, note: v }))} placeholder="Note" />
      </div>
    </>
  );
}

export default function Companies({ isMobile, companies, add, update, remove }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const confirm = useConfirm();

  const openEdit = (c) => {
    setEditing(c);
    setEditForm({ name: c.name, ctc: c.ctc, role: c.role, status: c.status, note: c.note });
  };

  return (
    <div>
      <PH title="Companies" right={<Btn onClick={() => setShowForm((f) => !f)}>+ Add Company</Btn>} />
      {showForm && (
        <Card style={{ marginBottom: "16px" }}>
          <SLabel>New company</SLabel>
          <CompanyFormFields form={form} setForm={setForm} />
          <div style={{ display: "flex", gap: "8px" }}>
            <Btn
              onClick={async () => {
                if (!form.name.trim()) return;
                await add(form);
                setForm(EMPTY_FORM);
                setShowForm(false);
              }}
              disabled={!form.name.trim()}
            >
              Save
            </Btn>
            <Btn onClick={() => setShowForm(false)} variant="ghost">
              Cancel
            </Btn>
          </div>
        </Card>
      )}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: "10px", marginBottom: "16px" }}>
        {["Applied", "OA", "Interview", "Offer"].map((s) => (
          <Stat key={s} value={companies.filter((c) => c.status === s).length} label={s} color={s === "Offer" ? C.suc : C.text} size="26px" />
        ))}
      </div>
      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ minWidth: isMobile ? "560px" : undefined }}>
            <div
              style={{
                padding: "12px 14px",
                background: C.high,
                borderBottom: `1px solid ${C.bord}`,
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 2fr 140px",
                gap: "12px",
                alignItems: "center",
              }}
            >
              {["Company", "CTC", "Status", "Note"].map((h) => (
                <div key={h} style={{ color: C.mut, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {h}
                </div>
              ))}
              <div style={{ color: C.mut, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "right" }}>
                Actions
              </div>
            </div>
            <div>
              {companies.map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    padding: "12px 14px",
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 2fr 140px",
                    gap: "12px",
                    alignItems: "center",
                    borderBottom: i < companies.length - 1 ? `1px solid ${C.bord}` : "none",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                    <div style={{ color: C.mut, fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.role}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: C.acc, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.ctc}</div>
                  <Badge color={STATUS_COLOR[c.status]}>{c.status}</Badge>
                  <div style={{ color: C.mut, fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.note || ""}>
                    {c.note}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                    <IconBtn label={`Edit ${c.name}`} onClick={() => openEdit(c)}>
                      Edit
                    </IconBtn>
                    <IconBtn
                      label={`Delete ${c.name}`}
                      danger
                      onClick={async () => {
                        if (await confirm(`Delete ${c.name}?`)) remove(c.id);
                      }}
                    >
                      Delete
                    </IconBtn>
                  </div>
                </div>
              ))}
              {companies.length === 0 && <EmptyState>No companies yet</EmptyState>}
            </div>
          </div>
        </div>
      </Card>

      {editing && (
        <Modal title={`Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <div style={{ display: "grid", gap: "10px" }}>
            <CompanyFormFields form={editForm} setForm={setEditForm} />
            <div style={{ display: "flex", gap: "8px" }}>
              <Btn
                onClick={async () => {
                  await update(editing.id, editForm);
                  setEditing(null);
                }}
                disabled={!editForm.name.trim()}
                full
              >
                Save
              </Btn>
              <Btn onClick={() => setEditing(null)} variant="ghost">
                Cancel
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

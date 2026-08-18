"use client";
import { useState } from "react";
import { Code2, Plus, Star } from "lucide-react";
import { Btn, Field, IconBtn, Input, Skeleton, Textarea } from "@/ui/primitives";
import { C, MONO, RADIUS } from "@/ui/theme";
import { useConfirm } from "@/contexts/ConfirmContext";
import CodeBlock from "./CodeBlock";
import CodeEditor from "./CodeEditor";

const EMPTY_APPROACH_FORM = { label: "", idea: "", code: "", time_complexity: "", space_complexity: "" };

/**
 * A problem's approaches — brute force, better, optimal — as a tab strip over
 * one idea/complexity/code panel. Ordered by `sort_index`, which is the order
 * you added them and therefore the complexity ladder for the usual case.
 *
 * This is the one place in the detail view that keeps an explicit Save. Every
 * other block edits in place, but code wants a deliberate commit rather than a
 * save-on-blur, and the label/complexity fields belong with it.
 */
export default function ApproachPanel({
  problemId,
  approaches,
  loadingDetails,
  onAdd,
  onUpdate,
  onDelete,
  onSetPrimary,
  isNarrow,
}) {
  // `selectedId` is just a preference, not the source of truth: falling back
  // to approaches[0] at render time (rather than syncing it via an effect)
  // means a deleted/not-yet-loaded selection self-heals for free.
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_APPROACH_FORM);
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();

  const active = approaches.find((a) => a.id === selectedId) || approaches[0] || null;
  const activeId = active?.id ?? null;

  const startEdit = (a) => {
    setForm({
      label: a.label || "",
      idea: a.idea || "",
      code: a.code || "",
      time_complexity: a.time_complexity || "",
      space_complexity: a.space_complexity || "",
    });
    setEditingId(a.id);
  };

  const handleAdd = async () => {
    const created = await onAdd(problemId);
    if (created) {
      setSelectedId(created.id);
      startEdit(created);
    }
  };

  const save = async () => {
    if (!form.label.trim()) return;
    setSaving(true);
    const ok = await onUpdate(editingId, form);
    setSaving(false);
    if (ok) setEditingId(null);
  };

  const handleDelete = async (a) => {
    if (await confirm(`Delete the "${a.label}" approach?`)) {
      await onDelete(a.id);
      if (editingId === a.id) setEditingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
        <Code2 size={13} style={{ color: C.mut }} />
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: C.mut,
          }}
        >
          Approaches
        </span>
        {approaches.length > 0 && (
          <Btn size="sm" variant="ghost" onClick={handleAdd} icon={<Plus size={12} />}>
            Add
          </Btn>
        )}
      </div>

      {approaches.length === 0 ? (
        <div
          style={{
            border: `1px dashed ${C.bord}`,
            borderRadius: RADIUS.md,
            padding: "20px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "180px", fontSize: "12.5px", color: C.mut, lineHeight: 1.6 }}>
            Write the brute force first, then add the optimal one beside it. Seeing both is what makes the
            improvement stick.
          </div>
          <Btn size="sm" variant="ghost" onClick={handleAdd} icon={<Plus size={12} />}>
            Add approach
          </Btn>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
            {approaches.map((a) => (
              <ApproachTab
                key={a.id}
                approach={a}
                active={a.id === activeId}
                onClick={() => setSelectedId(a.id)}
              />
            ))}
          </div>

          {active &&
            (editingId === active.id ? (
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "12px" }}>
                <Field label="Name">
                  <Input
                    value={form.label}
                    onChange={(v) => setForm((f) => ({ ...f, label: v }))}
                    placeholder="Brute force, Optimal, ..."
                  />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr", gap: "10px" }}>
                  <Field label="Time">
                    <Input
                      value={form.time_complexity}
                      onChange={(v) => setForm((f) => ({ ...f, time_complexity: v }))}
                      placeholder="O(n log n)"
                    />
                  </Field>
                  <Field label="Space">
                    <Input
                      value={form.space_complexity}
                      onChange={(v) => setForm((f) => ({ ...f, space_complexity: v }))}
                      placeholder="O(n)"
                    />
                  </Field>
                </div>
                <Field label="Intuition" hint="In one or two sentences — why does this work?">
                  <Textarea value={form.idea} onChange={(v) => setForm((f) => ({ ...f, idea: v }))} rows={3} />
                </Field>
                <Field label="Code">
                  <CodeEditor
                    value={form.code}
                    onChange={(v) => setForm((f) => ({ ...f, code: v }))}
                    rows={14}
                    placeholder="// your solution"
                  />
                </Field>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Btn onClick={save} disabled={!form.label.trim()} loading={saving} size="sm">
                    Save approach
                  </Btn>
                  <Btn onClick={() => setEditingId(null)} variant="ghost" disabled={saving} size="sm">
                    Cancel
                  </Btn>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px", alignItems: "baseline", flexWrap: "wrap", fontFamily: MONO, fontSize: "12.5px" }}>
                    <Complexity label="Time" value={active.time_complexity} tone={C.acc} />
                    <Complexity label="Space" value={active.space_complexity} tone={C.mut} />
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <IconBtn
                      label={active.is_primary ? "This is your go-to approach" : "Make this your go-to approach"}
                      onClick={() => onSetPrimary(problemId, active.id)}
                    >
                      <Star size={12} fill={active.is_primary ? "currentColor" : "none"} />
                    </IconBtn>
                    <IconBtn label="Edit approach" onClick={() => startEdit(active)}>
                      Edit
                    </IconBtn>
                    <IconBtn label={`Delete ${active.label}`} danger onClick={() => handleDelete(active)}>
                      Delete
                    </IconBtn>
                  </div>
                </div>
                {loadingDetails ? (
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "8px" }}>
                    <Skeleton height={13} width="70%" />
                    <Skeleton height={120} />
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        color: C.mut,
                        fontSize: "13px",
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                        opacity: active.idea ? 1 : 0.6,
                      }}
                    >
                      {active.idea || "No intuition written yet — press Edit to add it."}
                    </div>
                    {active.code ? (
                      <CodeBlock code={active.code} />
                    ) : (
                      <div style={{ color: C.mut, fontSize: "12px", opacity: 0.6 }}>No code saved yet.</div>
                    )}
                  </>
                )}
              </div>
            ))}
        </>
      )}
    </div>
  );
}

/**
 * One tab. Carries its own complexity so the strip reads as a ladder
 * ("Brute force O(n²) → Optimal O(n)") without opening each one.
 */
function ApproachTab({ approach, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        background: active ? C.high : "transparent",
        border: `1px solid ${active ? C.bordStrong : C.bord}`,
        borderRadius: RADIUS.md,
        padding: "7px 12px",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "12px",
        fontWeight: 600,
        color: active ? C.text : C.mut,
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
      }}
    >
      {approach.is_primary && <Star size={10} fill="currentColor" style={{ color: C.acc, flexShrink: 0 }} />}
      {approach.label}
      {approach.time_complexity && (
        <span style={{ fontFamily: MONO, fontSize: "11px", opacity: 0.65, fontWeight: 500 }}>
          {approach.time_complexity}
        </span>
      )}
    </button>
  );
}

function Complexity({ label, value, tone }) {
  return (
    <span style={{ display: "inline-flex", gap: "6px", alignItems: "baseline" }}>
      <span style={{ color: C.mut, fontSize: "11px", fontFamily: "inherit" }}>{label}</span>
      <span style={{ color: value ? tone : C.mut, opacity: value ? 1 : 0.5 }}>{value || "—"}</span>
    </span>
  );
}

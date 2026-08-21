"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, ListTodo, Plus } from "lucide-react";
import { Badge, Btn, Card, EmptyState, IconBtn, Input, PH, Skeleton } from "@/ui/primitives";
import { C, RADIUS, SPRING } from "@/ui/theme";
import { useConfirm } from "@/contexts/ConfirmContext";

// Three levels, but 'normal' is the default so capture asks nothing of you.
// High is the signature gold ("the one thing to notice"); low is a quiet blue
// that reads as "someday", not "urgent". Clicking a row's pill cycles through
// them, so re-ranking is one tap with no menu.
const PRIORITY = {
  high: { label: "High", color: C.acc, bg: C.accBg, weight: 0 },
  normal: { label: "Normal", color: C.mut, bg: "transparent", weight: 1 },
  low: { label: "Low", color: C.blue, bg: C.blueBg, weight: 2 },
};
const NEXT_PRIORITY = { normal: "high", high: "low", low: "normal" };
const prio = (p) => PRIORITY[p] || PRIORITY.normal;

function Checkbox({ done, onClick, label }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={done}
      whileHover={{ borderColor: done ? C.suc : C.bordStrong, backgroundColor: done ? C.suc : C.high }}
      whileTap={{ scale: 0.85 }}
      transition={SPRING}
      style={{
        width: "22px",
        height: "22px",
        flexShrink: 0,
        borderRadius: "50%",
        border: `2px solid ${done ? C.suc : C.bordStrong}`,
        background: done ? C.suc : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <AnimatePresence initial={false}>
        {done && (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={SPRING}
            style={{ display: "inline-flex" }}
          >
            <Check size={13} color={C.onAccent} strokeWidth={3} aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function PriorityPill({ priority, onClick }) {
  const p = prio(priority);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={`Priority: ${p.label} — click to change`}
      aria-label={`Priority ${p.label}, click to change`}
      whileHover={{ borderColor: C.bordStrong }}
      whileTap={{ scale: 0.94 }}
      transition={SPRING}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        flexShrink: 0,
        background: p.bg,
        border: `1px solid ${priority === "normal" ? C.bord : p.color + "55"}`,
        borderRadius: RADIUS.pill,
        padding: "3px 10px",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: p.color, flexShrink: 0 }} />
      <span style={{ fontSize: "10.5px", fontWeight: 700, color: priority === "normal" ? C.mut : p.color }}>
        {p.label}
      </span>
    </motion.button>
  );
}

export default function Todo({ isMobile, todos, loading, addTodo, toggle, updateText, setPriority, remove }) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDone, setShowDone] = useState(false);
  const confirm = useConfirm();

  const open = useMemo(
    () =>
      todos
        .filter((t) => !t.done)
        .sort((a, b) => {
          const w = prio(a.priority).weight - prio(b.priority).weight;
          if (w) return w;
          return (b.created_at || "").localeCompare(a.created_at || "");
        }),
    [todos]
  );
  const done = useMemo(
    () =>
      todos
        .filter((t) => t.done)
        .sort((a, b) => (b.completed_at || "").localeCompare(a.completed_at || "")),
    [todos]
  );

  const showSkeleton = loading && todos.length === 0;

  const submit = async () => {
    const v = draft.trim();
    if (!v) return;
    setDraft("");
    await addTodo(v);
  };

  const beginEdit = (t) => {
    setEditingId(t.id);
    setEditText(t.text);
  };
  const commitEdit = async (t) => {
    const v = editText.trim();
    setEditingId(null);
    if (v && v !== t.text) await updateText(t.id, v);
  };

  const onDelete = async (t) => {
    if (await confirm("Delete this item?")) remove(t.id);
  };
  const clearCompleted = async () => {
    if (await confirm(`Clear all ${done.length} completed item${done.length === 1 ? "" : "s"}?`)) {
      for (const t of done) await remove(t.id);
    }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <PH
        title="To-Do"
        right={open.length > 0 ? <Badge color="acc">{open.length} open</Badge> : <Badge color="suc">All clear</Badge>}
      />

      {/* Capture: type, press Enter, done. No priority decision required. */}
      <Card style={{ marginBottom: "18px", padding: "14px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <Input
            value={draft}
            onChange={setDraft}
            placeholder="Add a thought — anything on your mind…"
            ariaLabel="New to-do"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
          />
          <Btn onClick={submit} disabled={!draft.trim()} icon={<Plus size={15} aria-hidden="true" />}>
            {isMobile ? "" : "Add"}
          </Btn>
        </div>
      </Card>

      {/* Open items */}
      {showSkeleton ? (
        <Card>
          <div style={{ display: "grid", gap: "14px" }}>
            {[80, 65, 72].map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Skeleton width="22px" height={22} radius={RADIUS.pill} />
                <Skeleton width={`${w}%`} height={14} />
              </div>
            ))}
          </div>
        </Card>
      ) : open.length === 0 && done.length === 0 ? (
        <Card>
          <EmptyState icon={<ListTodo size={22} aria-hidden="true" />}>
            Nothing here yet. Drop whatever you&apos;re carrying around — a task, an errand, a
            loose end — so it stops taking up space in your head.
          </EmptyState>
        </Card>
      ) : (
        open.length > 0 && (
          <Card style={{ padding: "8px" }}>
            <motion.div layout style={{ display: "grid" }}>
              <AnimatePresence initial={false}>
                {open.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0, marginTop: 0 }}
                    transition={SPRING}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 8px" }}
                  >
                    <Checkbox done={false} onClick={() => toggle(t.id, true)} label={`Mark "${t.text}" done`} />
                    {editingId === t.id ? (
                      <Input
                        value={editText}
                        onChange={setEditText}
                        autoFocus
                        ariaLabel="Edit item"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitEdit(t);
                          } else if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        style={{ flex: 1 }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => beginEdit(t)}
                        title="Click to edit"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          padding: 0,
                          margin: 0,
                          color: C.text,
                          fontFamily: "inherit",
                          fontSize: "14px",
                          lineHeight: 1.5,
                          cursor: "text",
                        }}
                      >
                        {t.text}
                      </button>
                    )}
                    <PriorityPill
                      priority={t.priority}
                      onClick={() => setPriority(t.id, NEXT_PRIORITY[t.priority] || "high")}
                    />
                    <IconBtn label={`Delete "${t.text}"`} danger bordered={false} onClick={() => onDelete(t)}>
                      ✕
                    </IconBtn>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </Card>
        )
      )}

      {/* Completed — collapsed by default so the done pile never becomes a
          second thing to scan. */}
      {done.length > 0 && (
        <div style={{ marginTop: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <motion.button
              type="button"
              onClick={() => setShowDone((s) => !s)}
              whileTap={{ scale: 0.98 }}
              aria-expanded={showDone}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: C.mut,
                fontFamily: "inherit",
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              <motion.span animate={{ rotate: showDone ? 0 : -90 }} transition={SPRING} style={{ display: "inline-flex" }}>
                <ChevronDown size={13} aria-hidden="true" />
              </motion.span>
              Completed ({done.length})
            </motion.button>
            <Btn variant="ghost" size="sm" onClick={clearCompleted}>
              Clear
            </Btn>
          </div>
          <AnimatePresence initial={false}>
            {showDone && (
              <motion.div
                key="done-list"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={SPRING}
                style={{ overflow: "hidden" }}
              >
                <Card style={{ padding: "8px" }}>
                  <div style={{ display: "grid" }}>
                    {done.map((t) => (
                      <div
                        key={t.id}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 8px" }}
                      >
                        <Checkbox done onClick={() => toggle(t.id, false)} label={`Mark "${t.text}" not done`} />
                        <span
                          style={{
                            flex: 1,
                            minWidth: 0,
                            color: C.mut,
                            fontSize: "14px",
                            lineHeight: 1.5,
                            textDecoration: "line-through",
                          }}
                        >
                          {t.text}
                        </span>
                        <IconBtn label={`Delete "${t.text}"`} danger bordered={false} onClick={() => onDelete(t)}>
                          ✕
                        </IconBtn>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

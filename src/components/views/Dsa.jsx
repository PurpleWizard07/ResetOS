"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Badge, Btn, Card, IconBtn, Input, PH, Reveal, RevealItem, Sel, SLabel, Textarea, EmptyState, Skeleton } from "@/ui/primitives";
import { C, MONO, RADIUS, SHADOW, SPRING, SPRING_SOFT } from "@/ui/theme";
import { fmt, toDay } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

const DIFF_COLOR = { Easy: "suc", Medium: "war", Hard: "dan" };
const SOURCES = ["LeetCode", "GeeksForGeeks", "CodeForces", "HackerRank", "InterviewBit", "Other"];
const EMPTY_FORM = { name: "", source: "LeetCode", link: "", tags: "", difficulty: "Medium", notes: "" };

export default function Dsa({ isMobile, streak, todayCount, problems, addProblem, remove, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState({ source: "All", difficulty: "All", tag: "" });
  const [expanded, setExpanded] = useState(null);
  const confirm = useConfirm();
  const showSkeleton = loading && problems.length === 0;

  const sources = ["All", ...new Set(problems.map((p) => p.source))];
  const filtered = problems
    .filter((p) => {
      if (filter.source !== "All" && p.source !== filter.source) return false;
      if (filter.difficulty !== "All" && p.difficulty !== filter.difficulty) return false;
      if (filter.tag && !p.tags.some((t) => t.toLowerCase().includes(filter.tag.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PH
        title="DSA"
        right={
          <>
            <Badge color="acc">{streak}d streak</Badge>
            <Badge color="suc">{problems.length} solved</Badge>
            <Badge color="mut">today: {todayCount}</Badge>
          </>
        }
      />
      {showSkeleton ? (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
          <Card>
            <Skeleton width="90px" height={10} style={{ marginBottom: "14px" }} />
            <div style={{ display: "grid", gap: "8px" }}>
              <Skeleton height={40} />
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px" }}>
                <Skeleton height={40} />
                <Skeleton height={40} />
              </div>
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={88} />
              <Skeleton height={40} radius={RADIUS.md} />
            </div>
          </Card>
          <div>
            <Card style={{ marginBottom: "10px", padding: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "8px" }}>
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
              </div>
            </Card>
            <div style={{ display: "grid", gap: "6px" }}>
              {[0, 1, 2, 3].map((i) => (
                <Card key={i} style={{ padding: "13px" }}>
                  <Skeleton height={13} width="55%" style={{ marginBottom: "8px" }} />
                  <Skeleton height={11} width="35%" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
          <div>
            <Card>
              <SLabel>Log problem</SLabel>
              <div style={{ display: "grid", gap: "8px" }}>
                <Input value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Problem name *" />
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px" }}>
                  <Sel value={form.source} onChange={(v) => setForm((f) => ({ ...f, source: v }))} options={SOURCES} />
                  <Sel value={form.difficulty} onChange={(v) => setForm((f) => ({ ...f, difficulty: v }))} options={["Easy", "Medium", "Hard"]} />
                </div>
                <Input value={form.link} onChange={(v) => setForm((f) => ({ ...f, link: v }))} placeholder="Problem link (optional)" />
                <Input value={form.tags} onChange={(v) => setForm((f) => ({ ...f, tags: v }))} placeholder="Tags: Array, DP, Graph ..." />
                <Textarea value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="Approach, complexity, key insight..." rows={4} />
                <Btn
                  onClick={async () => {
                    if (!form.name.trim()) return;
                    await addProblem(toDay(), form);
                    setForm(EMPTY_FORM);
                  }}
                  disabled={!form.name.trim()}
                  full
                >
                  Add Problem
                </Btn>
              </div>
            </Card>
          </div>
          <div>
            <Card style={{ marginBottom: "10px", padding: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "8px" }}>
                <Sel value={filter.source} onChange={(v) => setFilter((f) => ({ ...f, source: v }))} options={sources} />
                <Sel value={filter.difficulty} onChange={(v) => setFilter((f) => ({ ...f, difficulty: v }))} options={["All", "Easy", "Medium", "Hard"]} />
                <Input value={filter.tag} onChange={(v) => setFilter((f) => ({ ...f, tag: v }))} placeholder="Filter by tag" />
              </div>
            </Card>
            <Reveal style={{ display: "grid", gap: "6px", maxHeight: "560px", overflowY: "auto" }}>
              {filtered.map((p) => (
                <RevealItem key={p.id}>
                  <ProblemCard
                    p={p}
                    expanded={expanded === p.id}
                    onToggle={() => setExpanded((cur) => (cur === p.id ? null : p.id))}
                    onDelete={async () => {
                      if (await confirm("Delete this DSA entry?")) {
                        await remove(p.id);
                        setExpanded((cur) => (cur === p.id ? null : cur));
                      }
                    }}
                  />
                </RevealItem>
              ))}
              {filtered.length === 0 && <EmptyState>No problems match filters</EmptyState>}
            </Reveal>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The card itself carries `layout` so the whole stack reflows smoothly (not
 * just a jump) when one card's expanded content grows/shrinks — a real
 * shared-element-style transition rather than content just appearing.
 */
function ProblemCard({ p, expanded, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-label={`${p.name}, ${p.difficulty}${expanded ? ", expanded" : ""}`}
      whileHover={{ y: -2, borderColor: C.bordStrong }}
      whileTap={{ scale: 0.995 }}
      transition={SPRING_SOFT}
      style={{
        background: C.surf,
        border: `1px solid ${expanded ? C.accBord : C.bord}`,
        borderRadius: RADIUS.lg,
        padding: "13px",
        boxShadow: `${SHADOW.inset}, ${SHADOW.sm}`,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <span style={{ fontWeight: 700, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: C.acc, fontSize: "11px", flexShrink: 0 }}
              >
                ↗
              </a>
            )}
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {p.tags.map((t) => (
              <Badge key={t} color="mut">
                {t}
              </Badge>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
          <Badge color={DIFF_COLOR[p.difficulty]}>{p.difficulty}</Badge>
          <motion.span
            aria-hidden="true"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={SPRING}
            style={{ color: C.mut, display: "inline-flex" }}
          >
            <ChevronDown size={14} />
          </motion.span>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRING_SOFT}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${C.bord}` }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                <Badge color="mut">{p.source}</Badge>
                <Badge color="mut">{fmt(p.date)}</Badge>
              </div>
              {p.notes ? (
                <div
                  style={{
                    background: C.bg,
                    borderRadius: RADIUS.md,
                    padding: "12px",
                    color: C.mut,
                    fontSize: "13px",
                    lineHeight: 1.75,
                    whiteSpace: "pre-wrap",
                    fontFamily: MONO,
                  }}
                >
                  {p.notes}
                </div>
              ) : (
                <div style={{ color: C.mut, fontSize: "12px" }}>No notes added.</div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                <IconBtn
                  label={`Delete ${p.name}`}
                  danger
                  bordered={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  Delete
                </IconBtn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

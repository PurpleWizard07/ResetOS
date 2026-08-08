"use client";
import { useState } from "react";
import { Badge, Btn, Card, IconBtn, Input, PH, Sel, SLabel, Textarea, EmptyState } from "@/ui/primitives";
import { C, MONO } from "@/ui/theme";
import { fmt, toDay } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

const DIFF_COLOR = { Easy: "suc", Medium: "war", Hard: "dan" };
const SOURCES = ["LeetCode", "GeeksForGeeks", "CodeForces", "HackerRank", "InterviewBit", "Other"];
const EMPTY_FORM = { name: "", source: "LeetCode", link: "", tags: "", difficulty: "Medium", notes: "" };

export default function Dsa({ isMobile, streak, todayCount, problems, addProblem, remove }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState({ source: "All", difficulty: "All", tag: "" });
  const [expanded, setExpanded] = useState(null);
  const confirm = useConfirm();

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
          <div style={{ display: "grid", gap: "6px", maxHeight: "520px", overflowY: "auto" }}>
            {filtered.map((p) => {
              const exp = expanded === p.id;
              return (
                <Card
                  key={p.id}
                  onClick={() => setExpanded(exp ? null : p.id)}
                  label={`${p.name}, ${p.difficulty}${exp ? ", expanded" : ""}`}
                  style={{ padding: "12px", borderColor: exp ? C.accBord : C.bord }}
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
                    <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                      <Badge color={DIFF_COLOR[p.difficulty]}>{p.difficulty}</Badge>
                      <span aria-hidden="true" style={{ color: C.mut, fontSize: "11px", marginLeft: "4px" }}>
                        {exp ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>
                  {exp && (
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${C.bord}` }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                        <Badge color="mut">{p.source}</Badge>
                        <Badge color="mut">{fmt(p.date)}</Badge>
                      </div>
                      {p.notes ? (
                        <div style={{ background: C.bg, borderRadius: "8px", padding: "12px", color: C.mut, fontSize: "13px", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: MONO }}>
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
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (await confirm("Delete this DSA entry?")) {
                              await remove(p.id);
                              setExpanded((cur) => (cur === p.id ? null : cur));
                            }
                          }}
                        >
                          Delete
                        </IconBtn>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
            {filtered.length === 0 && <EmptyState>No problems match filters</EmptyState>}
          </div>
        </div>
      </div>
    </div>
  );
}

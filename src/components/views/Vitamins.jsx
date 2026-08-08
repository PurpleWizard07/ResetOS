"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Btn, Card, Chip, DayToggle, IconBtn, Input, PH, SLabel, Skeleton, WeekNav } from "@/ui/primitives";
import { C, SPRING_SOFT } from "@/ui/theme";
import { fmt, getDayName, shiftDate, toDay } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

const LIST_VARIANTS = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } } };
const ITEM_VARIANTS = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: SPRING_SOFT } };

const DAY_CODES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEK_CODES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function parseFrequencyDays(freq) {
  const f = (freq || "").toLowerCase().trim();
  if (!f) return new Set();
  if (f.includes("daily")) return new Set(WEEK_CODES);
  if (f.includes("weekday")) return new Set(["mon", "tue", "wed", "thu", "fri"]);
  if (f.includes("weekend")) return new Set(["sat", "sun"]);
  const set = new Set();
  f.split(/[, ]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((t) => {
      const match = WEEK_CODES.find((c) => c.startsWith(t.slice(0, 3)));
      if (match) set.add(match);
    });
  return set;
}

function matchesFrequency(freq, dateStr) {
  const selected = parseFrequencyDays(freq);
  if (!selected.size) return true; // no frequency configured -> track every day
  const day = WEEK_CODES[new Date(dateStr + "T00:00").getDay()];
  return selected.has(day);
}

const EMPTY_FORM = { name: "", dose: "", frequency: "daily", color: C.acc };

export default function Vitamins({ isMobile, vitamins, vitaminLogs, save, remove, toggleLog, loading }) {
  const [weekAnchor, setWeekAnchor] = useState(toDay);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const confirm = useConfirm();

  const last7 = Array.from({ length: 7 }, (_, i) => shiftDate(weekAnchor, i - 6));
  const isTaken = (vitId, date) => vitaminLogs.some((l) => l.vitamin_id === vitId && l.date === date);
  const todayStr = last7[6];
  const showSkeleton = loading && vitamins.length === 0;

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm((f) => !f);
  };
  const openEdit = (v) => {
    setEditing(v);
    setForm({ name: v.name, dose: v.dose, frequency: v.frequency, color: v.color });
    setShowForm(true);
  };
  const selected = parseFrequencyDays(form.frequency);
  const toggleDay = (code) => {
    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    const ordered = DAY_CODES.filter((c) => next.has(c));
    setForm((f) => ({ ...f, frequency: ordered.length === 7 ? "daily" : ordered.join(",") }));
  };
  const setPreset = (type) => {
    const value = { clear: "", daily: "daily", weekdays: "mon,tue,wed,thu,fri", weekends: "sat,sun" }[type];
    setForm((f) => ({ ...f, frequency: value }));
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    await save(form, editing?.id);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div>
      <PH title="Vitamins" right={<Btn size="sm" onClick={openNew}>+ Add Vitamin</Btn>} />

      {showSkeleton ? (
        <div className="anim-fade-in" style={{ marginBottom: "16px" }}>
          <Card>
            <Skeleton width="70px" height={10} style={{ marginBottom: "14px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <Skeleton width="160px" height={12} />
              <Skeleton width="120px" height={22} radius={8} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Skeleton width="180px" height={30} />
                  {Array.from({ length: 7 }).map((_, j) => (
                    <Skeleton key={j} width={28} height={28} radius={7} />
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_SOFT}
              style={{ marginBottom: "16px" }}
            >
              <Card>
                <SLabel>{editing ? "Edit vitamin" : "New vitamin"}</SLabel>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: "8px", marginBottom: "8px" }}>
                  <Input value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Vitamin name *" />
                  <Input value={form.dose} onChange={(v) => setForm((f) => ({ ...f, dose: v }))} placeholder="Dose" />
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ color: C.mut, fontSize: "11px", marginBottom: "4px" }}>Frequency — pick days you expect to take</div>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                    {DAY_CODES.map((code, idx) => (
                      <Chip key={code} active={selected.has(code)} onClick={() => toggleDay(code)}>
                        {DAY_LABELS[idx]}
                      </Chip>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {["daily", "weekdays", "weekends", "clear"].map((p) => (
                      <Chip key={p} onClick={() => setPreset(p)}>
                        {p[0].toUpperCase() + p.slice(1)}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Btn onClick={submit} disabled={!form.name.trim()}>
                    {editing ? "Update" : "Save"}
                  </Btn>
                  <Btn
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Btn>
                </div>
              </Card>
            </motion.div>
          )}

          <div className="anim-fade-in" style={{ marginBottom: "16px" }}>
            <Card style={{ overflowX: "auto" }}>
              <SLabel>This week</SLabel>
              <WeekNav
                label={`Week ${fmt(last7[0])} – ${fmt(last7[6])}`}
                onPrev={() => setWeekAnchor(shiftDate(weekAnchor, -7))}
                onNext={() => setWeekAnchor(shiftDate(weekAnchor, 7))}
              />
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                  <thead>
                    <tr>
                      <th style={{ color: C.mut, fontSize: "11px", textAlign: "left", padding: "4px 8px", fontWeight: 600, width: "180px" }}>
                        Supplement
                      </th>
                      {last7.map((d) => {
                        const dt = new Date(d + "T00:00");
                        return (
                          <th key={d} style={{ color: d === todayStr ? C.text : C.mut, fontSize: "10px", textAlign: "center", padding: "4px 6px", fontWeight: d === todayStr ? 700 : 500 }}>
                            <div>{getDayName(dt.getDay())}</div>
                            <div style={{ fontWeight: 400, marginTop: "1px" }}>{dt.getDate()}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <motion.tbody variants={LIST_VARIANTS} initial="hidden" animate="show">
                    {vitamins.map((v) => (
                      <motion.tr key={v.id} variants={ITEM_VARIANTS} style={{ borderTop: `1px solid ${C.bord}` }}>
                        <td style={{ padding: "10px 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "13px" }}>{v.name}</div>
                              <div style={{ fontSize: "10px", color: C.mut }}>
                                {v.dose}
                                {v.frequency ? ` · ${v.frequency}` : ""}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <IconBtn label={`Edit ${v.name}`} onClick={() => openEdit(v)}>
                                Edit
                              </IconBtn>
                              <IconBtn
                                label={`Delete ${v.name}`}
                                danger
                                onClick={async () => {
                                  if (await confirm(`Delete ${v.name} and its logs?`)) remove(v);
                                }}
                              >
                                Delete
                              </IconBtn>
                            </div>
                          </div>
                        </td>
                        {last7.map((d) => {
                          const taken = isTaken(v.id, d);
                          const expected = matchesFrequency(v.frequency, d);
                          const baseBorder = expected ? `1px solid ${C.bord}` : `1px dashed ${C.bord}`;
                          return (
                            <td key={d} style={{ textAlign: "center", padding: "10px 6px", opacity: taken ? 1 : expected ? 1 : 0.35, borderLeft: baseBorder, borderRight: baseBorder }}>
                              <DayToggle
                                active={taken}
                                dim={!expected}
                                onClick={() => toggleLog(v.id, d)}
                                label={`${v.name} on ${fmt(d)}${taken ? ", taken" : ""}`}
                              />
                            </td>
                          );
                        })}
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

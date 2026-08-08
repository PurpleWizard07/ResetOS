"use client";
import { useState } from "react";
import { Btn, Card, IconBtn, Input, PH, SLabel } from "@/ui/primitives";
import { C } from "@/ui/theme";
import { fmt, getDayName, shiftDate, toDay } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

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

export default function Vitamins({ vitamins, vitaminLogs, save, remove, toggleLog }) {
  const [weekAnchor, setWeekAnchor] = useState(toDay);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const confirm = useConfirm();

  const last7 = Array.from({ length: 7 }, (_, i) => shiftDate(weekAnchor, i - 6));
  const isTaken = (vitId, date) => vitaminLogs.some((l) => l.vitamin_id === vitId && l.date === date);
  const todayStr = last7[6];

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

      {showForm && (
        <Card style={{ marginBottom: "16px" }}>
          <SLabel>{editing ? "Edit vitamin" : "New vitamin"}</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "8px", marginBottom: "8px" }}>
            <Input value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Vitamin name *" />
            <Input value={form.dose} onChange={(v) => setForm((f) => ({ ...f, dose: v }))} placeholder="Dose" />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <div style={{ color: C.mut, fontSize: "11px", marginBottom: "4px" }}>Frequency — pick days you expect to take</div>
            <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
              {DAY_CODES.map((code, idx) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleDay(code)}
                  aria-pressed={selected.has(code)}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    borderRadius: "6px",
                    border: `1px solid ${selected.has(code) ? C.acc : C.bord}`,
                    background: selected.has(code) ? C.accBg : C.high,
                    color: selected.has(code) ? C.acc : C.mut,
                    fontSize: "11px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {DAY_LABELS[idx]}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["daily", "weekdays", "weekends", "clear"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreset(p)}
                  style={{ border: "none", background: "transparent", color: C.mut, fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {p[0].toUpperCase() + p.slice(1)}
                </button>
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
      )}

      <Card style={{ marginBottom: "16px", overflowX: "auto" }}>
        <SLabel>This week</SLabel>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", color: C.mut, fontSize: "11px" }}>
          <span>
            Week {fmt(last7[0])} – {fmt(last7[6])}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={() => setWeekAnchor(shiftDate(weekAnchor, -7))}
              style={{ background: "transparent", border: `1px solid ${C.bord}`, borderRadius: "6px", color: C.mut, fontSize: "11px", padding: "3px 8px", cursor: "pointer" }}
            >
              ‹ Prev
            </button>
            <button
              type="button"
              onClick={() => setWeekAnchor(shiftDate(weekAnchor, 7))}
              style={{ background: "transparent", border: `1px solid ${C.bord}`, borderRadius: "6px", color: C.mut, fontSize: "11px", padding: "3px 8px", cursor: "pointer" }}
            >
              Next ›
            </button>
          </div>
        </div>
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
            <tbody>
              {vitamins.map((v) => (
                <tr key={v.id} style={{ borderTop: `1px solid ${C.bord}` }}>
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
                        <button
                          type="button"
                          onClick={() => toggleLog(v.id, d)}
                          aria-pressed={taken}
                          aria-label={`${v.name} on ${fmt(d)}${taken ? ", taken" : ""}`}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "7px",
                            border: taken ? `1px solid ${C.accBord}` : baseBorder,
                            background: taken ? C.accBg : "transparent",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: "14px",
                            color: taken ? C.acc : C.mut,
                          }}
                        >
                          {taken ? "✓" : "·"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

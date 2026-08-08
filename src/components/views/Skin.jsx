"use client";
import { useMemo, useState } from "react";
import { Badge, Btn, Card, Cal, IconBtn, Input, PH, SLabel, EmptyState } from "@/ui/primitives";
import { C } from "@/ui/theme";
import { fmt, getDayName, shiftDate, toDay } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

const ROUTINES = ["morning", "night"];

export default function Skin({ isMobile, todayStr, items, logs, addItem, removeItem, toggleLog }) {
  const [weekAnchor, setWeekAnchor] = useState(toDay);
  const [calDate, setCalDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [names, setNames] = useState({ morning: "", night: "" });
  const confirm = useConfirm();

  const week7 = Array.from({ length: 7 }, (_, i) => shiftDate(weekAnchor, i - 6));
  const isDone = (itemId, dateStr) => logs.some((l) => l.item_id === itemId && l.date === dateStr);
  const itemsBy = (routine) => items.filter((i) => i.routine === routine);
  const activeDates = useMemo(() => [...new Set(logs.map((l) => l.date))], [logs]);

  return (
    <div>
      <PH title="Skin" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
        <div style={{ display: "grid", gap: "12px" }}>
          {ROUTINES.map((r) => (
            <Card key={r} style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <SLabel>{r === "morning" ? "Morning routine" : "Night routine"}</SLabel>
                <Badge color="mut">{itemsBy(r).length}</Badge>
              </div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <Input
                  value={names[r]}
                  onChange={(v) => setNames((n) => ({ ...n, [r]: v }))}
                  placeholder={r === "morning" ? "Add item (e.g. sunscreen)" : "Add item (e.g. retinol)"}
                />
                <Btn
                  onClick={async () => {
                    if (!names[r].trim()) return;
                    await addItem(r, names[r].trim());
                    setNames((n) => ({ ...n, [r]: "" }));
                  }}
                  disabled={!names[r].trim()}
                >
                  Add
                </Btn>
              </div>

              {itemsBy(r).length === 0 ? (
                <EmptyState pad="0">No items yet.</EmptyState>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", color: C.mut, fontSize: "11px" }}>
                    <span>
                      Week {fmt(week7[0])} – {fmt(week7[6])}
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

                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
                    <thead>
                      <tr>
                        <th style={{ color: C.mut, fontSize: "11px", textAlign: "left", padding: "4px 8px", fontWeight: 600, width: "180px" }}>Item</th>
                        {week7.map((d) => {
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
                      {itemsBy(r).map((item) => (
                        <tr key={item.id} style={{ borderTop: `1px solid ${C.bord}` }}>
                          <td style={{ padding: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontWeight: 600, fontSize: "13px" }}>{item.name}</span>
                              <IconBtn
                                label={`Delete ${item.name}`}
                                danger
                                bordered={false}
                                onClick={async () => {
                                  if (await confirm("Delete this routine item?")) removeItem(item);
                                }}
                              >
                                ✕
                              </IconBtn>
                            </div>
                          </td>
                          {week7.map((d) => {
                            const done = isDone(item.id, d);
                            return (
                              <td key={d} style={{ textAlign: "center", padding: "8px 6px" }}>
                                <button
                                  type="button"
                                  onClick={() => toggleLog(item.id, d)}
                                  aria-pressed={done}
                                  aria-label={`${item.name} on ${fmt(d)}${done ? ", done" : ""}`}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "7px",
                                    border: done ? `1px solid ${C.accBord}` : `1px solid ${C.bord}`,
                                    background: done ? C.acc : "transparent",
                                    color: done ? "#fff" : C.mut,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    fontSize: "14px",
                                    fontWeight: 800,
                                  }}
                                >
                                  {done ? "✓" : "·"}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          ))}
        </div>
        <div>
          <Cal activeDates={activeDates} selectedDate={selectedDate} onSelect={setSelectedDate} calDate={calDate} setCalDate={setCalDate} todayStr={todayStr} dotColor={C.pink} />
        </div>
      </div>
    </div>
  );
}

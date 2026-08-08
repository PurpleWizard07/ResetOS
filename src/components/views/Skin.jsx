"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Badge, Btn, Card, Cal, IconBtn, Input, PH, SLabel, EmptyState, Skeleton, WeekNav, DayToggle, Reveal, RevealItem } from "@/ui/primitives";
import { C, SPRING_SOFT } from "@/ui/theme";
import { fmt, getDayName, shiftDate, toDay } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

const ROUTINES = ["morning", "night"];

const LIST_VARIANTS = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } } };
const ITEM_VARIANTS = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: SPRING_SOFT } };

export default function Skin({ isMobile, todayStr, items, logs, addItem, removeItem, toggleLog, loading }) {
  const [weekAnchor, setWeekAnchor] = useState(toDay);
  const [calDate, setCalDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [names, setNames] = useState({ morning: "", night: "" });
  const confirm = useConfirm();

  const week7 = Array.from({ length: 7 }, (_, i) => shiftDate(weekAnchor, i - 6));
  const isDone = (itemId, dateStr) => logs.some((l) => l.item_id === itemId && l.date === dateStr);
  const itemsBy = (routine) => items.filter((i) => i.routine === routine);
  const activeDates = useMemo(() => [...new Set(logs.map((l) => l.date))], [logs]);

  const showSkeleton = loading && items.length === 0;

  return (
    <div>
      <PH title="Skin" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
        <Reveal style={{ display: "grid", gap: "12px" }}>
          {ROUTINES.map((r) => (
            <RevealItem key={r}>
              <Card style={{ padding: "16px" }}>
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

                {showSkeleton ? (
                  <div style={{ display: "grid", gap: "8px" }}>
                    <Skeleton height={28} />
                    <Skeleton height={28} />
                    <Skeleton height={28} width="80%" />
                  </div>
                ) : itemsBy(r).length === 0 ? (
                  <EmptyState pad="0">No items yet.</EmptyState>
                ) : (
                  <div className="anim-fade-in" style={{ overflowX: "auto" }}>
                    <WeekNav
                      label={`Week ${fmt(week7[0])} – ${fmt(week7[6])}`}
                      onPrev={() => setWeekAnchor(shiftDate(weekAnchor, -7))}
                      onNext={() => setWeekAnchor(shiftDate(weekAnchor, 7))}
                    />

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
                      <motion.tbody variants={LIST_VARIANTS} initial="hidden" animate="show">
                        {itemsBy(r).map((item) => (
                          <motion.tr key={item.id} variants={ITEM_VARIANTS} style={{ borderTop: `1px solid ${C.bord}` }}>
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
                                  <DayToggle active={done} onClick={() => toggleLog(item.id, d)} label={`${item.name} on ${fmt(d)}${done ? ", done" : ""}`} />
                                </td>
                              );
                            })}
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    </table>
                  </div>
                )}
              </Card>
            </RevealItem>
          ))}
        </Reveal>
        <div className="anim-fade-in">
          <Cal activeDates={activeDates} selectedDate={selectedDate} onSelect={setSelectedDate} calDate={calDate} setCalDate={setCalDate} todayStr={todayStr} dotColor={C.pink} />
        </div>
      </div>
    </div>
  );
}

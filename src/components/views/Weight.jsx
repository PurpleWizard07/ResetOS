"use client";
import { useState } from "react";
import { Btn, Card, HistoryList, IconBtn, Input, PH, SLabel, Skeleton, Field } from "@/ui/primitives";
import { TrendChart } from "@/ui/TrendChart";
import { C, MONO } from "@/ui/theme";
import { fmt, toDay } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

export default function Weight({ isMobile, logs, logWeight, remove, loading }) {
  const [date, setDate] = useState(toDay());
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const confirm = useConfirm();

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const prev = sorted[1];
  const diff = latest && prev ? (latest.weight - prev.weight).toFixed(1) : null;
  const chartPoints = sorted.slice(0, 20).reverse().map((l) => ({ x: l.date, y: l.weight }));

  const showSkeleton = loading && logs.length === 0;

  return (
    <div>
      <PH title="Weight" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
        <div>
          {showSkeleton ? (
            <div className="anim-fade-in" style={{ marginBottom: "12px" }}>
              <Card>
                <SLabel>Latest</SLabel>
                <Skeleton height={42} width="90px" style={{ marginBottom: "8px" }} />
                <Skeleton height={12} width="130px" />
              </Card>
            </div>
          ) : (
            latest && (
              <div className="anim-fade-in" style={{ marginBottom: "12px" }}>
                <Card>
                  <SLabel>Latest</SLabel>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "42px", fontWeight: 800, fontFamily: MONO, lineHeight: 1 }}>{latest.weight}</span>
                    <span style={{ color: C.mut, fontSize: "16px" }}>kg</span>
                  </div>
                  {diff !== null && (
                    <div style={{ color: parseFloat(diff) < 0 ? C.suc : parseFloat(diff) > 0 ? C.dan : C.mut, fontWeight: 600, marginBottom: "4px" }}>
                      {parseFloat(diff) > 0 ? "+" : ""}
                      {diff} kg from prev
                    </div>
                  )}
                  <div style={{ color: C.mut, fontSize: "12px" }}>{fmt(latest.date)}</div>
                </Card>
              </div>
            )
          )}
          {!showSkeleton && chartPoints.length >= 2 && (
            <div className="anim-fade-in" style={{ marginBottom: "12px" }}>
              <Card>
                <SLabel>Trend</SLabel>
                <TrendChart
                  points={chartPoints}
                  color={C.acc}
                  formatValue={(y) => y.toFixed(1)}
                  formatX={(x) => fmt(x)}
                  ariaLabel={`Weight trend across ${chartPoints.length} entries, from ${chartPoints[0].y}kg to ${chartPoints[chartPoints.length - 1].y}kg`}
                />
              </Card>
            </div>
          )}
          <div className="anim-fade-in">
            <Card>
              <SLabel>Log weight</SLabel>
              <div style={{ display: "grid", gap: "8px" }}>
                <Field label="Date" htmlFor="weight-date">
                  <Input id="weight-date" type="date" value={date} onChange={setDate} />
                </Field>
                <Input type="number" value={weight} onChange={setWeight} placeholder="Weight in kg" />
                <Input value={note} onChange={setNote} placeholder="Note (optional)" />
                <Btn
                  onClick={async () => {
                    if (!weight) return;
                    await logWeight(date, weight, note);
                    setWeight("");
                    setNote("");
                  }}
                  disabled={!weight}
                  full
                >
                  Log
                </Btn>
              </div>
            </Card>
          </div>
        </div>
        <div className="anim-fade-in">
          <Card>
            <SLabel>History</SLabel>
            {showSkeleton ? (
              <div style={{ display: "grid", gap: "10px", padding: "6px 0" }}>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} height={20} />
                ))}
              </div>
            ) : (
              <HistoryList
                items={sorted}
                empty="No weight logged yet"
                renderRow={(l) => (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: "18px", fontFamily: MONO }}>{l.weight}</span>
                      <span style={{ color: C.mut, fontSize: "13px" }}> kg</span>
                      {l.note && <div style={{ color: C.mut, fontSize: "11px" }}>{l.note}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: C.mut, fontSize: "12px", fontFamily: MONO }}>{fmt(l.date)}</span>
                      <IconBtn
                        label={`Delete weight entry from ${fmt(l.date)}`}
                        danger
                        bordered={false}
                        onClick={async () => {
                          if (await confirm("Delete this weight entry?")) remove(l.id);
                        }}
                      >
                        ✕
                      </IconBtn>
                    </div>
                  </div>
                )}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

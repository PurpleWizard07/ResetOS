"use client";
import { useState } from "react";
import { Btn, Card, IconBtn, Input, PH, SLabel, EmptyState, Field } from "@/ui/primitives";
import { C, MONO } from "@/ui/theme";
import { fmt, toDay } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

export default function Weight({ isMobile, logs, logWeight, remove }) {
  const [date, setDate] = useState(toDay());
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const confirm = useConfirm();

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const prev = sorted[1];
  const diff = latest && prev ? (latest.weight - prev.weight).toFixed(1) : null;

  return (
    <div>
      <PH title="Weight" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
        <div>
          {latest && (
            <Card style={{ marginBottom: "12px" }}>
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
          )}
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
        <Card>
          <SLabel>History</SLabel>
          {sorted.length === 0 ? (
            <EmptyState pad="20px 0">No weight logged yet</EmptyState>
          ) : (
            sorted.map((l, i) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < sorted.length - 1 ? `1px solid ${C.bord}` : "none" }}>
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
            ))
          )}
        </Card>
      </div>
    </div>
  );
}

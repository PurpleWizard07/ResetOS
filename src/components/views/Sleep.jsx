"use client";
import { useState } from "react";
import { Badge, Btn, Card, IconBtn, Input, PH, SLabel, EmptyState, Field } from "@/ui/primitives";
import { C, MONO } from "@/ui/theme";
import { fmtLong, hoursBetweenTimes, shiftDate } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

const DEFAULT_FORM = { start_time: "23:30", end_time: "07:00" };

export default function Sleep({ isMobile, todayStr, logs, save, remove }) {
  const lastNightStr = shiftDate(todayStr, -1);
  const [activeDate, setActiveDate] = useState(lastNightStr);
  const [form, setForm] = useState(DEFAULT_FORM);
  const confirm = useConfirm();

  const existing = logs.find((l) => l.date === activeDate);

  // Prefill the form with whatever is already logged for the selected night,
  // instead of always showing the last-typed values regardless of date.
  // Setting state during render (React's documented escape hatch for
  // "adjust state when a prop changes") instead of in an effect, so the reset
  // is visible in the same commit rather than causing an extra render pass.
  const [prevDate, setPrevDate] = useState(activeDate);
  if (activeDate !== prevDate) {
    setPrevDate(activeDate);
    setForm(existing ? { start_time: existing.start_time, end_time: existing.end_time } : DEFAULT_FORM);
  }

  const formDuration = hoursBetweenTimes(form.start_time, form.end_time);
  const displayDuration = existing ? existing.durationHours : formDuration;
  const badgeText = displayDuration ? `${displayDuration.toFixed(1)}h` : "Not logged";
  const badgeColor = displayDuration >= 7.5 ? "suc" : "acc";
  const recent = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);

  return (
    <div>
      <PH title="Sleep" right={<Badge color={badgeColor}>{badgeText}</Badge>} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr", gap: "20px" }}>
        <div>
          <Card style={{ marginBottom: "12px" }}>
            <SLabel>Log sleep</SLabel>
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <Field label="Night of" htmlFor="sleep-date">
                  <Input id="sleep-date" type="date" value={activeDate} onChange={setActiveDate} style={{ fontSize: "13px" }} />
                </Field>
                <div>
                  <div style={{ color: C.mut, fontSize: "11px", marginBottom: "4px" }}>Duration (auto)</div>
                  <div style={{ fontWeight: 700, fontSize: "20px", fontFamily: MONO }}>
                    {displayDuration ? displayDuration.toFixed(2) : "—"} <span style={{ color: C.mut, fontSize: "12px" }}>h</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <Field label="Sleep time" htmlFor="sleep-start" hint="Usually when you go to bed (e.g. 23:30)">
                  <Input id="sleep-start" type="time" value={form.start_time} onChange={(v) => setForm((f) => ({ ...f, start_time: v }))} />
                </Field>
                <Field label="Wake time" htmlFor="sleep-end" hint="If earlier than sleep time, counts as next day">
                  <Input id="sleep-end" type="time" value={form.end_time} onChange={(v) => setForm((f) => ({ ...f, end_time: v }))} />
                </Field>
              </div>
              <Btn
                onClick={() => save(activeDate, form.start_time, form.end_time)}
                disabled={!form.start_time || !form.end_time}
                full
              >
                Save sleep
              </Btn>
              {existing && <div style={{ color: C.mut, fontSize: "11px", marginTop: "2px" }}>Overwrites previous entry for this night.</div>}
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <SLabel>Last 14 nights</SLabel>
            {recent.length === 0 ? (
              <EmptyState pad="16px 0">No sleep logged yet</EmptyState>
            ) : (
              recent.map((l, i) => (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: i < recent.length - 1 ? `1px solid ${C.bord}` : "none",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>{fmtLong(l.date)}</div>
                    <div style={{ color: C.mut, fontSize: "11px", fontFamily: MONO, marginTop: "2px" }}>
                      {l.start_time} → {l.end_time}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px", fontFamily: MONO, color: l.durationHours >= 7.5 ? C.suc : C.acc }}>
                      {l.durationHours.toFixed(1)}h
                    </span>
                    <IconBtn
                      label={`Delete sleep entry for ${fmtLong(l.date)}`}
                      danger
                      bordered={false}
                      onClick={async () => {
                        if (await confirm("Delete this sleep entry?")) remove(l.id);
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
    </div>
  );
}

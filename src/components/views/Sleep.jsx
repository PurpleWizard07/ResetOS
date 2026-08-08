"use client";
import { useState } from "react";
import { Badge, Btn, Card, IconBtn, Input, PH, SLabel, Field, HistoryList, Skeleton } from "@/ui/primitives";
import { TrendChart } from "@/ui/TrendChart";
import { C, MONO } from "@/ui/theme";
import { fmt, fmtLong, hoursBetweenTimes, shiftDate } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";
import { usePerDateForm } from "@/hooks/usePerDateForm";

const DEFAULT_FORM = { start_time: "23:30", end_time: "07:00" };

export default function Sleep({ isMobile, todayStr, logs, save, remove, loading }) {
  const lastNightStr = shiftDate(todayStr, -1);
  const [activeDate, setActiveDate] = useState(lastNightStr);
  const confirm = useConfirm();

  const existing = logs.find((l) => l.date === activeDate);

  const [form, setForm] = usePerDateForm(activeDate, existing, DEFAULT_FORM, (e) => ({
    start_time: e.start_time,
    end_time: e.end_time,
  }));

  const formDuration = hoursBetweenTimes(form.start_time, form.end_time);
  const displayDuration = existing ? existing.durationHours : formDuration;
  const badgeText = displayDuration ? `${displayDuration.toFixed(1)}h` : "Not logged";
  const badgeColor = displayDuration >= 7.5 ? "suc" : "acc";
  const recent = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  const chartPoints = [...recent].reverse().map((l) => ({ x: l.date, y: l.durationHours }));
  const showSkeleton = loading && logs.length === 0;

  return (
    <div>
      <PH title="Sleep" right={<Badge color={badgeColor}>{badgeText}</Badge>} />
      {showSkeleton ? (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr", gap: "20px" }}>
          <div className="anim-fade-in">
            <Card style={{ marginBottom: "12px" }}>
              <Skeleton width="90px" height={11} style={{ marginBottom: "12px" }} />
              <div style={{ display: "grid", gap: "10px" }}>
                <Skeleton height={44} />
                <Skeleton height={44} />
                <Skeleton height={38} />
              </div>
            </Card>
          </div>
          <div className="anim-fade-in">
            <Card>
              <Skeleton width="110px" height={11} style={{ marginBottom: "12px" }} />
              <div style={{ display: "grid", gap: "10px" }}>
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr", gap: "20px" }}>
          <div className="anim-fade-in">
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
          <div className="anim-fade-in">
            {chartPoints.length >= 2 && (
              <Card style={{ marginBottom: "12px" }}>
                <SLabel>Trend</SLabel>
                <TrendChart
                  points={chartPoints}
                  color={C.pink}
                  formatValue={(y) => `${y.toFixed(1)}h`}
                  formatX={(x) => fmt(x)}
                  ariaLabel={`Sleep duration trend across ${chartPoints.length} nights, from ${chartPoints[0].y.toFixed(1)} to ${chartPoints[chartPoints.length - 1].y.toFixed(1)} hours`}
                />
              </Card>
            )}
            <Card>
              <SLabel>Last 14 nights</SLabel>
              <HistoryList
                items={recent}
                empty="No sleep logged yet"
                renderRow={(l) => (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                )}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

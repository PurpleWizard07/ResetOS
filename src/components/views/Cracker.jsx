"use client";
import { useMemo, useState } from "react";
import { Badge, Btn, Card, Cal, PH, SLabel, Textarea, EmptyState, Field, Input } from "@/ui/primitives";
import { C, MONO } from "@/ui/theme";
import { fmt, daysBetween } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

const EMPTY_FORM = { content: false, act: false, urge: false, note: "" };

export default function Cracker({ isMobile, todayStr, logs, saveEntry, remove }) {
  const [activeDate, setActiveDate] = useState(todayStr);
  const [calDate, setCalDate] = useState(new Date());
  const [form, setForm] = useState(EMPTY_FORM);
  const confirm = useConfirm();

  const entryForDate = logs.find((l) => l.date === activeDate);

  // The form previously kept whatever was last typed regardless of which date
  // was selected, so switching days and hitting Save could silently overwrite
  // a different day's real entry with stale toggle state. Reload per date.
  // Set during render (React's escape hatch for "adjust state when a prop
  // changes") rather than in an effect, so the switch lands in one commit.
  const [prevDate, setPrevDate] = useState(activeDate);
  if (activeDate !== prevDate) {
    setPrevDate(activeDate);
    setForm(
      entryForDate
        ? { content: entryForDate.content, act: entryForDate.act, urge: entryForDate.urge, note: entryForDate.note || "" }
        : EMPTY_FORM
    );
  }

  const slipDates = useMemo(() => [...new Set(logs.filter((l) => l.content || l.act).map((l) => l.date))], [logs]);
  const lastSlipDate = slipDates.length ? slipDates.slice().sort().slice(-1)[0] : null;
  const daysSinceSlip = lastSlipDate ? Math.max(0, daysBetween(lastSlipDate, todayStr)) : null;
  const cleanSince = typeof daysSinceSlip === "number" ? `${daysSinceSlip} day${daysSinceSlip === 1 ? "" : "s"} clean` : "No slips logged yet";
  const badgeColor = !lastSlipDate ? "suc" : daysSinceSlip >= 7 ? "suc" : daysSinceSlip >= 1 ? "acc" : "dan";
  const badgeText = !lastSlipDate ? "Starting fresh" : daysSinceSlip === 0 ? "Slipped today" : cleanSince;
  const recent = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  const toggleField = (field) => setForm((f) => ({ ...f, [field]: !f[field] }));

  const toggleBtnStyle = (active, activeColor, activeBg) => ({
    padding: "10px 8px",
    borderRadius: "8px",
    border: `1px solid ${active ? activeColor : C.bord}`,
    background: active ? activeBg : C.high,
    color: active ? activeColor : C.mut,
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  });

  return (
    <div>
      <PH title="Cracker" right={<Badge color={badgeColor}>{badgeText}</Badge>} />
      <div style={{ marginBottom: "16px" }}>
        <SLabel>Clean streak</SLabel>
        <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "16px 18px" }}>
          <div>
            <div style={{ fontSize: "12px", color: C.mut, marginBottom: "4px" }}>Days since last slip</div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                fontFamily: MONO,
                color: badgeColor === "suc" ? C.suc : badgeColor === "acc" ? C.acc : C.dan,
              }}
            >
              {typeof daysSinceSlip === "number" ? daysSinceSlip : "—"}
            </div>
          </div>
          <div style={{ textAlign: "right", maxWidth: "260px", fontSize: "12px", color: C.mut, lineHeight: 1.6 }}>
            When you go a full day without watching anything or acting on it, tomorrow this number increases. Each quiet day is
            a win — this card is here to make that visible.
          </div>
        </Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr", gap: "20px" }}>
        <div>
          <Card style={{ marginBottom: "12px" }}>
            <SLabel>Today&rsquo;s check-in</SLabel>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <Field label="Date" htmlFor="cracker-date">
                <Input id="cracker-date" type="date" value={activeDate} onChange={setActiveDate} />
              </Field>
              <div>
                <div style={{ color: C.mut, fontSize: "11px", marginBottom: "4px" }}>Status</div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>
                  {form.content || form.act ? "Slip logged" : form.urge ? "Urge resisted" : "Not logged"}
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: "8px", marginBottom: "10px" }}>
              <button type="button" onClick={() => toggleField("content")} style={toggleBtnStyle(form.content, C.dan, C.danBg)}>
                Watched adult content
              </button>
              <button type="button" onClick={() => toggleField("act")} style={toggleBtnStyle(form.act, C.dan, C.danBg)}>
                Acted on it
              </button>
              <button type="button" onClick={() => toggleField("urge")} style={toggleBtnStyle(form.urge, C.suc, C.sucBg)}>
                Urge noticed & resisted
              </button>
            </div>
            <Textarea
              value={form.note}
              onChange={(v) => setForm((f) => ({ ...f, note: v }))}
              placeholder="Notes (what triggered it, where you were, what helped, what you can change next time)..."
              rows={4}
              ariaLabel="Notes"
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <Btn onClick={() => saveEntry(activeDate, form)} full>
                Save
              </Btn>
              {entryForDate && (
                <Btn
                  variant="ghost"
                  onClick={async () => {
                    if (await confirm("Clear this day's check-in?")) {
                      await remove(entryForDate.id);
                      setForm(EMPTY_FORM);
                    }
                  }}
                >
                  Clear day
                </Btn>
              )}
            </div>
          </Card>
          <Card>
            <SLabel>Recent days</SLabel>
            {recent.length === 0 ? (
              <EmptyState pad="16px 0">No history yet. Start with today.</EmptyState>
            ) : (
              recent.map((l) => {
                const tags = [];
                if (l.content) tags.push("content");
                if (l.act) tags.push("acted");
                if (l.urge) tags.push("urge resisted");
                const isClean = !l.content && !l.act && l.urge;
                return (
                  <div key={l.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.bord}` }}>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{fmt(l.date)}</div>
                    <div style={{ fontSize: "11px", color: isClean ? C.suc : C.mut, marginTop: "2px" }}>
                      {tags.length ? tags.join(" · ") : "No data"}
                    </div>
                    {l.note && <div style={{ fontSize: "11px", color: C.mut, marginTop: "4px" }}>{l.note}</div>}
                  </div>
                );
              })
            )}
          </Card>
        </div>
        <div>
          <Card style={{ marginBottom: "12px" }}>
            <SLabel>Calendar</SLabel>
            <Cal
              activeDates={slipDates}
              selectedDate={activeDate}
              onSelect={setActiveDate}
              calDate={calDate}
              setCalDate={setCalDate}
              todayStr={todayStr}
              dotColor={C.dan}
            />
          </Card>
          <Card>
            <SLabel>Guidelines</SLabel>
            <div style={{ color: C.mut, fontSize: "12px", lineHeight: 1.7 }}>
              The goal here is simple: no adult content. Use this page to honestly track exposure, actions, and when you
              successfully ride out an urge. Over time you&rsquo;ll see patterns in triggers and build longer clean stretches.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

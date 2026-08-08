"use client";
import { useMemo, useState } from "react";
import { Badge, Btn, Card, Cal, Chip, IconBtn, Input, Modal, PH, SLabel, EmptyState, Field, Skeleton, Reveal, RevealItem } from "@/ui/primitives";
import { TrendChart } from "@/ui/TrendChart";
import { C } from "@/ui/theme";
import { fmt, fmtLong } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

const GOALS = [2000, 2500, 3000, 3500];

function EditWaterModal({ log, onSave, onClose }) {
  const [amount, setAmount] = useState(String(log.amount));
  const valid = /^\d+$/.test(amount) && Number(amount) > 0;
  return (
    <Modal title="Edit water entry" onClose={onClose}>
      <div style={{ display: "grid", gap: "14px" }}>
        <Field label="Amount (ml)" htmlFor="edit-water-amount">
          <Input id="edit-water-amount" type="number" value={amount} onChange={setAmount} autoFocus />
        </Field>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn disabled={!valid} onClick={() => valid && onSave(Number(amount))}>
            Save
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

export default function Water({ isMobile, todayStr, logs, logAmount, updateAmount, remove, goal, setGoal, loading }) {
  const [activeDate, setActiveDate] = useState(todayStr);
  const [calDate, setCalDate] = useState(new Date());
  const [custom, setCustom] = useState("");
  const [editing, setEditing] = useState(null);
  const confirm = useConfirm();

  const todayTotal = logs.filter((l) => l.date === todayStr).reduce((s, l) => s + l.amount, 0);
  const todayPct = Math.min(100, Math.round((todayTotal / goal) * 100));

  const activeLogs = logs.filter((l) => l.date === activeDate).sort((a, b) => (a.time < b.time ? -1 : 1));
  const activeTotal = activeLogs.reduce((s, l) => s + l.amount, 0);
  const activePct = Math.min(100, Math.round((activeTotal / goal) * 100));
  const isToday = activeDate === todayStr;

  const showSkeleton = loading && logs.length === 0;

  const chartPoints = useMemo(() => {
    const totals = {};
    logs.forEach((l) => {
      totals[l.date] = (totals[l.date] || 0) + l.amount;
    });
    return Object.entries(totals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-20)
      .map(([x, y]) => ({ x, y }));
  }, [logs]);

  return (
    <div>
      <PH title="Water" right={<Badge color={todayPct >= 100 ? "suc" : "acc"}>{todayPct}% of today&rsquo;s goal</Badge>} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
        <div>
          {showSkeleton ? (
            <>
              <div className="anim-fade-in" style={{ marginBottom: "12px" }}>
                <Card>
                  <Skeleton width="140px" height={12} style={{ marginBottom: "16px" }} />
                  <Skeleton height={8} radius={999} style={{ marginBottom: "16px" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "10px" }}>
                    <Skeleton height={40} radius={8} />
                    <Skeleton height={40} radius={8} />
                    <Skeleton height={40} radius={8} />
                  </div>
                  <Skeleton height={38} radius={8} />
                </Card>
              </div>
              <div className="anim-fade-in">
                <Card>
                  <Skeleton width="120px" height={12} style={{ marginBottom: "14px" }} />
                  <Skeleton height={16} style={{ marginBottom: "10px" }} />
                  <Skeleton height={16} style={{ marginBottom: "10px" }} />
                  <Skeleton height={16} />
                </Card>
              </div>
            </>
          ) : (
            <>
              <div className="anim-fade-in" style={{ marginBottom: "12px" }}>
                <Card>
                  <SLabel>
                    {isToday ? "Today" : fmtLong(activeDate)} — {activeTotal}ml / {goal}ml
                  </SLabel>
                  <div style={{ background: C.bord, borderRadius: "999px", height: "8px", marginBottom: "16px", overflow: "hidden" }}>
                    <div
                      style={{
                        background: `linear-gradient(90deg,${C.acc},${C.blue})`,
                        height: "100%",
                        width: `${activePct}%`,
                        borderRadius: "999px",
                        transition: "width 0.4s",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "1fr 1fr 1fr",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    {[200, 300, 500].map((a) => (
                      <Btn key={a} variant="accent" full onClick={() => logAmount(a, activeDate)}>
                        +{a}
                      </Btn>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <Input type="number" value={custom} onChange={setCustom} placeholder="Custom ml" ariaLabel="Custom amount in ml" />
                    <Btn
                      onClick={() => {
                        const n = parseInt(custom, 10);
                        if (n > 0) {
                          logAmount(n, activeDate);
                          setCustom("");
                        }
                      }}
                      disabled={!(parseInt(custom, 10) > 0)}
                    >
                      Add
                    </Btn>
                  </div>
                  <Field label="For date" htmlFor="water-date">
                    <Input id="water-date" type="date" value={activeDate} onChange={setActiveDate} style={{ maxWidth: "180px" }} />
                  </Field>
                </Card>
              </div>

              <div className="anim-fade-in">
                <Card>
                  <SLabel>Log for {isToday ? "today" : fmt(activeDate)}</SLabel>
                  {activeLogs.length === 0 ? (
                    <EmptyState pad="10px 0">Nothing yet</EmptyState>
                  ) : (
                    <Reveal>
                      {activeLogs.map((l, i) => (
                        <RevealItem
                          key={l.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 0",
                            borderBottom: i < activeLogs.length - 1 ? `1px solid ${C.bord}` : "none",
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600 }}>{l.amount} ml</span>
                            <span style={{ color: C.mut, fontSize: "12px", fontFamily: "var(--font-jetbrains-mono)", marginLeft: "6px" }}>
                              {l.time}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <IconBtn label={`Edit ${l.amount}ml entry at ${l.time}`} onClick={() => setEditing(l)}>
                              Edit
                            </IconBtn>
                            <IconBtn
                              label={`Delete ${l.amount}ml entry at ${l.time}`}
                              danger
                              bordered={false}
                              onClick={async () => {
                                if (await confirm("Delete this water entry?")) remove(l.id);
                              }}
                            >
                              ✕
                            </IconBtn>
                          </div>
                        </RevealItem>
                      ))}
                    </Reveal>
                  )}
                </Card>
              </div>
            </>
          )}
        </div>

        <div>
          <Cal
            activeDates={[...new Set(logs.map((l) => l.date))]}
            selectedDate={activeDate}
            onSelect={setActiveDate}
            calDate={calDate}
            setCalDate={setCalDate}
            todayStr={todayStr}
          />
          <Card style={{ marginTop: "10px" }}>
            <SLabel>Daily goal</SLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>
              {GOALS.map((g) => (
                <Chip key={g} active={goal === g} onClick={() => setGoal(g)}>
                  {g / 1000}L
                </Chip>
              ))}
            </div>
          </Card>
          {!showSkeleton && chartPoints.length >= 2 && (
            <Card style={{ marginTop: "10px" }}>
              <SLabel>Trend</SLabel>
              <TrendChart
                points={chartPoints}
                color={C.blue}
                formatValue={(y) => `${(y / 1000).toFixed(1)}L`}
                formatX={(x) => fmt(x)}
                ariaLabel={`Daily water total trend across ${chartPoints.length} days`}
              />
            </Card>
          )}
        </div>
      </div>

      {editing && (
        <EditWaterModal
          log={editing}
          onClose={() => setEditing(null)}
          onSave={async (amount) => {
            await updateAmount(editing.id, { amount });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

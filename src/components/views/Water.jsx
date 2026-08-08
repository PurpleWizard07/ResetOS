"use client";
import { useState } from "react";
import { Badge, Btn, Card, Cal, IconBtn, Input, Modal, PH, SLabel, EmptyState, Field } from "@/ui/primitives";
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

export default function Water({ isMobile, todayStr, logs, logAmount, updateAmount, remove, goal, setGoal }) {
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

  return (
    <div>
      <PH title="Water" right={<Badge color={todayPct >= 100 ? "suc" : "acc"}>{todayPct}% of today&rsquo;s goal</Badge>} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
        <div>
          <Card style={{ marginBottom: "12px" }}>
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
                <button
                  key={a}
                  onClick={() => logAmount(a, activeDate)}
                  style={{
                    background: C.accBg,
                    border: `1px solid ${C.accBord}`,
                    borderRadius: "8px",
                    color: C.acc,
                    fontFamily: "inherit",
                    fontWeight: 700,
                    fontSize: "14px",
                    padding: "12px 0",
                    cursor: "pointer",
                  }}
                >
                  +{a}
                </button>
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

          <Card>
            <SLabel>Log for {isToday ? "today" : fmt(activeDate)}</SLabel>
            {activeLogs.length === 0 ? (
              <EmptyState pad="10px 0">Nothing yet</EmptyState>
            ) : (
              activeLogs.map((l, i) => (
                <div
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
                </div>
              ))
            )}
          </Card>
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
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  aria-pressed={goal === g}
                  style={{
                    background: goal === g ? C.acc : C.high,
                    border: `1px solid ${goal === g ? C.acc : C.bord}`,
                    borderRadius: "6px",
                    color: goal === g ? "#fff" : C.mut,
                    fontFamily: "inherit",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "8px 4px",
                    cursor: "pointer",
                  }}
                >
                  {g / 1000}L
                </button>
              ))}
            </div>
          </Card>
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

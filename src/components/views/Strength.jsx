"use client";
import { useState } from "react";
import { Badge, Btn, Card, Cal, IconBtn, Input, Modal, PH, SLabel, Textarea, EmptyState, Field } from "@/ui/primitives";
import { C } from "@/ui/theme";
import { fmtLong } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

function EditWorkoutModal({ log, onSave, onClose }) {
  const [type, setType] = useState(log.type || "");
  const [notes, setNotes] = useState(log.notes || "");
  return (
    <Modal title="Edit workout" onClose={onClose}>
      <div style={{ display: "grid", gap: "10px" }}>
        <Field label="Workout type" htmlFor="edit-workout-type">
          <Input id="edit-workout-type" value={type} onChange={setType} autoFocus />
        </Field>
        <Field label="Notes" htmlFor="edit-workout-notes">
          <Textarea id="edit-workout-notes" value={notes} onChange={setNotes} rows={5} />
        </Field>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn disabled={!type.trim()} onClick={() => onSave({ type, notes })}>
            Save
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function LogList({ logs, onEdit, onDelete, emptyText }) {
  if (!logs.length) return <EmptyState pad="10px 0">{emptyText}</EmptyState>;
  return logs.map((l, i) => (
    <div key={l.id} style={{ padding: "10px 0", borderBottom: i < logs.length - 1 ? `1px solid ${C.bord}` : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: C.suc, fontSize: "13px", marginBottom: "4px" }}>{l.type}</div>
          {l.notes && <div style={{ color: C.mut, fontSize: "12px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{l.notes}</div>}
        </div>
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          <IconBtn label={`Edit ${l.type} workout`} onClick={() => onEdit(l)}>
            Edit
          </IconBtn>
          <IconBtn label={`Delete ${l.type} workout`} danger bordered={false} onClick={() => onDelete(l)}>
            ✕
          </IconBtn>
        </div>
      </div>
    </div>
  ));
}

export default function Strength({ isMobile, todayStr, streak, logs, logWorkout, update, remove }) {
  const [activeDate, setActiveDate] = useState(todayStr);
  const [calDate, setCalDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [form, setForm] = useState({ type: "Shadowboxing", notes: "" });
  const [editing, setEditing] = useState(null);
  const confirm = useConfirm();

  const activeDates = [...new Set(logs.map((l) => l.date))];
  const activeLogs = logs.filter((l) => l.date === activeDate);
  const selLogs = logs.filter((l) => l.date === selectedDate);

  const onDelete = async (l) => {
    if (await confirm("Delete this workout log?")) remove(l.id);
  };

  return (
    <div>
      <PH title="Strength" right={<Badge color="suc">{streak}d streak</Badge>} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
        <div>
          <Card style={{ marginBottom: "12px" }}>
            <SLabel>Log workout</SLabel>
            <div style={{ display: "grid", gap: "8px" }}>
              <Field label="Date" htmlFor="strength-date">
                <Input id="strength-date" type="date" value={activeDate} onChange={setActiveDate} />
              </Field>
              <Input value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} placeholder="Workout type (e.g. Pull day, Run, Yoga)" />
              <Textarea value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="Sets, reps, rounds, duration..." rows={4} />
              <Btn
                onClick={async () => {
                  if (!form.type.trim()) return;
                  await logWorkout(activeDate, form.type, form.notes);
                  setForm({ type: "Shadowboxing", notes: "" });
                }}
                full
                disabled={!form.type.trim()}
              >
                Log Workout
              </Btn>
            </div>
          </Card>
          <Card>
            <SLabel>Logs for {activeDate === todayStr ? "today" : fmtLong(activeDate)}</SLabel>
            <LogList logs={activeLogs} onEdit={setEditing} onDelete={onDelete} emptyText="No logs" />
          </Card>
        </div>
        <div>
          <Cal activeDates={activeDates} selectedDate={selectedDate} onSelect={setSelectedDate} calDate={calDate} setCalDate={setCalDate} todayStr={todayStr} dotColor={C.suc} />
          {selLogs.length > 0 && selectedDate !== todayStr && (
            <Card style={{ marginTop: "10px" }}>
              <SLabel>{fmtLong(selectedDate)}</SLabel>
              <LogList logs={selLogs} onEdit={setEditing} onDelete={onDelete} emptyText="No logs" />
            </Card>
          )}
        </div>
      </div>

      {editing && (
        <EditWorkoutModal
          log={editing}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            await update(editing.id, patch);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

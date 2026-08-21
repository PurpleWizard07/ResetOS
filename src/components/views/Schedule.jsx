"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Plus, Repeat2 } from "lucide-react";
import { Btn, Card, Cal, EmptyState, Field, IconBtn, Input, Modal, PH, Reveal, RevealItem, SLabel, Skeleton } from "@/ui/primitives";
import { C, MONO, RADIUS, SPRING } from "@/ui/theme";
import { fmtLong } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useToast } from "@/contexts/ToastContext";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Shared add/edit form for one entry — `initial` seeds a blank draft or an existing row. */
function EntryModal({ title, initial, onSave, onClose }) {
  const [form, setForm] = useState({
    start_time: initial.start_time || "09:00",
    end_time: initial.end_time || "",
    activity: initial.activity || "",
  });
  const valid = form.start_time && form.activity.trim();
  return (
    <Modal title={title} onClose={onClose}>
      <div style={{ display: "grid", gap: "14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <Field label="Start time" htmlFor="entry-start">
            <Input id="entry-start" type="time" value={form.start_time} onChange={(v) => setForm((f) => ({ ...f, start_time: v }))} />
          </Field>
          <Field label="End time" htmlFor="entry-end" hint="Optional">
            <Input id="entry-end" type="time" value={form.end_time} onChange={(v) => setForm((f) => ({ ...f, end_time: v }))} />
          </Field>
        </div>
        <Field label="Activity" htmlFor="entry-activity">
          <Input id="entry-activity" value={form.activity} onChange={(v) => setForm((f) => ({ ...f, activity: v }))} autoFocus />
        </Field>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            disabled={!valid}
            onClick={() =>
              valid && onSave({ start_time: form.start_time, end_time: form.end_time || null, activity: form.activity.trim() })
            }
          >
            Save
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

/** One stop on the day's timeline — time on the left, a connecting rail, the block itself on the right. */
function TimelineRow({ entry, isLast, onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", gap: "18px" }}>
      <div style={{ width: "64px", flexShrink: 0, textAlign: "right", paddingTop: "14px" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: "15px" }}>{entry.start_time}</div>
        {entry.end_time && <div style={{ fontFamily: MONO, fontSize: "11px", color: C.mut, marginTop: "2px" }}>{entry.end_time}</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <span
          aria-hidden="true"
          style={{ width: "11px", height: "11px", borderRadius: "50%", background: C.acc, boxShadow: `0 0 0 4px ${C.accBg}`, marginTop: "19px", flexShrink: 0 }}
        />
        {!isLast && <span aria-hidden="true" style={{ flex: 1, width: "2px", background: C.bord, marginTop: "4px" }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: "22px" }}>
        <Card style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px" }}>
          <div style={{ fontSize: "15.5px", fontWeight: 600, minWidth: 0, overflowWrap: "break-word" }}>{entry.activity}</div>
          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <IconBtn label={`Edit "${entry.activity}"`} onClick={onEdit}>
              Edit
            </IconBtn>
            <IconBtn label={`Delete "${entry.activity}"`} danger bordered={false} onClick={onDelete}>
              ✕
            </IconBtn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/** One cell in the month grid — day number plus a preview of that day's blocks. */
function DayCell({ ds, day, isToday, dayEntries, onOpen, isMobile }) {
  const previewCount = isMobile ? 2 : 3;
  const shown = dayEntries.slice(0, previewCount);
  const extra = dayEntries.length - shown.length;
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(ds)}
      aria-label={`${fmtLong(ds)}${dayEntries.length ? ` — ${dayEntries.length} scheduled` : ""}`}
      whileHover={{ backgroundColor: C.high, borderColor: C.bordStrong }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        textAlign: "left",
        background: isToday ? C.accBg : "transparent",
        border: `1px solid ${isToday ? C.accBord : C.bord}`,
        borderRadius: RADIUS.md,
        padding: "7px",
        minHeight: isMobile ? "58px" : "104px",
        cursor: "pointer",
        fontFamily: "inherit",
        color: C.text,
      }}
    >
      <span style={{ fontSize: "11.5px", fontWeight: isToday ? 700 : 600, color: isToday ? C.acc : C.text }}>
        {day}
      </span>
      <div style={{ display: "grid", gap: "2px", marginTop: "4px", overflow: "hidden" }}>
        {shown.map((e) => (
          <div key={e.id} style={{ fontSize: "9.5px", color: C.mut, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span style={{ fontFamily: MONO }}>{e.start_time}</span> {e.activity}
          </div>
        ))}
        {extra > 0 && <div style={{ fontSize: "9.5px", color: C.acc, fontWeight: 600 }}>+{extra} more</div>}
      </div>
    </motion.button>
  );
}

export default function Schedule({ isMobile, todayStr, entries, loading, addEntry, updateEntry, remove, replicateDay }) {
  const [mode, setMode] = useState("calendar"); // "calendar" | "day" | "replicate"
  const [calDate, setCalDate] = useState(new Date());
  const [activeDate, setActiveDate] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [targets, setTargets] = useState(new Set());
  const confirm = useConfirm();
  const { notify } = useToast();

  const entriesByDate = useMemo(() => {
    const map = {};
    for (const e of entries) (map[e.date] ||= []).push(e);
    for (const k in map) map[k].sort((a, b) => (a.start_time < b.start_time ? -1 : 1));
    return map;
  }, [entries]);

  const dayEntries = activeDate ? entriesByDate[activeDate] || [] : [];
  const showSkeleton = loading && entries.length === 0;

  const openDay = (date) => {
    setActiveDate(date);
    setMode("day");
  };

  const onDelete = async (entry) => {
    if (await confirm(`Delete "${entry.activity}"?`)) remove(entry.id);
  };

  const startReplicate = () => {
    setTargets(new Set());
    setMode("replicate");
  };

  const toggleTarget = (date) => {
    if (date === activeDate) return;
    setTargets((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const confirmReplicate = async () => {
    const dates = [...targets];
    if (!dates.length) return;
    await replicateDay(activeDate, dates);
    notify(`Copied ${dayEntries.length} ${dayEntries.length === 1 ? "entry" : "entries"} to ${dates.length} day${dates.length === 1 ? "" : "s"}`);
    setMode("day");
  };

  // ── Calendar (month) view — the main screen ─────────────────────────────
  if (mode === "calendar") {
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const first = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthLabel = calDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }

    return (
      <div>
        <PH
          title="Schedule"
          right={
            <Btn variant="ghost" size="sm" onClick={() => openDay(todayStr)}>
              Today
            </Btn>
          }
        />
        {showSkeleton ? (
          <Card>
            <Skeleton height={420} />
          </Card>
        ) : (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <IconBtn label="Previous month" bordered={false} onClick={() => setCalDate(new Date(year, month - 1, 1))}>
                <ChevronLeft size={16} aria-hidden="true" />
              </IconBtn>
              <span style={{ fontWeight: 700, fontSize: "14px" }} aria-live="polite">
                {monthLabel}
              </span>
              <IconBtn label="Next month" bordered={false} onClick={() => setCalDate(new Date(year, month + 1, 1))}>
                <ChevronRight size={16} aria-hidden="true" />
              </IconBtn>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "6px", marginBottom: "6px" }}>
              {WEEKDAY_LABELS.map((d) => (
                <div key={d} aria-hidden="true" style={{ textAlign: "center", color: C.mut, fontSize: "10.5px", fontWeight: 700 }}>
                  {isMobile ? d[0] : d}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "6px" }}>
              {cells.map((ds, i) =>
                ds ? (
                  <DayCell
                    key={ds}
                    ds={ds}
                    day={Number(ds.slice(-2))}
                    isToday={ds === todayStr}
                    dayEntries={entriesByDate[ds] || []}
                    onOpen={openDay}
                    isMobile={isMobile}
                  />
                ) : (
                  <div key={`pad-${i}`} />
                )
              )}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // ── Replicate — pick target dates on the same calendar ──────────────────
  if (mode === "replicate") {
    return (
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <PH
          title="Replicate schedule"
          right={
            <Btn variant="ghost" size="sm" onClick={() => setMode("day")}>
              Cancel
            </Btn>
          }
        />
        <Card style={{ marginBottom: "12px" }}>
          <SLabel style={{ marginBottom: "6px" }}>
            Copying {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"} from {fmtLong(activeDate)}
          </SLabel>
          <div style={{ color: C.mut, fontSize: "12.5px" }}>
            Tap the dates you want to copy this day&rsquo;s schedule onto, then confirm.
          </div>
        </Card>
        <Card style={{ padding: "8px", marginBottom: "12px" }}>
          <Cal
            activeDates={[...targets]}
            selectedDate={activeDate}
            onSelect={toggleTarget}
            calDate={calDate}
            setCalDate={setCalDate}
            todayStr={todayStr}
          />
        </Card>
        <Btn full disabled={targets.size === 0} onClick={confirmReplicate}>
          Copy to {targets.size} day{targets.size === 1 ? "" : "s"}
        </Btn>
      </div>
    );
  }

  // ── Day detail — the day's timeline is the whole page; add/edit live in modals ──
  return (
    <div>
      <PH
        title={fmtLong(activeDate)}
        right={
          <div style={{ display: "flex", gap: "8px" }}>
            <Btn variant="ghost" size="sm" icon={<ChevronLeft size={14} aria-hidden="true" />} onClick={() => setMode("calendar")}>
              Calendar
            </Btn>
            <Btn size="sm" icon={<Plus size={14} aria-hidden="true" />} onClick={() => setAdding(true)}>
              Add
            </Btn>
          </div>
        }
      />

      {dayEntries.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <Btn variant="ghost" size="sm" icon={<Repeat2 size={13} aria-hidden="true" />} onClick={startReplicate}>
            Replicate this day
          </Btn>
        </div>
      )}

      {showSkeleton ? (
        <Card>
          <Skeleton height={220} />
        </Card>
      ) : dayEntries.length === 0 ? (
        <Card>
          <EmptyState pad="56px 20px">Nothing scheduled for this day yet — add the first block.</EmptyState>
        </Card>
      ) : (
        <Reveal style={{ maxWidth: "780px" }}>
          {dayEntries.map((e, i) => (
            <RevealItem key={e.id}>
              <TimelineRow entry={e} isLast={i === dayEntries.length - 1} onEdit={() => setEditing(e)} onDelete={() => onDelete(e)} />
            </RevealItem>
          ))}
        </Reveal>
      )}

      {adding && (
        <EntryModal
          title="Add schedule entry"
          initial={{ start_time: "09:00", end_time: "", activity: "" }}
          onClose={() => setAdding(false)}
          onSave={async (payload) => {
            await addEntry(activeDate, payload.start_time, payload.end_time, payload.activity);
            setAdding(false);
          }}
        />
      )}
      {editing && (
        <EntryModal
          title="Edit schedule entry"
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            await updateEntry(editing.id, patch);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

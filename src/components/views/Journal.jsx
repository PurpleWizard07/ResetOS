"use client";
import { useState } from "react";
import { Badge, Btn, Card, Cal, Input, PH, SLabel, Textarea, Field } from "@/ui/primitives";
import { C } from "@/ui/theme";
import { fmt, fmtLong } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

export default function Journal({ isMobile, todayStr, streak, entries, save, remove }) {
  const [activeDate, setActiveDate] = useState(todayStr);
  const [calDate, setCalDate] = useState(new Date());
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const confirm = useConfirm();

  const activeEntry = entries.find((e) => e.date === activeDate);
  const isToday = activeDate === todayStr;
  const showForm = editing || !activeEntry;

  const goToDate = (d) => {
    setActiveDate(d);
    setEditing(false);
    setForm({ title: "", content: "" });
  };
  const startEdit = (entry) => {
    setForm({ title: entry?.title || "", content: entry?.content || "" });
    setEditing(true);
  };

  return (
    <div>
      <PH title="Journal" right={<Badge color="war">{streak}d streak</Badge>} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
        <div>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <SLabel style={{ marginBottom: 0 }}>{isToday ? `Today — ${fmtLong(todayStr)}` : fmtLong(activeDate)}</SLabel>
              {!showForm && activeEntry && (
                <div style={{ display: "flex", gap: "6px" }}>
                  <Btn onClick={() => startEdit(activeEntry)} variant="ghost" size="sm">
                    Edit
                  </Btn>
                  <Btn
                    onClick={async () => {
                      if (await confirm("Delete this journal entry?")) {
                        await remove(activeEntry.id);
                        setEditing(false);
                        setForm({ title: "", content: "" });
                      }
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    Delete
                  </Btn>
                </div>
              )}
            </div>
            {showForm ? (
              <div style={{ display: "grid", gap: "8px" }}>
                <Input value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Title (optional)" />
                <Textarea
                  value={form.content}
                  onChange={(v) => setForm((f) => ({ ...f, content: v }))}
                  placeholder={"What happened today?\nHow do you feel?\nWhat are you working towards?"}
                  rows={8}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <Btn
                    onClick={async () => {
                      if (!form.content.trim()) return;
                      await save(activeDate, form.title, form.content);
                      setEditing(false);
                    }}
                    disabled={!form.content.trim()}
                    full
                  >
                    Save
                  </Btn>
                  {activeEntry && (
                    <Btn
                      onClick={() => {
                        setEditing(false);
                        setForm({ title: "", content: "" });
                      }}
                      variant="ghost"
                    >
                      Cancel
                    </Btn>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {activeEntry.title && <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "10px" }}>{activeEntry.title}</div>}
                <div style={{ color: C.mut, fontSize: "13px", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{activeEntry.content}</div>
              </div>
            )}
          </Card>
        </div>
        <div>
          <Field label="Jump to date" htmlFor="journal-date">
            <Input id="journal-date" type="date" value={activeDate} onChange={goToDate} style={{ marginBottom: "10px" }} />
          </Field>
          <Cal
            activeDates={entries.map((e) => e.date)}
            selectedDate={activeDate}
            onSelect={goToDate}
            calDate={calDate}
            setCalDate={setCalDate}
            todayStr={todayStr}
            dotColor={C.war}
          />
          {entries.length > 0 && (
            <Card style={{ marginTop: "10px" }}>
              <SLabel>Recent entries</SLabel>
              <div style={{ display: "grid", gap: "2px" }}>
                {[...entries]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 8)
                  .map((e) => (
                    <button
                      key={e.id}
                      onClick={() => goToDate(e.date)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "none",
                        background: activeDate === e.date ? C.acc : "transparent",
                        color: activeDate === e.date ? "#fff" : C.text,
                        cursor: "pointer",
                        textAlign: "left",
                        gap: "10px",
                        fontFamily: "inherit",
                        width: "100%",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 600, color: activeDate === e.date ? "#fff" : C.mut, flexShrink: 0 }}>
                        {fmt(e.date)}
                      </span>
                      <span style={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {e.title || e.content.split("\n")[0].slice(0, 50)}
                      </span>
                    </button>
                  ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Badge, Btn, Card, Cal, Input, PH, SLabel, Textarea, Field, Skeleton, Reveal, RevealItem } from "@/ui/primitives";
import { C, RADIUS, SPRING } from "@/ui/theme";
import { fmt, fmtLong } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

export default function Journal({ isMobile, todayStr, streak, entries, save, remove, loading }) {
  const [activeDate, setActiveDate] = useState(todayStr);
  const [calDate, setCalDate] = useState(new Date());
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const confirm = useConfirm();

  const activeEntry = entries.find((e) => e.date === activeDate);
  const isToday = activeDate === todayStr;
  const showForm = editing || !activeEntry;
  const showSkeleton = loading && entries.length === 0;

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
      {showSkeleton ? (
        <div className="anim-fade-in" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
          <Card>
            <Skeleton width="160px" height={10} style={{ marginBottom: "14px" }} />
            <Skeleton height={16} style={{ marginBottom: "10px" }} />
            <Skeleton height={140} />
          </Card>
          <div style={{ display: "grid", gap: "10px" }}>
            <Skeleton height={38} radius={8} />
            <Card>
              <Skeleton width="120px" height={10} style={{ marginBottom: "12px" }} />
              <Skeleton height={16} style={{ marginBottom: "8px" }} />
              <Skeleton height={16} style={{ marginBottom: "8px" }} />
              <Skeleton height={16} />
            </Card>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
          <div className="anim-fade-in">
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
          <div className="anim-fade-in">
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
              <div className="anim-fade-in">
                <Card style={{ marginTop: "10px" }}>
                  <SLabel>Recent entries</SLabel>
                  <Reveal style={{ display: "grid", gap: "2px" }}>
                    {[...entries]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .slice(0, 8)
                      .map((e) => {
                        const isSelected = activeDate === e.date;
                        return (
                          <RevealItem key={e.id}>
                            <motion.button
                              onClick={() => goToDate(e.date)}
                              aria-current={isSelected ? "page" : undefined}
                              whileHover={isSelected ? undefined : { backgroundColor: C.high }}
                              whileTap={{ scale: 0.98 }}
                              transition={SPRING}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 10px",
                                borderRadius: RADIUS.sm,
                                border: "none",
                                background: isSelected ? C.acc : "transparent",
                                color: isSelected ? C.onAccent : C.text,
                                cursor: "pointer",
                                textAlign: "left",
                                gap: "10px",
                                fontFamily: "inherit",
                                width: "100%",
                              }}
                            >
                              <span style={{ fontSize: "12px", fontWeight: 600, color: isSelected ? C.onAccent : C.mut, flexShrink: 0 }}>
                                {fmt(e.date)}
                              </span>
                              <span style={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                                {e.title || e.content.split("\n")[0].slice(0, 50)}
                              </span>
                            </motion.button>
                          </RevealItem>
                        );
                      })}
                  </Reveal>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

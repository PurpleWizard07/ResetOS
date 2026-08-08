"use client";
import { useState } from "react";
import { Badge, Btn, Card, IconBtn, Input, PH, Sel, SLabel, Stat, Textarea, EmptyState } from "@/ui/primitives";
import { C } from "@/ui/theme";
import { fmt, toDay } from "@/lib/dateUtils";
import { useConfirm } from "@/contexts/ConfirmContext";

const RESULT_COLOR = { Passed: "suc", Failed: "dan", Pending: "war", "No Show": "mut" };
const TYPE_COLOR = { DSA: "acc", "System Design": "blue", Behavioral: "war", Mixed: "pink" };
const EMPTY_FORM = { company: "", type: "DSA", round: "Round 1", result: "Passed", notes: "" };

export default function Interview({ isMobile, interviews, addInterview, remove }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const confirm = useConfirm();

  return (
    <div>
      <PH title="Interview" right={<Btn size="sm" onClick={() => setShowForm((f) => !f)}>+ Log Interview</Btn>} />
      {showForm && (
        <Card style={{ marginBottom: "16px" }}>
          <SLabel>Log interview experience</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "8px", marginBottom: "8px" }}>
            <Input value={form.company} onChange={(v) => setForm((f) => ({ ...f, company: v }))} placeholder="Company *" />
            <Sel value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={["DSA", "System Design", "Behavioral", "Mixed"]} />
            <Input value={form.round} onChange={(v) => setForm((f) => ({ ...f, round: v }))} placeholder="Round" />
          </div>
          <div style={{ marginBottom: "8px" }}>
            <Sel value={form.result} onChange={(v) => setForm((f) => ({ ...f, result: v }))} options={["Passed", "Pending", "Failed", "No Show"]} />
          </div>
          <Textarea value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="Questions asked, approach, feedback, what to improve..." rows={4} />
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <Btn
              onClick={async () => {
                if (!form.company.trim()) return;
                await addInterview(toDay(), form);
                setForm(EMPTY_FORM);
                setShowForm(false);
              }}
              disabled={!form.company.trim()}
            >
              Save
            </Btn>
            <Btn onClick={() => setShowForm(false)} variant="ghost">
              Cancel
            </Btn>
          </div>
        </Card>
      )}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: "10px", marginBottom: "20px" }}>
        {["Passed", "Pending", "Failed", "No Show"].map((r) => (
          <Stat key={r} value={interviews.filter((i) => i.result === r).length} label={r} color={C[RESULT_COLOR[r]] || C.mut} size="26px" />
        ))}
      </div>
      <div style={{ display: "grid", gap: "10px" }}>
        {[...interviews]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((iv) => (
            <Card key={iv.id} style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "10px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>
                  {iv.company} — {iv.round}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <Badge color="mut">{fmt(iv.date)}</Badge>
                  <IconBtn
                    label={`Delete interview at ${iv.company}`}
                    danger
                    bordered={false}
                    onClick={async () => {
                      if (await confirm(`Delete this ${iv.company} interview log?`)) remove(iv.id);
                    }}
                  >
                    ✕
                  </IconBtn>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", marginBottom: iv.notes ? "10px" : "0" }}>
                <Badge color={TYPE_COLOR[iv.type]}>{iv.type}</Badge>
                <Badge color={RESULT_COLOR[iv.result]}>{iv.result}</Badge>
              </div>
              {iv.notes && <div style={{ color: C.mut, fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{iv.notes}</div>}
            </Card>
          ))}
        {interviews.length === 0 && <EmptyState pad="60px">No interviews logged yet</EmptyState>}
      </div>
    </div>
  );
}

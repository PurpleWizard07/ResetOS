"use client";
import { useState } from "react";
import { Btn, Field, Input, Modal, Sel } from "@/ui/primitives";
import { C } from "@/ui/theme";
import { CATEGORY_NAMES } from "@/lib/neetcode150";
import { DIFFICULTIES, EMPTY_ADD_FORM, SOURCES } from "./constants";

/**
 * Adding a problem of your own, outside the 150.
 *
 * This used to be a permanent form taking half the page, which is what made
 * the view feel like an admin screen: the rare action had the most space and
 * the daily one (reading and ticking off problems) had the least. It is a
 * dialog now — one click away, zero pixels at rest.
 */
export default function AddProblemModal({ onClose, onSubmit, isMobile }) {
  const [form, setForm] = useState(EMPTY_ADD_FORM);
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const created = await onSubmit(form);
    setSaving(false);
    if (created) onClose();
  };

  return (
    <Modal title="Add a problem" onClose={onClose}>
      <div style={{ display: "grid", gap: "14px" }}>
        <div style={{ fontSize: "12px", color: C.mut, lineHeight: 1.6 }}>
          For anything outside the NeetCode 150. It joins the list at the end of whichever category you pick.
        </div>
        <Field label="Problem name">
          <Input value={form.name} onChange={set("name")} placeholder="e.g. Sliding Window Median" autoFocus />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
          <Field label="Platform">
            <Sel value={form.source} onChange={set("source")} options={SOURCES} />
          </Field>
          <Field label="Difficulty">
            <Sel value={form.difficulty} onChange={set("difficulty")} options={DIFFICULTIES} />
          </Field>
        </div>
        <Field label="Category">
          <Sel
            value={form.category}
            onChange={set("category")}
            options={[{ v: "", l: "No category" }, ...CATEGORY_NAMES.map((c) => ({ v: c, l: c }))]}
          />
        </Field>
        <Field label="Link">
          <Input value={form.link} onChange={set("link")} placeholder="https://…" />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
          <Field label="Pattern" hint="The technique you'd name first">
            <Input value={form.pattern} onChange={set("pattern")} placeholder="Sliding Window" />
          </Field>
          <Field label="Tags" hint="Comma separated">
            <Input value={form.tags} onChange={set("tags")} placeholder="Array, Heap" />
          </Field>
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", paddingTop: "2px" }}>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Btn>
          <Btn onClick={submit} disabled={!form.name.trim()} loading={saving}>
            Add problem
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

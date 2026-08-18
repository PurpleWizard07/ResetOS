"use client";
import { useEffect, useRef, useState } from "react";
import { C, MONO, RADIUS } from "@/ui/theme";

/**
 * A field that reads as prose and edits in place.
 *
 * The old detail view had an "Edit" button that swapped the entire record into
 * a form and back. That is the single biggest reason it felt like a database
 * screen: to add one line to your notes you left the thing you were reading,
 * filled in eight inputs, and pressed Save. Here every block is already the
 * input — borderless and quiet until you click into it, at which point it
 * takes a background and a border and grows to fit what you type.
 *
 * Saving happens on blur, and again on unmount, so closing the view mid
 * sentence with the caret still in the box cannot lose what you wrote.
 *
 * `value` seeds the field and is then left alone. That is safe because
 * ProblemDetail is keyed on the problem id: switching problems remounts this
 * with the new value, and within one problem the only thing that changes
 * `value` is this component's own save. Re-syncing from the prop would buy
 * nothing and would fight the caret on every save round-trip.
 */
export function EditableText({ value = "", onSave, placeholder, ariaLabel, mono, minHeight = 44 }) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const areaRef = useRef(null);

  // The unmount cleanup runs once, with the closure it was created in, so it
  // reads through a ref. Kept current from an effect (after commit) rather
  // than by assigning during render.
  const latest = useRef({ draft: value, saved: value, onSave });
  useEffect(() => {
    latest.current.draft = draft;
    latest.current.onSave = onSave;
  });

  useEffect(
    () => () => {
      const { draft: d, saved, onSave: save } = latest.current;
      if (d !== saved) save(d);
    },
    []
  );

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, [draft, minHeight]);

  const commit = () => {
    const l = latest.current;
    if (l.draft === l.saved) return;
    l.saved = l.draft;
    l.onSave(l.draft);
  };

  return (
    <textarea
      ref={areaRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        commit();
      }}
      placeholder={placeholder}
      aria-label={ariaLabel}
      rows={1}
      style={{
        width: "100%",
        minHeight: `${minHeight}px`,
        background: focused ? C.bg : "transparent",
        border: `1px solid ${focused ? C.accBord : "transparent"}`,
        borderRadius: RADIUS.md,
        // Padding is unconditional — swapping it on focus would shift the text
        // sideways under the caret. Callers inset their label to match, so the
        // unfocused field still lines up with its prompt.
        padding: "8px 10px",
        color: draft ? C.text : C.mut,
        fontFamily: mono ? MONO : "inherit",
        fontSize: mono ? "12.5px" : "13px",
        lineHeight: 1.7,
        resize: "none",
        overflow: "hidden",
        display: "block",
        transition: "background 120ms ease, border-color 120ms ease",
      }}
    />
  );
}

export default EditableText;

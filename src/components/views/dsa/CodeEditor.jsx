"use client";
import { C, MONO, RADIUS } from "@/ui/theme";

/** Plain textarea tuned for C++: monospace, no autocorrect, Tab inserts spaces instead of moving focus. */
export default function CodeEditor({ value, onChange, rows = 12, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      wrap="off"
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        e.preventDefault();
        const { selectionStart, selectionEnd } = e.target;
        onChange(value.slice(0, selectionStart) + "  " + value.slice(selectionEnd));
        requestAnimationFrame(() => {
          e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
        });
      }}
      className="input-control"
      style={{
        background: C.bg,
        border: `1px solid ${C.bord}`,
        borderRadius: RADIUS.md,
        padding: "12px 14px",
        color: C.text,
        fontFamily: MONO,
        fontSize: "12.5px",
        lineHeight: 1.7,
        width: "100%",
        resize: "vertical",
        overflowX: "auto",
      }}
    />
  );
}

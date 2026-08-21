"use client";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { indentUnit } from "@codemirror/language";
import { indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { C, MONO, RADIUS } from "@/ui/theme";

// Mirrors the "Ember" palette in src/ui/theme.js so the editor reads as part
// of the app's chrome rather than a bolted-on third-party widget.
const emberTheme = createTheme({
  theme: "dark",
  settings: {
    background: C.bg,
    foreground: C.text,
    caret: C.acc,
    selection: "rgba(240,165,72,0.25)",
    selectionMatch: "rgba(240,165,72,0.15)",
    gutterBackground: C.bg,
    gutterForeground: C.mut,
    gutterBorder: "transparent",
    lineHighlight: "rgba(255,255,255,0.04)",
    fontFamily: MONO,
  },
  styles: [
    { tag: t.comment, color: C.mut, fontStyle: "italic" },
    { tag: [t.keyword, t.controlKeyword, t.moduleKeyword], color: C.acc },
    { tag: [t.string, t.special(t.string), t.character], color: C.suc },
    { tag: [t.number, t.bool, t.null], color: C.blue },
    { tag: [t.typeName, t.className, t.standard(t.typeName)], color: C.pink },
    { tag: t.function(t.variableName), color: C.war },
    { tag: t.definition(t.variableName), color: C.text },
    { tag: t.operator, color: C.text },
    { tag: [t.punctuation, t.bracket], color: C.mut },
    { tag: t.meta, color: C.mut },
  ],
});

const extensions = [cpp(), indentUnit.of("  "), keymap.of([indentWithTab])];

/** CodeMirror tuned for C++: real syntax highlighting, Tab-to-indent, bracket matching. */
export default function CodeEditor({ value, onChange, rows = 12, placeholder }) {
  return (
    <div
      className="input-control"
      style={{
        border: `1px solid ${C.bord}`,
        borderRadius: RADIUS.md,
        overflow: "hidden",
      }}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        theme={emberTheme}
        minHeight={`${Math.round(rows * 21.25)}px`}
        extensions={extensions}
        basicSetup={{ foldGutter: false, highlightActiveLine: false }}
        style={{ fontSize: "12.5px" }}
      />
    </div>
  );
}

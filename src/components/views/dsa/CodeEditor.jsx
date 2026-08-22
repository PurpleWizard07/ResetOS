"use client";
import CodeMirror from "@uiw/react-codemirror";
import { indentUnit } from "@codemirror/language";
import { indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { emberTheme, cppLang } from "./codeMirrorTheme";
import { C, RADIUS } from "@/ui/theme";

const extensions = [cppLang, indentUnit.of("  "), keymap.of([indentWithTab])];

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

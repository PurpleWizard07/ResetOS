"use client";
import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { Check, Copy } from "lucide-react";
import { IconBtn } from "@/ui/primitives";
import { C, RADIUS } from "@/ui/theme";
import { emberTheme, cppLang } from "./codeMirrorTheme";

// CodeMirror doesn't wrap by default — matches the old manual block's
// overflow-x-scroll-instead-of-wrap behavior for long lines.
const extensions = [cppLang];

/** Read-only C++ display: same highlighting/line numbers as the editor, horizontal scroll, one-click copy. */
export default function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ border: `1px solid ${C.bord}`, borderRadius: RADIUS.md, overflow: "hidden" }}>
        <CodeMirror
          value={code || ""}
          editable={false}
          theme={emberTheme}
          extensions={extensions}
          basicSetup={{ foldGutter: false, highlightActiveLine: false }}
          style={{ fontSize: "12.5px" }}
        />
      </div>
      <div style={{ position: "absolute", top: "8px", right: "8px" }}>
        <IconBtn
          label={copied ? "Copied" : "Copy code"}
          onClick={async () => {
            await navigator.clipboard.writeText(code || "");
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </IconBtn>
      </div>
    </div>
  );
}

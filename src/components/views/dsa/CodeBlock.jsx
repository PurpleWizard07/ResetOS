"use client";
import { Fragment, useState } from "react";
import { Check, Copy } from "lucide-react";
import { IconBtn } from "@/ui/primitives";
import { C, MONO, RADIUS } from "@/ui/theme";

/** Read-only C++ display: line numbers, horizontal scroll instead of wrap, one-click copy. */
export default function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const lines = (code || "").split("\n");

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          background: C.bg,
          border: `1px solid ${C.bord}`,
          borderRadius: RADIUS.md,
          padding: "12px 14px",
          overflowX: "auto",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0 14px", fontFamily: MONO, fontSize: "12.5px", lineHeight: 1.7 }}>
          {lines.map((line, i) => (
            <Fragment key={i}>
              <span style={{ color: C.mut, userSelect: "none", textAlign: "right" }}>{i + 1}</span>
              <span style={{ whiteSpace: "pre", color: C.text }}>{line.length ? line : " "}</span>
            </Fragment>
          ))}
        </div>
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

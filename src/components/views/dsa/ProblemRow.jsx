"use client";
import { memo, useState } from "react";
import { motion } from "motion/react";
import { Check, ExternalLink } from "lucide-react";
import { C, MONO, RADIUS, SPRING } from "@/ui/theme";
import { DIFF_HEX, hasWriteup, isSolved } from "./constants";

/**
 * One problem, as a list row rather than a card. At 150 problems a card each
 * would be a page of rounded rectangles you have to read one at a time; rows
 * sharing a container and separated by a hairline can be scanned down in one
 * pass, which is the actual job here.
 *
 * The hierarchy is deliberate and only the title is loud:
 *   1. title      — full weight, plain text
 *   2. difficulty — one coloured word, recognised by colour before reading
 *   3. pattern    — muted, the thing you'd say before writing code
 *   4. everything else — a tick, a number, a notes mark
 *
 * The tick is a real control, not decoration: it toggles solved without
 * opening anything, so working through a category never costs a round trip
 * into a modal and back.
 */
export const ProblemRow = memo(function ProblemRow({
  p,
  approachCount,
  onOpen,
  onToggleSolved,
  isNarrow,
  /** Prepend the category to the meta line, for lists not already grouped by it. */
  showCategory,
}) {
  const solved = isSolved(p);
  const written = hasWriteup(p, approachCount);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      aria-label={`${p.name}, ${p.difficulty}, ${solved ? "solved" : "not solved"}`}
      whileHover={{ backgroundColor: C.high }}
      transition={SPRING}
      style={{
        display: "grid",
        gridTemplateColumns: isNarrow ? "24px 1fr auto" : "24px 30px 1fr auto",
        alignItems: "center",
        gap: isNarrow ? "10px" : "12px",
        padding: isNarrow ? "11px 12px" : "11px 14px",
        cursor: "pointer",
        borderRadius: RADIUS.sm,
      }}
    >
      <SolvedTick
        solved={solved}
        label={`${solved ? "Mark unsolved" : "Mark solved"}: ${p.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSolved();
        }}
      />

      {!isNarrow && (
        <span style={{ fontFamily: MONO, fontSize: "11px", color: C.mut, opacity: 0.7, textAlign: "right" }}>
          {p.problem_order ?? "–"}
        </span>
      )}

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "13.5px",
            fontWeight: 600,
            color: solved ? C.mut : C.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.35,
          }}
        >
          {p.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "3px",
            fontSize: "11.5px",
            color: C.mut,
            minWidth: 0,
          }}
        >
          {(p.pattern || (showCategory && p.category)) && (
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {[showCategory ? p.category : null, p.pattern].filter(Boolean).join("  ·  ")}
            </span>
          )}
          {isNarrow && (
            <>
              <span style={{ opacity: 0.4, flexShrink: 0 }}>·</span>
              <span style={{ color: DIFF_HEX[p.difficulty], fontWeight: 600, flexShrink: 0 }}>{p.difficulty}</span>
            </>
          )}
          {written && (
            // A dot, not an icon. Any glyph small enough to belong on this line
            // is illegible at that size — a 11px pen read as a stray link icon.
            <span
              title="You have notes on this one"
              aria-label="Has notes"
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: C.acc,
                opacity: 0.85,
                flexShrink: 0,
                marginLeft: "1px",
              }}
            />
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        {!isNarrow && (
          <span
            style={{
              fontSize: "11.5px",
              fontWeight: 600,
              color: DIFF_HEX[p.difficulty],
              width: "54px",
              textAlign: "right",
            }}
          >
            {p.difficulty}
          </span>
        )}
        {p.link && (
          <a
            href={p.link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Open ${p.name} on ${p.source || "LeetCode"}`}
            title={`Open on ${p.source || "LeetCode"}`}
            style={{
              display: "flex",
              color: C.mut,
              // Revealed on hover so 150 rows don't each carry a visible icon,
              // but kept in the layout (not display:none) so nothing shifts —
              // and always rendered so it stays keyboard-reachable.
              opacity: hovered ? 0.85 : 0,
              transition: "opacity 120ms ease",
              padding: "2px",
            }}
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </motion.div>
  );
});

/** The solved toggle. Filled and ticked when done, a bare ring when not. */
function SolvedTick({ solved, label, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={solved}
      title={label}
      whileHover={{ scale: 1.12, borderColor: solved ? C.suc : C.acc }}
      whileTap={{ scale: 0.9 }}
      transition={SPRING}
      style={{
        width: "19px",
        height: "19px",
        borderRadius: "50%",
        border: `1.5px solid ${solved ? C.suc : C.bordStrong}`,
        background: solved ? "rgba(114,192,141,0.16)" : "transparent",
        color: C.suc,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
      }}
    >
      {solved && <Check size={12} strokeWidth={3} />}
    </motion.button>
  );
}

export default ProblemRow;

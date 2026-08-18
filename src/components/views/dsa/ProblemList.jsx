"use client";
import { memo } from "react";
import { C, MONO, RADIUS, SHADOW } from "@/ui/theme";
import { CATEGORY_BLURB } from "@/lib/neetcode150";
import ProblemRow from "./ProblemRow";
import ProgressBar from "./ProgressBar";

/**
 * The problem list, as one continuous surface with recessed category headers
 * rather than a card per category. Eighteen cards would put eighteen borders
 * and eighteen shadows on a page whose job is to be scanned; one surface with
 * clear section breaks reads as a single document.
 */
export const ProblemList = memo(function ProblemList({
  groups,
  flat,
  approachCountFor,
  onOpen,
  onToggleSolved,
  isNarrow,
}) {
  return (
    <div
      style={{
        background: C.surf,
        border: `1px solid ${C.bord}`,
        borderRadius: RADIUS.lg,
        boxShadow: `${SHADOW.inset}, ${SHADOW.sm}`,
        overflow: "hidden",
      }}
    >
      {flat ? (
        <Rows
          problems={flat}
          approachCountFor={approachCountFor}
          onOpen={onOpen}
          onToggleSolved={onToggleSolved}
          isNarrow={isNarrow}
          showCategory
        />
      ) : (
        groups.map((g, i) => (
          <section key={g.name}>
            <SectionHeader group={g} first={i === 0} isNarrow={isNarrow} />
            <Rows
              problems={g.problems}
              approachCountFor={approachCountFor}
              onOpen={onOpen}
              onToggleSolved={onToggleSolved}
              isNarrow={isNarrow}
            />
          </section>
        ))
      )}
    </div>
  );
});

function Rows({ problems, approachCountFor, onOpen, onToggleSolved, isNarrow, showCategory }) {
  return (
    <div style={{ padding: "4px" }}>
      {problems.map((p, i) => (
        <div
          key={p.id}
          style={{
            // A hairline between rows, never above the first — a top rule
            // directly under a section header reads as a double line.
            borderTop: i === 0 ? "none" : `1px solid ${C.bord}`,
          }}
        >
          <ProblemRow
            p={p}
            approachCount={approachCountFor(p.id)}
            onOpen={() => onOpen(p.id)}
            onToggleSolved={() => onToggleSolved(p)}
            isNarrow={isNarrow}
            showCategory={showCategory}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Name, what the group is about, and how far in you are — all on one line.
 *
 * An earlier version stacked the bar underneath the blurb, which put a 2px
 * rule directly below a line of text: it read as an underline, not as
 * progress. Keeping the meter beside its own number, hard right, is
 * unmistakably a meter.
 */
function SectionHeader({ group, first, isNarrow }) {
  const done = group.solved === group.total;
  const blurb = CATEGORY_BLURB[group.name];
  return (
    <div
      style={{
        background: C.bg,
        borderTop: first ? "none" : `1px solid ${C.bord}`,
        borderBottom: `1px solid ${C.bord}`,
        padding: isNarrow ? "12px 14px" : "13px 18px",
        display: "flex",
        alignItems: "baseline",
        gap: "12px",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: C.text,
          flexShrink: 0,
        }}
      >
        {group.name}
      </span>
      {blurb && !isNarrow && (
        <span
          style={{
            fontSize: "11.5px",
            color: C.mut,
            opacity: 0.8,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {blurb}
        </span>
      )}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginLeft: "auto",
          flexShrink: 0,
        }}
      >
        <span style={{ width: "56px" }}>
          <ProgressBar pct={group.pct} height={2} tone={done ? C.suc : C.acc} muted={!done} />
        </span>
        <span style={{ fontFamily: MONO, fontSize: "11px", color: done ? C.suc : C.mut }}>
          {group.solved}/{group.total}
        </span>
      </span>
    </div>
  );
}

export default ProblemList;

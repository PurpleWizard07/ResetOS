"use client";
import { memo } from "react";
import { motion } from "motion/react";
import { C, MONO, RADIUS } from "@/ui/theme";
import ProgressBar from "./ProgressBar";

/**
 * The 18 NeetCode groups as a navigation rail, each carrying its own
 * progress — so "where am I strong, what have I not started" is answered by
 * scanning one column, without opening anything.
 *
 * These are rows in a single bordered column rather than 18 cards: a card per
 * category would turn the left third of the page into a wall of rounded
 * rectangles competing with the problem list beside it.
 */
export const CategoryRail = memo(function CategoryRail({ groups, active, onSelect, totalProgress }) {
  return (
    <nav aria-label="Problem categories" style={{ display: "grid", gap: "2px" }}>
      <RailRow
        label="All problems"
        solved={totalProgress.solved}
        total={totalProgress.total}
        pct={totalProgress.pct}
        active={active === null}
        onClick={() => onSelect(null)}
        emphasis
      />
      <div style={{ height: "8px" }} />
      {groups.map((g) => (
        <RailRow
          key={g.name}
          label={g.name}
          solved={g.solved}
          total={g.total}
          pct={g.pct}
          active={active === g.name}
          onClick={() => onSelect(g.name)}
        />
      ))}
    </nav>
  );
});

const RailRow = memo(function RailRow({ label, solved, total, pct, active, onClick, emphasis }) {
  const done = total > 0 && solved === total;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      whileHover={active ? undefined : { backgroundColor: C.high }}
      whileTap={{ scale: 0.99 }}
      style={{
        background: active ? C.high : "transparent",
        border: "none",
        borderLeft: `2px solid ${active ? C.acc : "transparent"}`,
        borderRadius: `0 ${RADIUS.sm}px ${RADIUS.sm}px 0`,
        padding: "9px 11px",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        display: "grid",
        gap: "7px",
        width: "100%",
      }}
    >
      <span style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span
          style={{
            fontSize: emphasis ? "12.5px" : "12px",
            fontWeight: active || emphasis ? 700 : 600,
            color: active ? C.text : C.mut,
            flex: 1,
            minWidth: 0,
            lineHeight: 1.35,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: "10.5px",
            color: done ? C.suc : C.mut,
            flexShrink: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {solved}/{total}
        </span>
      </span>
      <ProgressBar
        pct={pct}
        height={2}
        tone={done ? C.suc : C.acc}
        muted={!active && !done}
        track="rgba(255,255,255,0.045)"
      />
    </motion.button>
  );
});

export default CategoryRail;

"use client";
import { memo } from "react";
import { C, DISPLAY, MONO, RADIUS, SHADOW } from "@/ui/theme";
import { DIFF_HEX, DIFFICULTIES, progressOf } from "./constants";
import ProgressBar from "./ProgressBar";

/**
 * "Where do I stand" — the first thing on the page and the only large type on
 * it besides the title. One number carries the whole answer (42 / 150), the
 * bar makes it felt, and the difficulty split and streak sit beside it as
 * supporting detail rather than as four competing stat cards.
 */
export const ProgressSummary = memo(function ProgressSummary({ problems, streak, todayCount, isNarrow }) {
  const overall = progressOf(problems);
  const byDifficulty = DIFFICULTIES.map((d) => ({
    difficulty: d,
    ...progressOf(problems.filter((p) => p.difficulty === d)),
  }));

  return (
    <div
      style={{
        background: C.surf,
        border: `1px solid ${C.bord}`,
        borderRadius: RADIUS.lg,
        boxShadow: `${SHADOW.inset}, ${SHADOW.sm}`,
        padding: isNarrow ? "20px" : "24px 28px",
        display: "grid",
        // The difficulty column is deliberately narrower than the headline one.
        // Given equal width its three bars stretch into long thin rules that
        // read as dividers rather than as meters.
        gridTemplateColumns: isNarrow ? "minmax(0, 1fr)" : "minmax(0, 1fr) 1px minmax(0, 0.75fr)",
        gap: isNarrow ? "22px" : "32px",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "14px" }}>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: "40px",
              lineHeight: 1,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: C.text,
            }}
          >
            {overall.solved}
          </span>
          <span style={{ fontFamily: MONO, fontSize: "15px", color: C.mut }}>/ {overall.total}</span>
          <span style={{ fontSize: "12px", color: C.mut, marginLeft: "auto", fontFamily: MONO }}>{overall.pct}%</span>
        </div>
        <ProgressBar pct={overall.pct} height={5} />
        <div
          style={{
            display: "flex",
            gap: "18px",
            marginTop: "14px",
            fontSize: "12px",
            color: C.mut,
            flexWrap: "wrap",
          }}
        >
          <span>
            solved{overall.total > overall.solved ? ` · ${overall.total - overall.solved} to go` : " · complete"}
          </span>
          <span style={{ marginLeft: "auto", display: "flex", gap: "18px" }}>
            <Meta label="streak" value={`${streak}d`} highlight={streak > 0} />
            <Meta label="today" value={todayCount} highlight={todayCount > 0} />
          </span>
        </div>
      </div>

      {!isNarrow && <div style={{ background: C.bord, alignSelf: "stretch" }} />}

      {/* Capped rather than fluid: stacked, this column is as wide as the card,
          and a 3px bar 800px long stops looking like a meter. */}
      <div style={{ display: "grid", gap: "13px", maxWidth: "400px", width: "100%" }}>
        {byDifficulty.map((d) => (
          <div key={d.difficulty} style={{ display: "grid", gridTemplateColumns: "62px minmax(0, 1fr) 54px", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: DIFF_HEX[d.difficulty] }}>{d.difficulty}</span>
            <ProgressBar pct={d.pct} tone={DIFF_HEX[d.difficulty]} muted />
            <span style={{ fontFamily: MONO, fontSize: "11.5px", color: C.mut, textAlign: "right" }}>
              {d.solved}/{d.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

function Meta({ label, value, highlight }) {
  return (
    <span style={{ display: "inline-flex", gap: "5px", alignItems: "baseline" }}>
      <span style={{ fontFamily: MONO, fontSize: "12.5px", color: highlight ? C.acc : C.mut, fontWeight: 600 }}>
        {value}
      </span>
      <span>{label}</span>
    </span>
  );
}

export default ProgressSummary;

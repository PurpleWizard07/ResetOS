"use client";
import { memo } from "react";
import { motion } from "motion/react";
import { C, RADIUS, SPRING } from "@/ui/theme";

/**
 * Single-select filter control: one bordered group with a sliding highlight,
 * instead of N separate pills.
 *
 * The distinction matters here. Eight loose pills across two rows read as
 * eight independent things to consider; two segmented groups read as two
 * questions with one answer each — which is what filtering by status and by
 * difficulty actually is. It also makes the current selection unambiguous
 * without needing a filled accent on every active pill.
 *
 * `options` is `[{ id, label, tone? }]`; `tone` overrides the highlight colour
 * (difficulty uses its own).
 */
export const Segmented = memo(function Segmented({ options, value, onChange, ariaLabel, scroll }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        display: "flex",
        gap: "2px",
        padding: "3px",
        background: C.bg,
        border: `1px solid ${C.bord}`,
        borderRadius: RADIUS.md,
        // On a phone the status group is wider than the viewport; scrolling it
        // keeps every option reachable without wrapping into a second row.
        // That only works if the group is *allowed* to be narrower than its
        // content — flexShrink:0 plus a min-width of auto is exactly what
        // pushes a flex item past the viewport edge instead.
        overflowX: scroll ? "auto" : "visible",
        scrollbarWidth: "none",
        flexShrink: scroll ? 1 : 0,
        minWidth: scroll ? 0 : "auto",
      }}
    >
      {options.map((o) => {
        const active = o.id === value;
        const tone = o.tone || C.acc;
        return (
          <motion.button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={active}
            whileHover={active ? undefined : { color: C.text }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
            style={{
              position: "relative",
              background: "none",
              border: "none",
              borderRadius: RADIUS.sm,
              padding: "6px 12px",
              fontSize: "11.5px",
              fontWeight: 600,
              fontFamily: "inherit",
              color: active ? tone : C.mut,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {active && (
              <motion.span
                layoutId={`seg-${ariaLabel}`}
                transition={SPRING}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: C.high,
                  border: `1px solid ${C.bord}`,
                  borderRadius: RADIUS.sm,
                  zIndex: 0,
                }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>{o.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
});

export default Segmented;

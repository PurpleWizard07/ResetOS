"use client";
import { memo } from "react";
import { motion } from "motion/react";
import { C, EASE_EXPO } from "@/ui/theme";

/**
 * The one progress bar shape in the DSA view — overall, per difficulty, per
 * category. Deliberately thin and un-decorated: at 150 problems these appear
 * twenty times on one screen, so anything with a glow or a gradient sheen
 * would read as noise rather than as information.
 *
 * `tone` is a hex colour for the fill; the default gold is the app's accent,
 * used for the overall bar. Difficulty bars pass their own difficulty colour.
 *
 * `track` is the unfilled remainder. The category rail overrides it with
 * something fainter: eighteen of these stacked in a column at the default
 * weight stop reading as empty meters and start reading as row dividers.
 */
export const ProgressBar = memo(function ProgressBar({ pct, tone = C.acc, height = 3, muted = false, track = C.high }) {
  return (
    <div
      role="presentation"
      style={{
        height: `${height}px`,
        background: track,
        borderRadius: "99px",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: EASE_EXPO }}
        style={{
          height: "100%",
          background: tone,
          opacity: muted ? 0.45 : 1,
          borderRadius: "99px",
        }}
      />
    </div>
  );
});

export default ProgressBar;

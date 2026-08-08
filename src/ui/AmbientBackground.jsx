"use client";
import { memo } from "react";
import { motion } from "motion/react";
import { C } from "@/ui/theme";

/**
 * Fixed, non-interactive backdrop: two slow-drifting glow blobs (ember gold +
 * a muted teal for contrast) plus a faint grain texture (`.grain-overlay`,
 * defined in globals.css). Renders once at the root of the app shell and of
 * the pre-auth screens — never inside a scrollable/repeated area.
 */
export const AmbientBackground = memo(function AmbientBackground() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <motion.div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-8%",
          width: "50vw",
          height: "50vw",
          maxWidth: "620px",
          maxHeight: "620px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accBg} 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: "45vw",
          height: "45vw",
          maxWidth: "560px",
          maxHeight: "560px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.blueBg} 0%, transparent 70%)`,
          filter: "blur(70px)",
        }}
        animate={{ x: [0, -24, 0], y: [0, -16, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="grain-overlay" />
    </div>
  );
});

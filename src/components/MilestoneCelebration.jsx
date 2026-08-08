"use client";
import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, X } from "lucide-react";
import { C, MONO, RADIUS, SHADOW, SPRING_SOFT } from "@/ui/theme";

const PARTICLE_COLORS = [C.acc, C.suc, C.pink, C.blue];
// Fixed per-index jitter (not Math.random — a memo must stay a pure function
// of its inputs) that still reads as a natural, uneven burst.
const ANGLE_JITTER = [-9, 6, -3, 9, -6, 4, -8, 2, 7, -4, 5, -7, 3, -2];

function Particles({ color }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        angle: (i / 14) * 360 + ANGLE_JITTER[i],
        distance: 46 + ((i * 11) % 34),
        size: 4 + ((i * 5) % 3),
        delay: (i % 5) * 0.03,
        color: i % 3 === 0 ? color : PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      })),
    [color]
  );

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {particles.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
            animate={{ opacity: 0, x, y, scale: 1 }}
            transition={{ duration: 0.7, delay: p.delay, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              background: p.color,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Celebratory overlay for a newly-crossed streak milestone. Pairs with
 * `useMilestoneCelebration` — pass its `active`/`dismiss` straight through.
 */
export function MilestoneCelebration({ active, dismiss }) {
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(dismiss, 5000);
    return () => clearTimeout(id);
  }, [active, dismiss]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92, y: 10, transition: { duration: 0.15 } }}
          transition={SPRING_SOFT}
          style={{
            position: "fixed",
            bottom: "28px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1250,
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "16px 20px",
              background: C.glass,
              backdropFilter: "blur(24px)",
              border: `1px solid ${active.color}55`,
              borderRadius: RADIUS.xl,
              boxShadow: `${SHADOW.lg}, 0 0 0 1px ${active.color}22`,
            }}
          >
            <Particles color={active.color} />
            <div
              aria-hidden="true"
              style={{
                position: "relative",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${active.color}22`,
                color: active.color,
              }}
            >
              <Flame size={20} />
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: "16px", color: C.text }}>
                {active.milestone}-day {active.label} streak
              </div>
              <div style={{ fontSize: "12px", color: C.mut, marginTop: "2px" }}>Keep it going.</div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              style={{
                position: "relative",
                background: "none",
                border: "none",
                color: C.mut,
                cursor: "pointer",
                display: "flex",
                padding: "4px",
                marginLeft: "4px",
                flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

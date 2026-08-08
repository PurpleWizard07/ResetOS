"use client";
import { useState } from "react";

const MILESTONES = [7, 14, 30, 50, 100, 200, 365];
const STORAGE_KEY = "lifeos:milestonesSeen";

// This hook only ever runs after auth resolves (LifeOS never server-renders —
// page.tsx gates it behind a client-only session check), so a direct
// synchronous localStorage read in a lazy initializer is safe here; there's
// no SSR pass of this component to mismatch against.
function loadSeen() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null; // null means "never run before"
  } catch {
    return null;
  }
}

function saveSeen(seen) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  } catch {
    // Private-mode/quota failure — celebrations just won't persist across reloads.
  }
}

/**
 * Detects when a streak crosses a milestone (7/14/30/... days) that hasn't
 * been celebrated yet, and returns the one to show. Seeds silently on the
 * very first run instead of comparing against an empty history — an
 * existing 40-day streak shouldn't "newly" celebrate 7 the moment this
 * feature ships; only genuine crossings after that surface.
 *
 * Usage: `const { active, dismiss } = useMilestoneCelebration(streaks);`
 * where `streaks` is the same `[{ l, v, c }]` array LifeOS already builds.
 */
export function useMilestoneCelebration(streaks) {
  const [store, setStore] = useState(() => {
    const stored = loadSeen();
    return stored ? { seeded: true, seen: stored } : { seeded: false, seen: {} };
  });
  const [active, setActive] = useState(null);
  const [prevKey, setPrevKey] = useState("");

  const key = streaks.map((s) => `${s.l}:${s.v}`).join(",");
  if (key !== prevKey) {
    setPrevKey(key);
    if (!store.seeded) {
      const seed = {};
      streaks.forEach((s) => {
        const reached = MILESTONES.filter((m) => s.v >= m).pop();
        if (reached) seed[s.l] = reached;
      });
      setStore({ seeded: true, seen: seed });
      saveSeen(seed);
    } else {
      for (const s of streaks) {
        const reached = MILESTONES.filter((m) => s.v >= m).pop();
        if (reached && store.seen[s.l] !== reached) {
          const nextSeen = { ...store.seen, [s.l]: reached };
          setStore({ seeded: true, seen: nextSeen });
          saveSeen(nextSeen);
          setActive({ label: s.l, milestone: reached, color: s.c });
          break; // one celebration at a time, even if two streaks cross at once
        }
      }
    }
  }

  return { active, dismiss: () => setActive(null) };
}

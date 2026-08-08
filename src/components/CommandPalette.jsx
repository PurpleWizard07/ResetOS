"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CornerDownLeft, Download, Droplet, Search } from "lucide-react";
import { C, RADIUS, SHADOW, SPRING_SOFT } from "@/ui/theme";
import { NAV_ITEMS } from "@/lib/navConfig";

/**
 * Cmd/Ctrl+K quick-jump to any section, plus a couple of instant actions (log
 * water, export data) that don't require navigating away from wherever you are.
 * Self-contained: owns its own open state and the global keyboard listener.
 */
export function CommandPalette({ open, setOpen, go, quickAddWater, exportData }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const nav = NAV_ITEMS.map((n) => ({
      id: `nav-${n.id}`,
      label: n.label,
      icon: n.icon,
      run: () => go(n.id),
      keywords: `${n.label} ${n.group || ""} go open navigate`.toLowerCase(),
    }));
    const actions = [
      {
        id: "action-water-300",
        label: "Log 300ml of water",
        icon: Droplet,
        run: () => quickAddWater(300),
        keywords: "water quick add log 300",
      },
      {
        id: "action-water-500",
        label: "Log 500ml of water",
        icon: Droplet,
        run: () => quickAddWater(500),
        keywords: "water quick add log 500",
      },
      {
        id: "action-export",
        label: "Export my data (JSON)",
        icon: Download,
        run: () => exportData(),
        keywords: "export data download backup json",
      },
    ];
    return [...nav, ...actions];
  }, [go, quickAddWater, exportData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results;
    return results.filter((r) => r.keywords.includes(q));
  }, [results, query]);

  // Reset on CLOSE (an explicit action this component always controls) rather
  // than deriving a reset from `open` changing — `open` can flip true from
  // outside (the sidebar's Search button), so there's no single "just
  // opened" moment to hook a reset effect to; but every path that closes the
  // palette already runs through this component, so resetting here means it
  // always starts clean the next time it opens, regardless of trigger.
  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, [setOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) closePalette();
        else setOpen(true);
      } else if (e.key === "Escape" && open) {
        closePalette();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen, closePalette]);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 10);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(id);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const select = (r) => {
    r.run();
    closePalette();
  };

  const onQueryChange = (v) => {
    setQuery(v);
    setActiveIndex(0);
  };

  const onInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) select(filtered[activeIndex]);
    } else if (e.key === "Tab") {
      // Keep focus on the input — arrow keys are the nav model here, not Tab.
      e.preventDefault();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={closePalette}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            background: "rgba(6,5,4,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            paddingTop: "12vh",
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={SPRING_SOFT}
            style={{
              width: "100%",
              maxWidth: "480px",
              maxHeight: "min(60vh, 420px)",
              margin: "0 16px",
              background: C.glass,
              backdropFilter: "blur(24px)",
              border: `1px solid ${C.bord}`,
              borderRadius: RADIUS.xl,
              boxShadow: SHADOW.lg,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: `1px solid ${C.bord}`, flexShrink: 0 }}>
              <Search size={16} color={C.mut} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Jump to a section or run a quick action..."
                aria-label="Search sections and actions"
                autoFocus
                style={{ flex: 1, minWidth: 0, background: "none", border: "none", outline: "none", color: C.text, fontSize: "14px", fontFamily: "inherit" }}
              />
              <kbd style={{ fontSize: "10px", color: C.mut, border: `1px solid ${C.bord}`, borderRadius: RADIUS.sm, padding: "2px 5px", flexShrink: 0 }}>
                Esc
              </kbd>
            </div>
            <div style={{ overflowY: "auto", padding: "8px" }} role="listbox" aria-label="Results">
              {filtered.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: C.mut, fontSize: "13px" }}>No matches</div>
              )}
              {filtered.map((r, i) => {
                const Icon = r.icon;
                const isActive = i === activeIndex;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => select(r)}
                    onMouseEnter={() => setActiveIndex(i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 10px",
                      borderRadius: RADIUS.md,
                      border: "none",
                      background: isActive ? C.high : "transparent",
                      color: isActive ? C.text : C.mut,
                      fontSize: "13px",
                      fontFamily: "inherit",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Icon size={15} aria-hidden="true" />
                    <span style={{ flex: 1 }}>{r.label}</span>
                    {isActive && <CornerDownLeft size={13} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

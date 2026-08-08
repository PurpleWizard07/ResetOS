import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { C, DISPLAY, MONO, RADIUS, SHADOW, SPRING, SPRING_SOFT, EASE_EXPO } from "@/ui/theme";

/** Shared arrow-button look for Cal's month nav and WeekNav's week nav. */
const navArrowStyle = {
  background: "none",
  border: "none",
  color: C.mut,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: "5px 8px",
  borderRadius: RADIUS.sm,
  fontFamily: "inherit",
};

export const Badge = memo(function Badge({ children, color = "mut" }) {
  const map = {
    acc: [C.accBg, C.acc],
    suc: [C.sucBg, C.suc],
    war: [C.warBg, C.war],
    dan: [C.danBg, C.dan],
    mut: [C.high, C.mut],
    blue: [C.blueBg, C.blue],
    pink: [C.pinkBg, C.pink],
  };
  const [bg, col] = map[color] || map.mut;
  return (
    <span
      style={{
        background: bg,
        color: col,
        padding: "3px 8px",
        borderRadius: RADIUS.sm,
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
});

/**
 * Inline spinner. Usage: `<Spinner size={14} />`, or inside a button via
 * `Btn`'s own `loading` prop rather than composing this by hand.
 */
export const Spinner = memo(function Spinner({ size = 16, color }) {
  return (
    <motion.span
      aria-hidden="true"
      style={{ display: "inline-flex", color: color || "currentColor" }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 size={size} />
    </motion.span>
  );
});

/**
 * Loading placeholder. Usage: `<Skeleton height={18} width="60%" />` for a
 * text line; stack a few for a card/row skeleton — it's deliberately just a
 * styled block, not a variant system, so callers compose their own shape.
 */
export const Skeleton = memo(function Skeleton({ width = "100%", height = 16, radius = RADIUS.sm, style = {} }) {
  return <div className="skeleton" aria-hidden="true" style={{ width, height, borderRadius: radius, ...style }} />;
});

const BTN_VARIANTS = {
  primary: {
    bg: C.accGrad,
    color: C.onAccent,
    border: "none",
    whileHover: { y: -1, boxShadow: SHADOW.glow },
  },
  ghost: {
    bg: "transparent",
    color: C.text,
    border: `1px solid ${C.bord}`,
    whileHover: { backgroundColor: C.high, borderColor: C.bordStrong },
  },
  success: {
    bg: C.sucBg,
    color: C.suc,
    border: "1px solid rgba(114,192,141,0.28)",
    whileHover: { backgroundColor: "rgba(114,192,141,0.22)" },
  },
  danger: {
    bg: C.danBg,
    color: C.dan,
    border: "1px solid rgba(226,104,90,0.28)",
    whileHover: { backgroundColor: "rgba(226,104,90,0.22)" },
  },
  accent: {
    bg: C.accBg,
    color: C.acc,
    border: `1px solid ${C.accBord}`,
    whileHover: { backgroundColor: "rgba(240,165,72,0.22)", borderColor: C.acc },
  },
};

export const Btn = memo(function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  full,
  type = "button",
  title,
  ariaLabel,
  icon,
  loading,
}) {
  const ss = { sm: "6px 12px", md: "9px 17px", lg: "12px 23px" };
  const fs = { sm: "11px", md: "13px", lg: "14px" };
  const iconPx = { sm: 12, md: 14, lg: 15 };
  const v = BTN_VARIANTS[variant] || BTN_VARIANTS.primary;
  const isDisabled = disabled || loading;
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      whileHover={isDisabled ? undefined : v.whileHover}
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
      transition={SPRING}
      style={{
        background: v.bg,
        color: v.color,
        border: v.border,
        padding: ss[size],
        fontSize: fs[size],
        fontWeight: 600,
        borderRadius: RADIUS.md,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.45 : 1,
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        width: full ? "100%" : "auto",
        justifyContent: "center",
        whiteSpace: "nowrap",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{ display: "inline-flex" }}
          >
            <Spinner size={iconPx[size]} />
          </motion.span>
        ) : icon ? (
          <motion.span
            key="icon"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{ display: "inline-flex" }}
          >
            {icon}
          </motion.span>
        ) : null}
      </AnimatePresence>
      {children}
    </motion.button>
  );
});

/**
 * Small icon-only control. `label` is required and becomes the accessible
 * name — a bare "✕" is announced as nothing useful by a screen reader.
 */
export const IconBtn = memo(function IconBtn({
  children,
  onClick,
  label,
  danger,
  bordered = true,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      whileHover={{
        backgroundColor: danger ? "rgba(226,104,90,0.14)" : C.high,
        borderColor: danger ? "rgba(226,104,90,0.4)" : C.bordStrong,
        color: danger ? C.dan : C.text,
      }}
      whileTap={{ scale: 0.9 }}
      transition={SPRING}
      style={{
        background: "transparent",
        border: bordered ? `1px solid ${C.bord}` : "none",
        borderRadius: RADIUS.sm,
        color: danger ? C.dan : C.mut,
        cursor: "pointer",
        fontSize: "11px",
        lineHeight: 1.4,
        padding: bordered ? "4px 8px" : "3px 5px",
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {children}
    </motion.button>
  );
});

export const Input = memo(function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  style = {},
  disabled,
  min,
  max,
  step,
  id,
  ariaLabel,
  autoFocus,
  onKeyDown,
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      aria-label={ariaLabel}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      className="input-control"
      style={{
        background: C.high,
        border: `1px solid ${C.bord}`,
        borderRadius: RADIUS.md,
        padding: "10px 13px",
        color: C.text,
        fontFamily: "inherit",
        fontSize: "13px",
        width: "100%",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    />
  );
});

export const Textarea = memo(function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  id,
  ariaLabel,
  disabled,
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      aria-label={ariaLabel}
      disabled={disabled}
      className="input-control"
      style={{
        background: C.high,
        border: `1px solid ${C.bord}`,
        borderRadius: RADIUS.md,
        padding: "10px 13px",
        color: C.text,
        fontFamily: "inherit",
        fontSize: "13px",
        width: "100%",
        resize: "vertical",
        lineHeight: 1.6,
      }}
    />
  );
});

export const Sel = memo(function Sel({
  value,
  onChange,
  options,
  style = {},
  id,
  ariaLabel,
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="input-control"
      style={{
        background: C.high,
        border: `1px solid ${C.bord}`,
        borderRadius: RADIUS.md,
        padding: "10px 13px",
        color: C.text,
        fontFamily: "inherit",
        fontSize: "13px",
        width: "100%",
        cursor: "pointer",
        ...style,
      }}
    >
      {options.map((o) => (
        <option key={o.v ?? o} value={o.v ?? o}>
          {o.l ?? o}
        </option>
      ))}
    </select>
  );
});

/** Labelled form control. Ties the label to the input so clicking it focuses. */
export const Field = memo(function Field({ label, htmlFor, hint, children }) {
  return (
    <div>
      {label && (
        <label
          htmlFor={htmlFor}
          style={{
            display: "block",
            color: C.mut,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            marginBottom: "5px",
          }}
        >
          {label}
        </label>
      )}
      {children}
      {hint && (
        <div style={{ color: C.mut, fontSize: "11px", marginTop: "3px" }}>
          {hint}
        </div>
      )}
    </div>
  );
});

export const Card = memo(function Card({ children, style = {}, onClick, label, dashed }) {
  const base = {
    background: dashed ? "transparent" : C.surf,
    border: `1px ${dashed ? "dashed" : "solid"} ${C.bord}`,
    borderRadius: RADIUS.lg,
    padding: "20px",
    boxShadow: dashed ? "none" : `${SHADOW.inset}, ${SHADOW.sm}`,
    ...style,
  };
  if (!onClick) return <div style={base}>{children}</div>;
  // Cards can contain their own nested buttons/links (e.g. a delete icon, an
  // outbound link), so this can't be a real <button> — nesting interactive
  // elements inside one is invalid HTML and browsers will mangle it. Instead
  // it's a div made keyboard-operable directly: focusable, with a role, and
  // Enter/Space wired to activate like a native button would.
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return; // let nested controls handle their own keys
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(e);
        }
      }}
      aria-label={label}
      whileHover={
        dashed
          ? { borderColor: C.acc, backgroundColor: C.accBg, y: -2 }
          : { y: -3, borderColor: C.bordStrong, boxShadow: `${SHADOW.inset}, ${SHADOW.md}` }
      }
      whileTap={{ scale: 0.99 }}
      transition={SPRING}
      style={{ ...base, cursor: "pointer" }}
    >
      {children}
    </motion.div>
  );
});

export const SLabel = memo(function SLabel({ children, style = {} }) {
  return (
    <div
      style={{
        color: C.mut,
        fontSize: "10.5px",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: "11px",
        ...style,
      }}
    >
      {children}
    </div>
  );
});

export const PH = memo(function PH({ title, right }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        marginBottom: "32px",
      }}
    >
      <h2
        style={{
          fontFamily: DISPLAY,
          fontSize: "29px",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          margin: 0,
          color: C.text,
        }}
      >
        {title}
      </h2>
      {right && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {right}
        </div>
      )}
    </div>
  );
});

/** Empty-state message. `icon` and `action` are optional — a bare centered
 * string still works for low-stakes spots that don't need either. */
export const EmptyState = memo(function EmptyState({ children, pad = "48px 20px", icon, action }) {
  return (
    <div style={{ color: C.mut, textAlign: "center", padding: pad, fontSize: "13px" }}>
      {icon && (
        <div
          aria-hidden="true"
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: C.high,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
            color: C.mut,
          }}
        >
          {icon}
        </div>
      )}
      <div>{children}</div>
      {action && <div style={{ marginTop: "16px" }}>{action}</div>}
    </div>
  );
});

export const Stat = memo(function Stat({ value, label, color, size = "26px" }) {
  return (
    <Card style={{ padding: "15px", textAlign: "center" }}>
      <div
        style={{
          fontSize: size,
          fontWeight: 700,
          color: color || C.text,
          fontFamily: MONO,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div style={{ color: C.mut, fontSize: "11px", marginTop: "5px" }}>
        {label}
      </div>
    </Card>
  );
});

/**
 * Prev/current/next header for a week-scoped view (a 7-day habit grid, etc).
 * Usage: `<WeekNav label="Nov 3 – Nov 9" onPrev={...} onNext={...} />`
 */
export const WeekNav = memo(function WeekNav({ label, onPrev, onNext }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
      <motion.button
        type="button"
        onClick={onPrev}
        aria-label="Previous week"
        whileHover={{ backgroundColor: C.higher, color: C.text }}
        whileTap={{ scale: 0.9 }}
        style={navArrowStyle}
      >
        <ChevronLeft size={18} />
      </motion.button>
      <span style={{ fontSize: "12.5px", fontWeight: 700 }} aria-live="polite">
        {label}
      </span>
      <motion.button
        type="button"
        onClick={onNext}
        aria-label="Next week"
        whileHover={{ backgroundColor: C.higher, color: C.text }}
        whileTap={{ scale: 0.9 }}
        style={navArrowStyle}
      >
        <ChevronRight size={18} />
      </motion.button>
    </div>
  );
});

/**
 * Single toggle cell for a day-of-week/day-of-month grid (habit trackers,
 * vitamin schedules, etc). `dim` marks a day that isn't expected/scheduled
 * without fully hiding it. Usage:
 * `<DayToggle active={taken} dim={!scheduled} onClick={...} label="Mon 4 — taken" />`
 */
export const DayToggle = memo(function DayToggle({ active, dim, disabled, onClick, label }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      whileHover={disabled ? undefined : { scale: 1.1, boxShadow: `0 0 0 2px ${C.bordStrong}` }}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={SPRING}
      style={{
        width: "28px",
        height: "28px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: RADIUS.sm,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: active ? C.acc : C.high,
        color: active ? C.onAccent : C.mut,
        opacity: dim && !active ? 0.4 : 1,
        fontFamily: "inherit",
      }}
    >
      {active && <Check size={14} strokeWidth={3} aria-hidden="true" />}
    </motion.button>
  );
});

const CHIP_COLORS = {
  acc: [C.accBg, C.acc, C.accBord],
  suc: [C.sucBg, C.suc, "rgba(114,192,141,0.35)"],
  dan: [C.danBg, C.dan, "rgba(226,104,90,0.35)"],
  war: [C.warBg, C.war, "rgba(203,123,74,0.35)"],
};

/**
 * Labeled toggle button — 3-way field toggles, frequency/day-of-week
 * presets, filter pills. Usage: `<Chip active={value === "act"} onClick={...}>Acted on it</Chip>`
 */
export const Chip = memo(function Chip({ children, active, onClick, color = "acc", disabled }) {
  const [bg, col, bord] = CHIP_COLORS[color] || CHIP_COLORS.acc;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      whileHover={
        disabled ? undefined : active ? { filter: "brightness(1.12)" } : { backgroundColor: C.higher, borderColor: C.bordStrong }
      }
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={SPRING}
      style={{
        background: active ? bg : C.high,
        border: `1px solid ${active ? bord : C.bord}`,
        color: active ? col : C.mut,
        borderRadius: RADIUS.md,
        padding: "7px 13px",
        fontSize: "12px",
        fontWeight: 700,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </motion.button>
  );
});

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: SPRING_SOFT },
};

/**
 * Stagger-reveal a list with real spring physics. Wrap the container in
 * `<Reveal>` (props behave like a plain div) and each mapped child in
 * `<RevealItem>`:
 * ```
 * <Reveal style={{ display: "grid", gap: "10px" }}>
 *   {items.map((it) => <RevealItem key={it.id}>...</RevealItem>)}
 * </Reveal>
 * ```
 * For `<tr>`/`<td>` inside a real `<table>`, use `motion.tr`/`variants`
 * directly instead — Reveal/RevealItem render `<div>`s.
 */
export const Reveal = memo(function Reveal({ children, style, className }) {
  return (
    <motion.div className={className} style={style} variants={listVariants} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
});

export const RevealItem = memo(function RevealItem({ children, style, className }) {
  return (
    <motion.div className={className} style={style} variants={itemVariants}>
      {children}
    </motion.div>
  );
});

/**
 * "Recent entries" list: empty-state fallback + a divider between rows,
 * revealed with a real spring stagger (via Reveal/RevealItem) automatically.
 * Row *content* is fully custom — this only owns the shared wrapper
 * boilerplate. Usage:
 * ```
 * <HistoryList items={logs} empty="No entries yet" renderRow={(log) => (
 *   <div style={{ display: "flex", justifyContent: "space-between" }}>...</div>
 * )} />
 * ```
 */
export const HistoryList = memo(function HistoryList({ items, renderRow, empty = "Nothing yet" }) {
  if (!items?.length) return <EmptyState pad="20px 0">{empty}</EmptyState>;
  return (
    <Reveal>
      {items.map((item, i) => (
        <RevealItem
          key={item.id ?? i}
          style={{ padding: "12px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.bord}` : "none" }}
        >
          {renderRow(item, i)}
        </RevealItem>
      ))}
    </Reveal>
  );
});

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export const Modal = memo(function Modal({
  children,
  onClose,
  title,
  fullscreen,
  /** When fullscreen, offset the overlay from the left (e.g. sidebar width in px). */
  fullscreenInsetLeft = 0,
  /** Opt-in shared-element id — pairs with a `layoutId` on the element (e.g.
   * a Card) this modal should visually grow out of. Omit for a normal modal. */
  layoutId,
}) {
  const panelRef = useRef(null);
  // Close is animated before it actually unmounts: requestClose plays the
  // exit transition on this component itself, and only calls the real
  // `onClose` (which the parent uses to stop rendering <Modal>) once that
  // finishes — so every call site gets a real close animation for free,
  // with no <AnimatePresence> wrapper needed at 15+ call sites.
  const [closing, setClosing] = useState(false);
  const requestClose = useCallback(() => setClosing(true), []);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    const first = panel?.querySelector(FOCUSABLE);
    (first || panel)?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        requestClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [requestClose]);

  const overlayPosition =
    fullscreen && fullscreenInsetLeft
      ? {
          top: 0,
          right: 0,
          bottom: 0,
          left: typeof fullscreenInsetLeft === "number" ? `${fullscreenInsetLeft}px` : fullscreenInsetLeft,
        }
      : { inset: 0 };

  const panelStyle = fullscreen
    ? {
        background: C.glass,
        backdropFilter: "blur(24px)",
        border: `1px solid ${C.bord}`,
        borderRadius: RADIUS.xl,
        padding: "18px",
        width: "100%",
        maxWidth: "100%",
        height: "calc(100dvh - 16px)",
        maxHeight: "calc(100dvh - 16px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        boxShadow: SHADOW.lg,
      }
    : {
        background: C.glass,
        backdropFilter: "blur(24px)",
        border: `1px solid ${C.bord}`,
        borderRadius: RADIUS.xl,
        padding: "26px",
        width: "100%",
        maxWidth: "540px",
        maxHeight: "85vh",
        overflowY: "auto",
        boxShadow: SHADOW.lg,
      };

  return (
    <motion.div
      onClick={requestClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: closing ? 0.16 : 0.22, ease: EASE_EXPO }}
      onAnimationComplete={() => {
        if (closing) onClose?.();
      }}
      style={{
        position: "fixed",
        ...overlayPosition,
        background: "rgba(6,5,4,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: fullscreen ? "8px" : "20px",
      }}
    >
      <motion.div
        ref={panelRef}
        layoutId={layoutId}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: closing ? 0 : 1, scale: closing ? 0.96 : 1, y: closing ? 6 : 0 }}
        transition={SPRING_SOFT}
        style={panelStyle}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: fullscreen ? "14px" : "22px",
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: "18px", minWidth: 0, color: C.text }}>
            {title}
          </div>
          <motion.button
            type="button"
            onClick={requestClose}
            aria-label="Close dialog"
            whileHover={{ backgroundColor: C.high, color: C.text }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: "none",
              border: "none",
              color: C.mut,
              cursor: "pointer",
              display: "flex",
              padding: "6px",
              borderRadius: RADIUS.sm,
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </motion.button>
        </div>
        {fullscreen ? (
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {children}
          </div>
        ) : (
          children
        )}
      </motion.div>
    </motion.div>
  );
});

export const Cal = memo(function Cal({
  activeDates,
  selectedDate,
  onSelect,
  calDate,
  setCalDate,
  todayStr,
  dotColor = C.acc,
}) {
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const label = calDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const set = new Set(activeDates);
  const selectedTextColor = dotColor === C.acc ? C.onAccent : "#fff";

  return (
    <div style={{ background: C.high, borderRadius: RADIUS.lg, padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <motion.button
          type="button"
          onClick={() => setCalDate(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          whileHover={{ backgroundColor: C.higher, color: C.text }}
          whileTap={{ scale: 0.9 }}
          style={navArrowStyle}
        >
          <ChevronLeft size={16} />
        </motion.button>
        <span style={{ fontSize: "12.5px", fontWeight: 700 }} aria-live="polite">
          {label}
        </span>
        <motion.button
          type="button"
          onClick={() => setCalDate(new Date(year, month + 1, 1))}
          aria-label="Next month"
          whileHover={{ backgroundColor: C.higher, color: C.text }}
          whileTap={{ scale: 0.9 }}
          style={navArrowStyle}
        >
          <ChevronRight size={16} />
        </motion.button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "3px", textAlign: "center" }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} aria-hidden="true" style={{ color: C.mut, fontSize: "10px", fontWeight: 600, padding: "3px 0" }}>
            {d[0]}
          </div>
        ))}
        {Array.from({ length: first }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const active = set.has(ds);
          const isTod = ds === todayStr;
          const isSel = ds === selectedDate;
          return (
            <motion.button
              key={ds}
              type="button"
              onClick={() => onSelect(ds)}
              aria-pressed={isSel}
              aria-current={isTod ? "date" : undefined}
              aria-label={`${new Date(year, month, day).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}${active ? " — has entries" : ""}`}
              whileHover={isSel ? undefined : { backgroundColor: C.higher, color: C.text }}
              whileTap={{ scale: 0.88 }}
              transition={SPRING}
              style={{
                width: "27px",
                height: "27px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: RADIUS.sm,
                border: "none",
                margin: "1px auto",
                fontSize: "11px",
                fontFamily: "inherit",
                cursor: "pointer",
                background: isSel ? dotColor : active ? `${dotColor}22` : isTod ? C.bordStrong : "transparent",
                color: isSel ? selectedTextColor : active ? dotColor : isTod ? C.text : C.mut,
                fontWeight: active || isTod ? 700 : 400,
              }}
            >
              {day}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});

export const NavItem = memo(function NavItem({ label, active, onClick, dot, sub, icon }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      whileHover={active ? undefined : { backgroundColor: C.high }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING}
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: sub ? "7px 11px" : "9px 11px",
        borderRadius: RADIUS.md,
        border: "none",
        background: "transparent",
        color: active ? C.acc : C.mut,
        fontFamily: "inherit",
        fontSize: sub ? "12.5px" : "13.5px",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        textAlign: "left",
        marginBottom: "2px",
        overflow: "hidden",
      }}
    >
      {active && (
        <motion.span
          layoutId="nav-active-pill"
          transition={SPRING}
          style={{ position: "absolute", inset: 0, background: C.accBg, borderRadius: RADIUS.md }}
        />
      )}
      {icon && (
        <span aria-hidden="true" style={{ position: "relative", zIndex: 1, display: "flex", flexShrink: 0 }}>
          {icon}
        </span>
      )}
      <span style={{ flex: 1, position: "relative", zIndex: 1 }}>{label}</span>
      {dot && (
        <span
          title="Logged today"
          style={{
            position: "relative",
            zIndex: 1,
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: C.suc,
            flexShrink: 0,
          }}
        />
      )}
    </motion.button>
  );
});

export const NavGroup = memo(function NavGroup({ label, open, onClick, dot, icon }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      whileHover={{ backgroundColor: C.high }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "9px 11px",
        borderRadius: RADIUS.md,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        marginBottom: "2px",
        fontFamily: "inherit",
      }}
    >
      {icon && (
        <span aria-hidden="true" style={{ display: "flex", flexShrink: 0, color: C.acc }}>
          {icon}
        </span>
      )}
      <span style={{ flex: 1, color: C.acc, fontSize: "13.5px", fontWeight: 700, textAlign: "left" }}>{label}</span>
      {dot && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.suc }} />}
      <motion.span
        aria-hidden="true"
        animate={{ rotate: open ? 90 : 0 }}
        transition={SPRING}
        style={{ color: C.mut, display: "inline-flex" }}
      >
        <ChevronRight size={14} />
      </motion.span>
    </motion.button>
  );
});

export const Divider = memo(function Divider() {
  return <div style={{ height: "1px", background: C.bord, margin: "7px 0" }} />;
});

const ToastItem = memo(function ToastItem({ toast, onDismiss }) {
  const isError = toast.kind === "error";
  const dismiss = useCallback(() => onDismiss(toast.id), [onDismiss, toast.id]);

  useEffect(() => {
    if (isError) return;
    const id = setTimeout(dismiss, 3500);
    return () => clearTimeout(id);
  }, [isError, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
      transition={SPRING}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        maxWidth: "min(560px, calc(100vw - 32px))",
        padding: "13px 15px",
        borderRadius: RADIUS.md,
        background: isError ? "#2A1210" : C.glass,
        backdropFilter: "blur(16px)",
        border: `1px solid ${isError ? "rgba(226,104,90,0.4)" : C.bord}`,
        color: isError ? C.dan : C.text,
        fontSize: "13px",
        lineHeight: 1.5,
        boxShadow: SHADOW.lg,
      }}
    >
      <span aria-hidden="true" style={{ flexShrink: 0, display: "flex", marginTop: "1px" }}>
        {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      </span>
      <span style={{ flex: 1 }}>{toast.msg}</span>
      <motion.button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss message"
        whileHover={{ opacity: 1 }}
        whileTap={{ scale: 0.85 }}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          opacity: 0.75,
          cursor: "pointer",
          display: "flex",
          padding: "2px",
          borderRadius: RADIUS.sm,
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </motion.button>
    </motion.div>
  );
});

/**
 * Stack of transient status messages (errors persist until dismissed). A
 * single `aria-live` region wraps the whole stack — individual toasts don't
 * carry their own live region, since several simultaneous ones would
 * compete for a screen reader's attention instead of announcing in order.
 */
export const ToastStack = memo(function ToastStack({ toasts, onDismiss }) {
  if (!toasts) return null;
  const hasError = toasts.some((t) => t.kind === "error");
  return (
    <div
      aria-live={hasError ? "assertive" : "polite"}
      aria-atomic="false"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "24px",
        transform: "translateX(-50%)",
        zIndex: 1200,
        display: "flex",
        flexDirection: "column-reverse",
        gap: "10px",
        width: "max-content",
        maxWidth: "min(560px, calc(100vw - 32px))",
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
});

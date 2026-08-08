import React, { memo, useCallback, useEffect, useRef } from "react";
import { C, MONO } from "@/ui/theme";

export const Badge = memo(function Badge({ children, color = "mut" }) {
  const map = {
    acc: [C.accBg, C.acc],
    suc: [C.sucBg, C.suc],
    war: [C.warBg, C.war],
    dan: [C.danBg, C.dan],
    mut: [C.bord, C.mut],
    blue: [C.blueBg, C.blue],
    pink: [C.pinkBg, C.pink],
  };
  const [bg, col] = map[color] || map.mut;
  return (
    <span
      style={{
        background: bg,
        color: col,
        padding: "2px 7px",
        borderRadius: "4px",
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
}) {
  const vs = {
    primary: { bg: C.acc, color: "#fff", border: "none" },
    ghost: { bg: "transparent", color: C.text, border: `1px solid ${C.bord}` },
    success: {
      bg: C.sucBg,
      color: C.suc,
      border: "1px solid rgba(61,214,163,0.25)",
    },
    danger: {
      bg: C.danBg,
      color: C.dan,
      border: "1px solid rgba(255,94,94,0.25)",
    },
    accent: { bg: C.accBg, color: C.acc, border: `1px solid ${C.accBord}` },
  };
  const ss = { sm: "5px 11px", md: "8px 16px", lg: "11px 22px" };
  const fs = { sm: "11px", md: "13px", lg: "14px" };
  const v = vs[variant] || vs.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      style={{
        background: v.bg,
        color: v.color,
        border: v.border,
        padding: ss[size],
        fontSize: fs[size],
        fontWeight: 600,
        borderRadius: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        width: full ? "100%" : "auto",
        justifyContent: "center",
        whiteSpace: "nowrap",
        transition: "opacity 0.15s",
      }}
    >
      {children}
    </button>
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
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        background: "transparent",
        border: bordered ? `1px solid ${C.bord}` : "none",
        borderRadius: "6px",
        color: danger ? C.dan : C.mut,
        cursor: "pointer",
        fontSize: "11px",
        lineHeight: 1.4,
        padding: bordered ? "3px 7px" : "2px 4px",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
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
      style={{
        background: C.high,
        border: `1px solid ${C.bord}`,
        borderRadius: "8px",
        padding: "9px 12px",
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
      style={{
        background: C.high,
        border: `1px solid ${C.bord}`,
        borderRadius: "8px",
        padding: "9px 12px",
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
      style={{
        background: C.high,
        border: `1px solid ${C.bord}`,
        borderRadius: "8px",
        padding: "9px 12px",
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
            marginBottom: "4px",
          }}
        >
          {label}
        </label>
      )}
      {children}
      {hint && (
        <div style={{ color: C.mut, fontSize: "11px", marginTop: "2px" }}>
          {hint}
        </div>
      )}
    </div>
  );
});

export const Card = memo(function Card({ children, style = {}, onClick, label }) {
  const base = {
    background: C.surf,
    border: `1px solid ${C.bord}`,
    borderRadius: "12px",
    padding: "20px",
    ...style,
  };
  if (!onClick) return <div style={base}>{children}</div>;
  // Cards can contain their own nested buttons/links (e.g. a delete icon, an
  // outbound link), so this can't be a real <button> — nesting interactive
  // elements inside one is invalid HTML and browsers will mangle it. Instead
  // it's a div made keyboard-operable directly: focusable, with a role, and
  // Enter/Space wired to activate like a native button would.
  return (
    <div
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
      style={{ ...base, cursor: "pointer" }}
    >
      {children}
    </div>
  );
});

export const SLabel = memo(function SLabel({ children, style = {} }) {
  return (
    <div
      style={{
        color: C.mut,
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: "10px",
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
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "28px",
      }}
    >
      <h2
        style={{
          fontSize: "22px",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {right && (
        <div
          style={{
            display: "flex",
            gap: "6px",
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

export const EmptyState = memo(function EmptyState({ children, pad = "40px" }) {
  return (
    <div
      style={{
        color: C.mut,
        textAlign: "center",
        padding: pad,
        fontSize: "13px",
      }}
    >
      {children}
    </div>
  );
});

export const Stat = memo(function Stat({ value, label, color, size = "26px" }) {
  return (
    <Card style={{ padding: "14px", textAlign: "center" }}>
      <div
        style={{
          fontSize: size,
          fontWeight: 800,
          color: color || C.text,
          fontFamily: MONO,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div style={{ color: C.mut, fontSize: "11px", marginTop: "4px" }}>
        {label}
      </div>
    </Card>
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
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    // Move focus into the dialog so keyboard and screen-reader users land here.
    const first = panel?.querySelector(FOCUSABLE);
    (first || panel)?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      // Keep Tab inside the dialog.
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
    // Stop the page behind the dialog from scrolling.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose]);

  const overlayPosition =
    fullscreen && fullscreenInsetLeft
      ? {
          top: 0,
          right: 0,
          bottom: 0,
          left:
            typeof fullscreenInsetLeft === "number"
              ? `${fullscreenInsetLeft}px`
              : fullscreenInsetLeft,
        }
      : { inset: 0 };

  const panelStyle = fullscreen
    ? {
        background: C.surf,
        border: `1px solid ${C.bord}`,
        borderRadius: "14px",
        padding: "16px",
        width: "100%",
        maxWidth: "100%",
        height: "calc(100dvh - 16px)",
        maxHeight: "calc(100dvh - 16px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }
    : {
        background: C.surf,
        border: `1px solid ${C.bord}`,
        borderRadius: "14px",
        padding: "24px",
        width: "100%",
        maxWidth: "540px",
        maxHeight: "85vh",
        overflowY: "auto",
      };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        ...overlayPosition,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: fullscreen ? "8px" : "20px",
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={panelStyle}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: fullscreen ? "12px" : "20px",
            flexShrink: 0,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "16px", minWidth: 0 }}>
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: "none",
              border: "none",
              color: C.mut,
              cursor: "pointer",
              fontSize: "22px",
              lineHeight: 1,
              padding: "0 2px",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
        {fullscreen ? (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
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

  const navBtn = {
    background: "none",
    border: "none",
    color: C.mut,
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: 1,
    padding: "2px 6px",
    fontFamily: "inherit",
  };

  return (
    <div style={{ background: C.high, borderRadius: "10px", padding: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => setCalDate(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          style={navBtn}
        >
          ‹
        </button>
        <span style={{ fontSize: "12px", fontWeight: 700 }} aria-live="polite">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setCalDate(new Date(year, month + 1, 1))}
          aria-label="Next month"
          style={navBtn}
        >
          ›
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "2px",
          textAlign: "center",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            aria-hidden="true"
            style={{
              color: C.mut,
              fontSize: "10px",
              fontWeight: 600,
              padding: "3px 0",
            }}
          >
            {d[0]}
          </div>
        ))}
        {Array.from({ length: first }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          const active = set.has(ds);
          const isTod = ds === todayStr;
          const isSel = ds === selectedDate;
          return (
            <button
              key={ds}
              type="button"
              onClick={() => onSelect(ds)}
              aria-pressed={isSel}
              aria-current={isTod ? "date" : undefined}
              aria-label={`${new Date(year, month, day).toLocaleDateString(
                "en-US",
                { weekday: "long", month: "long", day: "numeric" }
              )}${active ? " — has entries" : ""}`}
              style={{
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                border: "none",
                margin: "1px auto",
                fontSize: "11px",
                fontFamily: "inherit",
                cursor: "pointer",
                background: isSel
                  ? dotColor
                  : active
                  ? `${dotColor}22`
                  : isTod
                  ? C.bord
                  : "transparent",
                color: isSel
                  ? "#fff"
                  : active
                  ? dotColor
                  : isTod
                  ? C.text
                  : C.mut,
                fontWeight: active || isTod ? 700 : 400,
                transition: "background 0.1s, color 0.1s",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export const NavItem = memo(function NavItem({
  label,
  active,
  onClick,
  dot,
  sub,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: sub ? "6px 10px" : "8px 10px",
        borderRadius: "7px",
        background: active ? C.accBg : "transparent",
        border: "none",
        color: active ? C.acc : C.mut,
        fontFamily: "inherit",
        fontSize: sub ? "12px" : "13px",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        textAlign: "left",
        marginBottom: "1px",
      }}
    >
      <span style={{ flex: 1 }}>{label}</span>
      {dot && (
        <span
          title="Logged today"
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: C.suc,
            flexShrink: 0,
          }}
        />
      )}
    </button>
  );
});

export const NavGroup = memo(function NavGroup({ label, open, onClick, dot }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 10px",
        borderRadius: "7px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        marginBottom: "1px",
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          flex: 1,
          color: C.acc,
          fontSize: "13px",
          fontWeight: 700,
          textAlign: "left",
        }}
      >
        {label}
      </span>
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: C.suc,
          }}
        />
      )}
      <span
        aria-hidden="true"
        style={{
          color: C.mut,
          fontSize: "11px",
          transform: open ? "rotate(90deg)" : "none",
          display: "inline-block",
          transition: "transform 0.2s",
        }}
      >
        ›
      </span>
    </button>
  );
});

export const Divider = memo(function Divider() {
  return <div style={{ height: "1px", background: C.bord, margin: "6px 0" }} />;
});

/** Transient status message. Errors persist until dismissed. */
export const Toast = memo(function Toast({ toast, onDismiss }) {
  const isError = toast?.kind === "error";
  const dismiss = useCallback(() => onDismiss?.(), [onDismiss]);

  useEffect(() => {
    if (!toast || isError) return;
    const id = setTimeout(dismiss, 3000);
    return () => clearTimeout(id);
  }, [toast, isError, dismiss]);

  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live={isError ? "assertive" : "polite"}
      style={{
        position: "fixed",
        left: "50%",
        bottom: "24px",
        transform: "translateX(-50%)",
        zIndex: 1200,
        maxWidth: "min(560px, calc(100vw - 32px))",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "10px",
        background: isError ? "#2A1216" : C.high,
        border: `1px solid ${isError ? "rgba(255,94,94,0.45)" : C.bord}`,
        color: isError ? C.dan : C.text,
        fontSize: "13px",
        lineHeight: 1.5,
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
      }}
    >
      <span style={{ flex: 1 }}>{toast.msg}</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss message"
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          opacity: 0.7,
          cursor: "pointer",
          fontSize: "16px",
          lineHeight: 1,
          fontFamily: "inherit",
        }}
      >
        ×
      </button>
    </div>
  );
});

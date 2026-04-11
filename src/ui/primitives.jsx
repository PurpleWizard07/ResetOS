import React, { memo } from "react";
import { C } from "@/ui/theme";

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
    accent: {
      bg: C.accBg,
      color: C.acc,
      border: `1px solid ${C.accBord}`,
    },
  };
  const ss = { sm: "5px 11px", md: "8px 16px", lg: "11px 22px" };
  const fs = { sm: "11px", md: "13px", lg: "14px" };
  const v = vs[variant] || vs.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
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
        outline: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        width: full ? "100%" : "auto",
        justifyContent: "center",
        transition: "opacity 0.15s",
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
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: C.high,
        border: `1px solid ${C.bord}`,
        borderRadius: "8px",
        padding: "9px 12px",
        color: C.text,
        fontFamily: "inherit",
        fontSize: "13px",
        outline: "none",
        width: "100%",
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
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        background: C.high,
        border: `1px solid ${C.bord}`,
        borderRadius: "8px",
        padding: "9px 12px",
        color: C.text,
        fontFamily: "inherit",
        fontSize: "13px",
        outline: "none",
        width: "100%",
        resize: "vertical",
        lineHeight: 1.6,
      }}
    />
  );
});

export const Sel = memo(function Sel({ value, onChange, options, style = {} }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: C.high,
        border: `1px solid ${C.bord}`,
        borderRadius: "8px",
        padding: "9px 12px",
        color: C.text,
        fontFamily: "inherit",
        fontSize: "13px",
        outline: "none",
        width: "100%",
        cursor: "pointer",
        ...style,
      }}
    >
      {options.map((o) => (
        <option key={o.v || o} value={o.v || o}>
          {o.l || o}
        </option>
      ))}
    </select>
  );
});

export const Card = memo(function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.surf,
        border: `1px solid ${C.bord}`,
        borderRadius: "12px",
        padding: "20px",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
});

export const SLabel = memo(function SLabel({ children }) {
  return (
    <div
      style={{
        color: C.mut,
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: "10px",
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
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {right}
        </div>
      )}
    </div>
  );
});

export const Modal = memo(function Modal({ children, onClose, title, fullscreen }) {
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
        boxSizing: "border-box",
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
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: fullscreen ? "8px" : "20px",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={panelStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: fullscreen ? "12px" : "20px",
            flexShrink: 0,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "16px" }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: C.mut,
              cursor: "pointer",
              fontSize: "22px",
              lineHeight: 1,
              padding: "0 2px",
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
  const year = calDate.getFullYear(),
    month = calDate.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const label = calDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const set = new Set(activeDates);
  return (
    <div
      style={{
        background: C.high,
        borderRadius: "10px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <button
          onClick={() => setCalDate(new Date(year, month - 1, 1))}
          style={{
            background: "none",
            border: "none",
            color: C.mut,
            cursor: "pointer",
            fontSize: "18px",
            lineHeight: 1,
            padding: "0 4px",
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: "12px", fontWeight: 700 }}>{label}</span>
        <button
          onClick={() => setCalDate(new Date(year, month + 1, 1))}
          style={{
            background: "none",
            border: "none",
            color: C.mut,
            cursor: "pointer",
            fontSize: "18px",
            lineHeight: 1,
            padding: "0 4px",
          }}
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
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            style={{
              color: C.mut,
              fontSize: "10px",
              fontWeight: 600,
              padding: "3px 0",
            }}
          >
            {d}
          </div>
        ))}
        {Array.from({ length: first }).map((_, i) => (
          <div key={"e" + i} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const ds = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          const active = set.has(ds),
            isTod = ds === todayStr,
            isSel = ds === selectedDate;
          return (
            <div
              key={day}
              onClick={() => onSelect(ds)}
              style={{
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                margin: "1px auto",
                fontSize: "11px",
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
                transition: "all 0.1s",
              }}
            >
              {day}
            </div>
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
      onClick={onClick}
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
        transition: "all 0.1s",
      }}
    >
      <span style={{ flex: 1 }}>{label}</span>
      {dot && (
        <span
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
      onClick={onClick}
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
  return (
    <div
      style={{
        height: "1px",
        background: C.bord,
        margin: "6px 0",
      }}
    />
  );
});


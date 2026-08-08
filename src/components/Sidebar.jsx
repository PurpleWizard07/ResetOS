"use client";
import { motion } from "motion/react";
import { Download, LogOut, Search } from "lucide-react";
import { Divider, NavGroup, NavItem, SLabel } from "@/ui/primitives";
import { C, MONO, RADIUS, SHADOW, SPRING } from "@/ui/theme";
import { NAV_ITEMS, NAV_GROUPS, WELLNESS_VIEWS, PREP_VIEWS } from "@/lib/navConfig";

export const SIDEBAR_WIDTH_PX = 216;
const SIDEBAR_MARGIN_PX = 14;
const ICON_SIZE = 15;

const byId = (id) => NAV_ITEMS.find((n) => n.id === id);
const inGroup = (group) => NAV_ITEMS.filter((n) => n.group === group);

export default function Sidebar({
  view,
  go,
  isMobile,
  mobileMenuOpen,
  wellnessOpen,
  setWellnessOpen,
  lpaOpen,
  setLpaOpen,
  dots,
  streaks,
  onSignOut,
  onOpenPalette,
  onExportData,
}) {
  const PrepIcon = NAV_GROUPS["40+ LPA"].icon;

  const item = (id, sub) => {
    const n = byId(id);
    const Icon = n.icon;
    return (
      <NavItem
        key={id}
        label={n.label}
        icon={<Icon size={ICON_SIZE} />}
        active={view === id}
        onClick={() => go(id)}
        dot={dots[id]}
        sub={sub}
      />
    );
  };

  return (
    <div
      style={{
        width: `${SIDEBAR_WIDTH_PX}px`,
        minWidth: `${SIDEBAR_WIDTH_PX}px`,
        background: C.glass,
        backdropFilter: "blur(20px)",
        border: `1px solid ${C.bord}`,
        borderRadius: RADIUS.xl,
        boxShadow: SHADOW.lg,
        padding: "20px 12px",
        display: "flex",
        flexDirection: "column",
        position: isMobile ? "fixed" : "sticky",
        top: isMobile ? 0 : `${SIDEBAR_MARGIN_PX}px`,
        margin: isMobile ? 0 : `${SIDEBAR_MARGIN_PX}px`,
        height: isMobile ? "100vh" : `calc(100vh - ${SIDEBAR_MARGIN_PX * 2}px)`,
        overflowY: "auto",
        zIndex: 1001,
        ...(isMobile
          ? {
              left: mobileMenuOpen ? 0 : `-${SIDEBAR_WIDTH_PX + 20}px`,
              borderRadius: `0 ${RADIUS.xl}px ${RADIUS.xl}px 0`,
              transition: "left 0.28s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: mobileMenuOpen ? "10px 0 40px rgba(0,0,0,0.5)" : undefined,
            }
          : {}),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px 22px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            background: C.accGrad,
            borderRadius: RADIUS.sm,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: C.onAccent,
            fontSize: "14px",
            boxShadow: SHADOW.glow,
          }}
        >
          L
        </div>
        <span style={{ fontWeight: 600, fontSize: "15px", letterSpacing: "-0.02em", fontFamily: "var(--font-fraunces)" }}>
          LifeOS
        </span>
      </div>

      <motion.button
        type="button"
        onClick={onOpenPalette}
        whileHover={{ backgroundColor: C.high, borderColor: C.bordStrong }}
        whileTap={{ scale: 0.97 }}
        transition={SPRING}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          background: C.high,
          border: `1px solid ${C.bord}`,
          borderRadius: RADIUS.md,
          color: C.mut,
          fontFamily: "inherit",
          fontSize: "12px",
          padding: "8px 10px",
          marginBottom: "14px",
          cursor: "pointer",
        }}
      >
        <Search size={14} aria-hidden="true" />
        <span style={{ flex: 1, textAlign: "left" }}>Search</span>
        <kbd style={{ fontSize: "10px", border: `1px solid ${C.bord}`, borderRadius: RADIUS.sm, padding: "1px 5px" }}>
          Ctrl K
        </kbd>
      </motion.button>

      {item("dashboard")}
      <Divider />
      <NavGroup
        label="Wellness"
        icon={<NAV_GROUPS.Wellness.icon size={ICON_SIZE} />}
        open={wellnessOpen}
        onClick={() => setWellnessOpen((o) => !o)}
        dot={WELLNESS_VIEWS.some((v) => dots[v])}
      />
      {wellnessOpen && (
        <div style={{ marginLeft: "9px", borderLeft: `1px solid ${C.bord}`, paddingLeft: "9px", marginBottom: "4px" }}>
          {inGroup("Wellness").map((n) => item(n.id, true))}
        </div>
      )}
      {item("strength")}
      <Divider />
      <NavGroup
        label="40+ LPA"
        icon={<PrepIcon size={ICON_SIZE} />}
        open={lpaOpen}
        onClick={() => setLpaOpen((o) => !o)}
        dot={PREP_VIEWS.some((v) => dots[v])}
      />
      {lpaOpen && (
        <div style={{ marginLeft: "9px", borderLeft: `1px solid ${C.bord}`, paddingLeft: "9px", marginBottom: "4px" }}>
          {inGroup("40+ LPA").map((n) => item(n.id, true))}
        </div>
      )}
      <Divider />
      {item("journal")}

      <div style={{ marginTop: "auto", borderTop: `1px solid ${C.bord}`, paddingTop: "14px" }}>
        <SLabel>Streaks</SLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          {streaks.map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "18px", color: s.c, fontFamily: MONO, lineHeight: 1 }}>{s.v}</div>
              <div style={{ color: C.mut, fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", marginTop: "3px", textTransform: "uppercase" }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <motion.button
            type="button"
            onClick={onExportData}
            whileHover={{ backgroundColor: C.high, borderColor: C.bordStrong, color: C.text }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: "transparent",
              border: `1px solid ${C.bord}`,
              borderRadius: RADIUS.md,
              color: C.mut,
              fontFamily: "inherit",
              fontSize: "11px",
              fontWeight: 600,
              padding: "8px 0",
              cursor: "pointer",
            }}
          >
            <Download size={13} aria-hidden="true" />
            Export data
          </motion.button>
          <motion.button
            type="button"
            onClick={onSignOut}
            whileHover={{ backgroundColor: C.high, borderColor: C.bordStrong, color: C.text }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: "transparent",
              border: `1px solid ${C.bord}`,
              borderRadius: RADIUS.md,
              color: C.mut,
              fontFamily: "inherit",
              fontSize: "11px",
              fontWeight: 600,
              padding: "8px 0",
              cursor: "pointer",
            }}
          >
            <LogOut size={13} aria-hidden="true" />
            Sign out
          </motion.button>
        </div>
      </div>
    </div>
  );
}

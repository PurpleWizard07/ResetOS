"use client";
import { Divider, NavGroup, NavItem, SLabel } from "@/ui/primitives";
import { C, MONO } from "@/ui/theme";

export const SIDEBAR_WIDTH_PX = 210;

const WELLNESS_VIEWS = ["water", "weight", "sleep", "cracker", "vitamin", "skin"];
const PREP_VIEWS = ["dsa", "fundamentals", "systemdesign", "misc", "interview", "companies"];

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
}) {
  return (
    <div
      style={{
        width: `${SIDEBAR_WIDTH_PX}px`,
        minWidth: `${SIDEBAR_WIDTH_PX}px`,
        background: C.surf,
        borderRight: `1px solid ${C.bord}`,
        padding: "20px 10px",
        display: "flex",
        flexDirection: "column",
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        zIndex: 1001,
        ...(isMobile
          ? {
              left: mobileMenuOpen ? 0 : `-${SIDEBAR_WIDTH_PX}px`,
              transition: "left 0.2s ease",
              boxShadow: mobileMenuOpen ? "4px 0 20px rgba(0,0,0,0.3)" : undefined,
            }
          : {}),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "0 8px 22px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            background: C.acc,
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            color: "#fff",
            fontSize: "14px",
          }}
        >
          L
        </div>
        <span style={{ fontWeight: 800, fontSize: "15px", letterSpacing: "-0.03em" }}>LifeOS</span>
      </div>

      <NavItem label="Dashboard" active={view === "dashboard"} onClick={() => go("dashboard")} />
      <Divider />
      <NavGroup
        label="Wellness"
        open={wellnessOpen}
        onClick={() => setWellnessOpen((o) => !o)}
        dot={WELLNESS_VIEWS.some((v) => dots[v])}
      />
      {wellnessOpen && (
        <div style={{ marginLeft: "8px", borderLeft: `1px solid ${C.bord}`, paddingLeft: "8px", marginBottom: "4px" }}>
          <NavItem label="Water" active={view === "water"} onClick={() => go("water")} dot={dots.water} sub />
          <NavItem label="Weight" active={view === "weight"} onClick={() => go("weight")} dot={dots.weight} sub />
          <NavItem label="Sleep" active={view === "sleep"} onClick={() => go("sleep")} dot={dots.sleep} sub />
          <NavItem label="Cracker" active={view === "cracker"} onClick={() => go("cracker")} dot={dots.cracker} sub />
          <NavItem label="Vitamins" active={view === "vitamin"} onClick={() => go("vitamin")} sub />
          <NavItem label="Skin" active={view === "skin"} onClick={() => go("skin")} sub />
        </div>
      )}
      <NavItem label="Strength" active={view === "strength"} onClick={() => go("strength")} dot={dots.strength} />
      <Divider />
      <NavGroup label="40+ LPA" open={lpaOpen} onClick={() => setLpaOpen((o) => !o)} dot={PREP_VIEWS.some((v) => dots[v])} />
      {lpaOpen && (
        <div style={{ marginLeft: "8px", borderLeft: `1px solid ${C.bord}`, paddingLeft: "8px", marginBottom: "4px" }}>
          <NavItem label="DSA" active={view === "dsa"} onClick={() => go("dsa")} dot={dots.dsa} sub />
          <NavItem label="Fundamentals" active={view === "fundamentals"} onClick={() => go("fundamentals")} sub />
          <NavItem label="System Design" active={view === "systemdesign"} onClick={() => go("systemdesign")} sub />
          <NavItem label="Miscellaneous" active={view === "misc"} onClick={() => go("misc")} sub />
          <NavItem label="Interview" active={view === "interview"} onClick={() => go("interview")} dot={dots.interview} sub />
          <NavItem label="Companies" active={view === "companies"} onClick={() => go("companies")} sub />
        </div>
      )}
      <Divider />
      <NavItem label="Journal" active={view === "journal"} onClick={() => go("journal")} dot={dots.journal} />

      <div style={{ marginTop: "auto", borderTop: `1px solid ${C.bord}`, paddingTop: "14px" }}>
        <SLabel>Streaks</SLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
          {streaks.map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: "18px", color: s.c, fontFamily: MONO, lineHeight: 1 }}>{s.v}</div>
              <div style={{ color: C.mut, fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", marginTop: "2px", textTransform: "uppercase" }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onSignOut}
          style={{
            width: "100%",
            background: "transparent",
            border: `1px solid ${C.bord}`,
            borderRadius: "7px",
            color: C.mut,
            fontFamily: "inherit",
            fontSize: "11px",
            fontWeight: 600,
            padding: "7px 0",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

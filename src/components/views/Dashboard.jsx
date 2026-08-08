"use client";
import { Card, Btn, SLabel, Stat } from "@/ui/primitives";
import { C } from "@/ui/theme";

export default function Dashboard({ isMobile, metrics, streaks, go, quickAddWater }) {
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning." : h < 17 ? "Good afternoon." : "Good evening.";
  const {
    waterPct,
    todayWater,
    todaySleepHours,
    todayDSA,
    todayJournal,
    todayWorkout,
    interviewsToday,
    offers,
    applied,
  } = metrics;

  const today = [
    { label: "Water", done: waterPct >= 100, value: `${waterPct}% · ${todayWater}ml`, nav: "water" },
    {
      label: "Sleep",
      done: todaySleepHours > 0,
      value: todaySleepHours ? `${todaySleepHours.toFixed(1)}h last night` : "Not logged",
      nav: "sleep",
    },
    { label: "DSA", done: todayDSA > 0, value: `${todayDSA} solved today`, nav: "dsa" },
    { label: "Journal", done: todayJournal, value: todayJournal ? "Written" : "Not written", nav: "journal" },
    { label: "Strength", done: todayWorkout, value: todayWorkout ? "Logged" : "Not logged", nav: "strength" },
  ];
  const dsaTodayLabel = todayDSA === 0 ? "None yet" : todayDSA === 1 ? "1 problem" : `${todayDSA} problems`;
  const journalTodayLabel = todayJournal ? "Written" : "Not yet";

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            color: C.mut,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <h1 style={{ fontSize: isMobile ? "24px" : "30px", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
          {greet}
        </h1>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <SLabel>Streaks</SLabel>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: "10px" }}>
          {streaks.map((s) => (
            <Stat key={s.l} value={s.v} label={s.l} color={s.c} size="32px" />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <SLabel>Today</SLabel>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: "10px" }}>
          {today.map((s) => (
            <Card
              key={s.label}
              onClick={() => go(s.nav)}
              label={`${s.label}: ${s.value}`}
              style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  flexShrink: 0,
                  background: s.done ? C.sucBg : C.bord,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: s.done ? C.suc : C.mut,
                  fontWeight: 800,
                  fontSize: "14px",
                }}
              >
                {s.done ? "✓" : "·"}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: s.done ? C.text : C.mut }}>{s.label}</div>
                <div style={{ fontSize: "12px", color: s.done ? C.suc : C.mut, marginTop: "1px" }}>{s.value}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <SLabel>Career snapshot</SLabel>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: "10px" }}>
          <Stat value={interviewsToday} label="Interviews today" />
          <Stat value={applied} label="Active pipelines" />
          <Stat value={offers} label="Offers" color={offers > 0 ? C.suc : C.text} />
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <SLabel>Study focus</SLabel>
        <Card
          style={{
            padding: "14px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1.2fr 1fr",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: C.mut, fontSize: "11px", marginBottom: "4px" }}>DSA today</div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>{dsaTodayLabel}</div>
          </div>
          <div>
            <div style={{ color: C.mut, fontSize: "11px", marginBottom: "4px" }}>Journal</div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>{journalTodayLabel}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Btn size="sm" variant="ghost" onClick={() => go("dsa")}>
              Go to prep →
            </Btn>
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: "4px" }}>
        <SLabel>Quick Add</SLabel>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Btn onClick={() => quickAddWater(300)} variant="accent">
            + 300ml
          </Btn>
          <Btn onClick={() => quickAddWater(500)} variant="accent">
            + 500ml
          </Btn>
          <Btn onClick={() => go("sleep")} variant="ghost">
            + Sleep
          </Btn>
          <Btn onClick={() => go("journal")} variant="ghost">
            + Journal
          </Btn>
          <Btn onClick={() => go("dsa")} variant="ghost">
            + DSA
          </Btn>
          <Btn onClick={() => go("strength")} variant="ghost">
            + Workout
          </Btn>
        </div>
      </div>
    </div>
  );
}

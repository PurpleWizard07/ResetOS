"use client";
import { motion } from "motion/react";
import { Code2, Droplet, Dumbbell, Moon, NotebookPen } from "lucide-react";
import { Btn, Card, Reveal, RevealItem, SLabel, Skeleton, Stat } from "@/ui/primitives";
import { C, RADIUS, SPRING } from "@/ui/theme";

const TODAY_COLOR = { Water: C.blue, Sleep: C.pink, DSA: C.acc, Journal: C.war, Strength: C.suc };

export default function Dashboard({ isMobile, metrics, streaks, go, quickAddWater, loading }) {
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
    { label: "Water", done: waterPct >= 100, value: `${waterPct}% · ${todayWater}ml`, nav: "water", icon: Droplet, area: "water" },
    {
      label: "Sleep",
      done: todaySleepHours > 0,
      value: todaySleepHours ? `${todaySleepHours.toFixed(1)}h last night` : "Not logged",
      nav: "sleep",
      icon: Moon,
      area: "sleep",
    },
    { label: "DSA", done: todayDSA > 0, value: `${todayDSA} solved today`, nav: "dsa", icon: Code2, area: "dsa" },
    {
      label: "Strength",
      done: todayWorkout,
      value: todayWorkout ? "Logged" : "Not logged",
      nav: "strength",
      icon: Dumbbell,
      area: "strength",
    },
    {
      label: "Journal",
      done: todayJournal,
      value: todayJournal ? "Written" : "Not written",
      nav: "journal",
      icon: NotebookPen,
      area: "journal",
    },
  ];
  const doneCount = today.filter((t) => t.done).length;
  const dsaTodayLabel = todayDSA === 0 ? "None yet" : todayDSA === 1 ? "1 problem" : `${todayDSA} problems`;
  const journalTodayLabel = todayJournal ? "Written" : "Not yet";

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
    gridTemplateAreas: isMobile
      ? undefined
      : `"hero hero water sleep" "hero hero dsa strength" "streaks streaks streaks journal" "career career career career"`,
    gap: "14px",
  };

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (loading) {
    return (
      <div style={gridStyle}>
        <Card style={{ gridArea: isMobile ? undefined : "hero", padding: "26px" }}>
          <Skeleton width="140px" height={11} style={{ marginBottom: "14px" }} />
          <Skeleton width="70%" height={34} style={{ marginBottom: "10px" }} />
          <Skeleton width="50%" height={13} />
        </Card>
        {["water", "sleep", "dsa", "strength"].map((a) => (
          <Card key={a} style={{ gridArea: isMobile ? undefined : a, padding: "18px" }}>
            <Skeleton width={34} height={34} radius={RADIUS.sm} style={{ marginBottom: "12px" }} />
            <Skeleton width="60%" height={12} style={{ marginBottom: "6px" }} />
            <Skeleton width="80%" height={11} />
          </Card>
        ))}
        <Card style={{ gridArea: isMobile ? undefined : "streaks", padding: "18px" }}>
          <Skeleton width="100%" height={40} />
        </Card>
        <Card style={{ gridArea: isMobile ? undefined : "journal", padding: "18px" }}>
          <Skeleton width="60%" height={12} style={{ marginBottom: "6px" }} />
          <Skeleton width="80%" height={11} />
        </Card>
        <Card style={{ gridArea: isMobile ? undefined : "career", padding: "18px" }}>
          <Skeleton width="100%" height={44} />
        </Card>
      </div>
    );
  }

  return (
    <Reveal style={gridStyle}>
      {/* Hero — greeting, a one-line "how's today going" summary, and the one
         quick action (water) that's a real write, not just navigation. */}
      <RevealItem style={{ gridArea: isMobile ? undefined : "hero" }}>
        <Card
          style={{
            padding: "28px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: `${C.heroGlow}, ${C.surf}`,
          }}
        >
          <div>
            <div style={{ color: C.mut, fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
              {dateLabel}
            </div>
            <h1
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: isMobile ? "28px" : "36px",
                fontWeight: 500,
                letterSpacing: "-0.01em",
                margin: 0,
                color: C.text,
              }}
            >
              {greet}
            </h1>
            <p style={{ color: C.mut, fontSize: "14px", marginTop: "10px" }}>
              {doneCount === 0
                ? `Nothing logged yet today — plenty of time.`
                : doneCount === today.length
                ? `All ${today.length} things done today. Well handled.`
                : `${doneCount} of ${today.length} things done today.`}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
            <Btn size="sm" onClick={() => quickAddWater(300)} variant="accent">
              + 300ml water
            </Btn>
            <Btn size="sm" onClick={() => quickAddWater(500)} variant="accent">
              + 500ml water
            </Btn>
          </div>
        </Card>
      </RevealItem>

      {today
        .filter((t) => t.label !== "Journal")
        .map((s) => {
          const Icon = s.icon;
          return (
            <RevealItem key={s.label} style={{ gridArea: isMobile ? undefined : s.area }}>
              <TodayTile s={s} Icon={Icon} go={go} />
            </RevealItem>
          );
        })}

      {/* Streaks — one wide band instead of a separate grid of its own cards. */}
      <RevealItem style={{ gridArea: isMobile ? undefined : "streaks" }}>
        <Card style={{ padding: "18px", height: "100%" }}>
          <SLabel style={{ marginBottom: "14px" }}>Streaks</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${streaks.length}, 1fr)`, gap: "10px" }}>
            {streaks.map((s) => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: "24px", color: s.c, fontFamily: "var(--font-jetbrains-mono)", lineHeight: 1 }}>{s.v}</div>
                <div style={{ color: C.mut, fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", marginTop: "5px", textTransform: "uppercase" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </RevealItem>

      <RevealItem style={{ gridArea: isMobile ? undefined : "journal" }}>
        <TodayTile s={today.find((t) => t.label === "Journal")} Icon={NotebookPen} go={go} />
      </RevealItem>

      {/* Career & prep — interviews/pipelines/offers plus DSA+journal focus and
         the way into the prep section, merged into one band (previously two
         separate "Career snapshot" / "Study focus" sections). */}
      <RevealItem style={{ gridArea: isMobile ? undefined : "career" }}>
        <Card style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <SLabel style={{ marginBottom: 0 }}>40+ LPA — today&rsquo;s focus</SLabel>
            <Btn size="sm" variant="ghost" onClick={() => go("dsa")}>
              Go to prep →
            </Btn>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(5,1fr)",
              gap: "10px",
            }}
          >
            <Stat value={interviewsToday} label="Interviews today" />
            <Stat value={applied} label="Active pipelines" />
            <Stat value={offers} label="Offers" color={offers > 0 ? C.suc : C.text} />
            <Stat value={dsaTodayLabel} label="DSA today" size="16px" />
            <Stat value={journalTodayLabel} label="Journal" size="16px" />
          </div>
        </Card>
      </RevealItem>
    </Reveal>
  );
}

function TodayTile({ s, Icon, go }) {
  const color = TODAY_COLOR[s.label] || C.acc;
  return (
    <Card
      onClick={() => go(s.nav)}
      label={`${s.label}: ${s.value}`}
      style={{ padding: "18px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}
    >
      <motion.div
        aria-hidden="true"
        animate={{ backgroundColor: s.done ? `${color}22` : C.high, color: s.done ? color : C.mut }}
        transition={SPRING}
        style={{
          width: "34px",
          height: "34px",
          borderRadius: RADIUS.sm,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={17} />
      </motion.div>
      <div>
        <div style={{ fontWeight: 700, fontSize: "13.5px", color: s.done ? C.text : C.mut }}>{s.label}</div>
        <div style={{ fontSize: "12px", color: s.done ? color : C.mut, marginTop: "2px" }}>{s.value}</div>
      </div>
    </Card>
  );
}

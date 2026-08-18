"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { C, RADIUS, SPRING_SOFT } from "@/ui/theme";
import { AmbientBackground } from "@/ui/AmbientBackground";
import { toDay, shiftDate, daysBetween, calcStreak } from "@/lib/dateUtils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { WELLNESS_VIEWS, PREP_VIEWS } from "@/lib/navConfig";
import { CommandPalette } from "@/components/CommandPalette";
import { MilestoneCelebration } from "@/components/MilestoneCelebration";
import { useMilestoneCelebration } from "@/hooks/useMilestoneCelebration";

import { useWaterLogs } from "@/hooks/data/useWaterLogs";
import { useSleepLogs } from "@/hooks/data/useSleepLogs";
import { useCrackerLogs } from "@/hooks/data/useCrackerLogs";
import { useVitamins } from "@/hooks/data/useVitamins";
import { useSkinRoutine } from "@/hooks/data/useSkinRoutine";
import { useJournal } from "@/hooks/data/useJournal";
import { useDsa } from "@/hooks/data/useDsa";
import { useStrengthLogs } from "@/hooks/data/useStrengthLogs";
import { useWeightLogs } from "@/hooks/data/useWeightLogs";
import { useCompanies } from "@/hooks/data/useCompanies";
import { useSystemDesign } from "@/hooks/data/useSystemDesign";
import { useInterviews } from "@/hooks/data/useInterviews";
import { useHtmlNotes } from "@/hooks/data/useHtmlNotes";

import Sidebar, { SIDEBAR_WIDTH_PX } from "@/components/Sidebar";
import Dashboard from "@/components/views/Dashboard";
import Water from "@/components/views/Water";
import Sleep from "@/components/views/Sleep";
import Cracker from "@/components/views/Cracker";
import Vitamins from "@/components/views/Vitamins";
import Skin from "@/components/views/Skin";
import Strength from "@/components/views/Strength";
import Dsa from "@/components/views/Dsa";
import HtmlNotesSection from "@/components/views/HtmlNotesSection";
import SystemDesign from "@/components/views/SystemDesign";
import Interview from "@/components/views/Interview";
import Companies from "@/components/views/Companies";
import Weight from "@/components/views/Weight";
import Journal from "@/components/views/Journal";

export default function LifeOS() {
  const [view, setView] = useState("dashboard");
  const [wellnessOpen, setWellnessOpen] = useState(false);
  const [lpaOpen, setLpaOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [waterGoal, setWaterGoal] = useLocalStorageState("lifeos:waterGoal", 3000);

  const todayStr = toDay();

  const water = useWaterLogs();
  const sleep = useSleepLogs();
  const cracker = useCrackerLogs();
  const vitamins = useVitamins();
  const skin = useSkinRoutine();
  const journal = useJournal();
  const dsa = useDsa();
  const strength = useStrengthLogs();
  const weight = useWeightLogs();
  const companies = useCompanies();
  const systemDesign = useSystemDesign();
  const interviews = useInterviews();
  const htmlNotes = useHtmlNotes();

  const go = (v) => {
    setView(v);
    setMobileMenuOpen(false);
    if (WELLNESS_VIEWS.includes(v)) setWellnessOpen(true);
    if (PREP_VIEWS.includes(v)) setLpaOpen(true);
  };

  // ── Derived "today" state, shared by the dashboard and sidebar nav dots ──
  const lastNightStr = shiftDate(todayStr, -1);

  const todayWater = useMemo(
    () => water.logs.filter((l) => l.date === todayStr).reduce((s, l) => s + l.amount, 0),
    [water.logs, todayStr]
  );
  const waterPct = Math.min(100, Math.round((todayWater / waterGoal) * 100));
  // `dsa.problems` is the whole NeetCode 150 catalog, solved or not, so these
  // two must not count rows — they count *solved dates*. A problem's `date` is
  // null until you mark it solved and is the day you did (see
  // supabase/schema.sql), which is exactly what both of these want: today's
  // count is "solved today", and calcStreak already drops the nulls.
  const todayDSA = dsa.problems.filter((p) => p.date === todayStr).length;
  const todayJournal = journal.entries.some((e) => e.date === todayStr);
  const todayWorkout = strength.logs.some((l) => l.date === todayStr);
  const todaySleepHours = useMemo(() => {
    const entry = sleep.logs.find((l) => l.date === lastNightStr);
    return entry ? entry.durationHours : 0;
  }, [sleep.logs, lastNightStr]);
  const todayWeighedIn = weight.logs.some((w) => w.date === todayStr);
  const daysSinceSlip = useMemo(() => {
    const slipDates = cracker.logs.filter((l) => l.content || l.act).map((l) => l.date);
    if (!slipDates.length) return null;
    const lastSlip = slipDates.slice().sort().slice(-1)[0];
    return Math.max(0, daysBetween(lastSlip, todayStr));
  }, [cracker.logs, todayStr]);

  const dsaStreak = useMemo(() => calcStreak(dsa.problems.map((p) => p.date)), [dsa.problems]);
  const workoutStreak = useMemo(() => calcStreak(strength.logs.map((l) => l.date)), [strength.logs]);
  const journalStreak = useMemo(() => calcStreak(journal.entries.map((e) => e.date)), [journal.entries]);
  const waterStreak = useMemo(() => {
    const totals = water.logs.reduce((a, l) => {
      a[l.date] = (a[l.date] || 0) + l.amount;
      return a;
    }, {});
    return calcStreak(Object.entries(totals).filter(([, v]) => v >= waterGoal).map(([d]) => d));
  }, [water.logs, waterGoal]);
  const sleepStreak = useMemo(
    () => calcStreak(sleep.logs.filter((l) => l.durationHours >= 7.5).map((l) => l.date)),
    [sleep.logs]
  );

  const streaks = [
    { l: "DSA", v: dsaStreak, c: C.acc },
    { l: "Strength", v: workoutStreak, c: C.suc },
    { l: "Journal", v: journalStreak, c: C.war },
    { l: "Water", v: waterStreak, c: C.blue },
    { l: "Sleep", v: sleepStreak, c: C.pink },
  ];

  const { active: milestone, dismiss: dismissMilestone } = useMilestoneCelebration(streaks);

  const dots = {
    water: waterPct >= 100,
    weight: todayWeighedIn,
    sleep: sleep.logs.some((l) => l.date === lastNightStr),
    cracker: !!daysSinceSlip && daysSinceSlip > 0,
    strength: todayWorkout,
    dsa: todayDSA > 0,
    interview: interviews.interviews.some((i) => i.date === todayStr),
    journal: todayJournal,
  };

  const dashboardLoading =
    water.loading ||
    sleep.loading ||
    dsa.loading ||
    journal.loading ||
    strength.loading ||
    weight.loading ||
    interviews.loading ||
    companies.loading;

  const interviewsToday = interviews.interviews.filter((i) => i.date === todayStr).length;
  const offers = companies.companies.filter((c) => c.status === "Offer").length;
  const applied = companies.companies.filter((c) => ["Applied", "OA", "Interview"].includes(c.status)).length;

  const metrics = {
    waterPct,
    todayWater,
    todaySleepHours,
    todayDSA,
    todayJournal,
    todayWorkout,
    interviewsToday,
    offers,
    applied,
  };

  const fullscreenInsetLeft = isMobile ? 0 : SIDEBAR_WIDTH_PX;
  const quickAddWater = (amount) => water.logAmount(amount, todayStr);

  // A personal export: every table this account can see, gathered from the
  // hooks already held in memory (no extra Supabase round-trip). HTML notes
  // are listed by name/section only — their content lives in Storage, and
  // pulling every note's body in just for an export is unlikely to be worth
  // the extra network calls; the metadata is enough to know what exists.
  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      water: water.logs,
      weight: weight.logs,
      sleep: sleep.logs,
      cracker: cracker.logs,
      vitamins: vitamins.vitamins,
      vitaminLogs: vitamins.vitaminLogs,
      skinRoutineItems: skin.items,
      skinRoutineLogs: skin.logs,
      journal: journal.entries,
      dsaProblems: dsa.problems,
      strength: strength.logs,
      companies: companies.companies,
      systemDesign: systemDesign.topics,
      interviews: interviews.interviews,
      htmlNotes: htmlNotes.notes.map((n) => ({ name: n.name, section: n.section, created_at: n.created_at })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeos-export-${todayStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const view$ = (() => {
    switch (view) {
      case "water":
        return (
          <Water
            isMobile={isMobile}
            todayStr={todayStr}
            logs={water.logs}
            loading={water.loading}
            logAmount={water.logAmount}
            updateAmount={water.updateAmount}
            remove={water.remove}
            goal={waterGoal}
            setGoal={setWaterGoal}
          />
        );
      case "weight":
        return (
          <Weight isMobile={isMobile} logs={weight.logs} loading={weight.loading} logWeight={weight.logWeight} remove={weight.remove} />
        );
      case "sleep":
        return (
          <Sleep isMobile={isMobile} todayStr={todayStr} logs={sleep.logs} loading={sleep.loading} save={sleep.save} remove={sleep.remove} />
        );
      case "cracker":
        return (
          <Cracker
            isMobile={isMobile}
            todayStr={todayStr}
            logs={cracker.logs}
            loading={cracker.loading}
            saveEntry={cracker.saveEntry}
            remove={cracker.remove}
          />
        );
      case "vitamin":
        return (
          <Vitamins
            isMobile={isMobile}
            vitamins={vitamins.vitamins}
            vitaminLogs={vitamins.vitaminLogs}
            loading={vitamins.loading}
            save={vitamins.save}
            remove={vitamins.remove}
            toggleLog={vitamins.toggleLog}
          />
        );
      case "skin":
        return (
          <Skin
            isMobile={isMobile}
            todayStr={todayStr}
            items={skin.items}
            logs={skin.logs}
            loading={skin.loading}
            addItem={skin.addItem}
            removeItem={skin.removeItem}
            toggleLog={skin.toggleLog}
          />
        );
      case "strength":
        return (
          <Strength
            isMobile={isMobile}
            todayStr={todayStr}
            streak={workoutStreak}
            logs={strength.logs}
            loading={strength.loading}
            logWorkout={strength.logWorkout}
            update={strength.update}
            remove={strength.remove}
          />
        );
      case "dsa":
        return (
          <Dsa
            isMobile={isMobile}
            streak={dsaStreak}
            todayCount={todayDSA}
            problems={dsa.problems}
            loading={dsa.loading}
            addProblem={dsa.addProblem}
            updateProblem={dsa.updateProblem}
            toggleSolved={dsa.toggleSolved}
            markReviewed={dsa.markReviewed}
            remove={dsa.remove}
            catalogStatus={dsa.catalogStatus}
            seedCatalog={dsa.seedCatalog}
            seeding={dsa.seeding}
            approaches={dsa.approaches}
            loadApproachDetails={dsa.loadApproachDetails}
            addApproach={dsa.addApproach}
            updateApproach={dsa.updateApproach}
            removeApproach={dsa.removeApproach}
            setPrimaryApproach={dsa.setPrimaryApproach}
          />
        );
      case "fundamentals":
        return (
          <HtmlNotesSection
            isMobile={isMobile}
            title="Fundamentals"
            section="fundamentals"
            namePlaceholder="Note name (e.g. TCP Notes)"
            notes={htmlNotes.notes}
            loading={htmlNotes.loading}
            upload={htmlNotes.upload}
            deleteNote={htmlNotes.deleteNote}
            fetchHtml={htmlNotes.fetchHtml}
            fullscreenInsetLeft={fullscreenInsetLeft}
          />
        );
      case "systemdesign":
        return (
          <SystemDesign
            isMobile={isMobile}
            topics={systemDesign.topics}
            loading={systemDesign.loading}
            save={systemDesign.save}
            remove={systemDesign.remove}
          />
        );
      case "misc":
        return (
          <HtmlNotesSection
            isMobile={isMobile}
            title="Miscellaneous"
            section="misc"
            namePlaceholder="Note name (e.g. Git Internals)"
            notes={htmlNotes.notes}
            loading={htmlNotes.loading}
            upload={htmlNotes.upload}
            deleteNote={htmlNotes.deleteNote}
            fetchHtml={htmlNotes.fetchHtml}
            fullscreenInsetLeft={fullscreenInsetLeft}
          />
        );
      case "interview":
        return (
          <Interview
            isMobile={isMobile}
            interviews={interviews.interviews}
            loading={interviews.loading}
            addInterview={interviews.addInterview}
            remove={interviews.remove}
          />
        );
      case "companies":
        return (
          <Companies
            isMobile={isMobile}
            companies={companies.companies}
            loading={companies.loading}
            add={companies.add}
            update={companies.update}
            remove={companies.remove}
          />
        );
      case "journal":
        return (
          <Journal
            isMobile={isMobile}
            todayStr={todayStr}
            streak={journalStreak}
            entries={journal.entries}
            loading={journal.loading}
            save={journal.save}
            remove={journal.remove}
          />
        );
      case "dashboard":
      default:
        return (
          <Dashboard
            isMobile={isMobile}
            metrics={metrics}
            streaks={streaks}
            loading={dashboardLoading}
            go={go}
            quickAddWater={quickAddWater}
          />
        );
    }
  })();

  return (
    <>
      <AmbientBackground />
      <CommandPalette
        open={paletteOpen}
        setOpen={setPaletteOpen}
        go={go}
        quickAddWater={quickAddWater}
        exportData={exportData}
      />
      <MilestoneCelebration active={milestone} dismiss={dismissMilestone} />
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            role="button"
            tabIndex={0}
            onClick={() => setMobileMenuOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setMobileMenuOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)", zIndex: 1000 }}
            aria-label="Close menu"
          />
        )}
      </AnimatePresence>
      <div style={{ position: "relative", zIndex: 1, color: C.text, minHeight: "100vh", display: "flex", fontSize: "14px" }}>
        <Sidebar
          view={view}
          go={go}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          wellnessOpen={wellnessOpen}
          setWellnessOpen={setWellnessOpen}
          lpaOpen={lpaOpen}
          setLpaOpen={setLpaOpen}
          dots={dots}
          streaks={streaks}
          onSignOut={() => supabase.auth.signOut()}
          onOpenPalette={() => setPaletteOpen(true)}
          onExportData={exportData}
        />
        <div style={{ flex: 1, width: isMobile ? "100%" : undefined, padding: isMobile ? "16px" : "32px 40px", overflowY: "auto", maxHeight: "100vh" }}>
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <motion.button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                whileHover={{ backgroundColor: C.high, borderColor: C.bordStrong }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: C.surf,
                  border: `1px solid ${C.bord}`,
                  borderRadius: RADIUS.md,
                  color: C.text,
                  padding: "10px 14px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                aria-label="Open menu"
              >
                <Menu size={18} aria-hidden="true" />
                Menu
              </motion.button>
              <span style={{ fontWeight: 600, fontSize: "16px", fontFamily: "var(--font-fraunces)" }}>LifeOS</span>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={SPRING_SOFT}
            >
              {view$}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

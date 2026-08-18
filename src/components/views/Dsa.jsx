"use client";
import { useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import { Btn, EmptyState, PH, Skeleton } from "@/ui/primitives";
import { C, RADIUS } from "@/ui/theme";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import AddProblemModal from "./dsa/AddProblemModal";
import CatalogStatus from "./dsa/CatalogStatus";
import CategoryRail from "./dsa/CategoryRail";
import ProblemDetail from "./dsa/ProblemDetail";
import ProblemList from "./dsa/ProblemList";
import ProgressSummary from "./dsa/ProgressSummary";
import Toolbar from "./dsa/Toolbar";
import { NEXT_UP_COUNT, groupByCategory, hasWriteup, isSolved, progressOf } from "./dsa/constants";

/**
 * NeetCode 150 workspace.
 *
 * Reading order down the page is the order the questions actually get asked:
 * where do I stand (ProgressSummary) → what am I working on (Toolbar) → which
 * group (CategoryRail) → which problem (ProblemList) → the problem itself
 * (ProblemDetail).
 *
 * The category rail is a sibling of the list rather than a filter inside the
 * toolbar because it answers a question the toolbar can't: a dropdown tells
 * you the names of the eighteen groups, a rail tells you how far into each of
 * them you are.
 */
export default function Dsa({
  isMobile,
  streak,
  todayCount,
  problems,
  addProblem,
  updateProblem,
  toggleSolved,
  markReviewed,
  remove,
  loading,
  catalogStatus,
  seedCatalog,
  seeding,
  approaches,
  loadApproachDetails,
  addApproach,
  updateApproach,
  removeApproach,
  setPrimaryApproach,
}) {
  // The rail needs roughly 240px beside a list that stays readable, which stops
  // working before `isMobile` does — so the two-column layout has its own
  // breakpoint rather than reusing the app-wide one.
  const stacked = useMediaQuery("(max-width: 1000px)");
  const [category, setCategory] = useLocalStorageState("lifeos:dsa:category", null);
  const [status, setStatus] = useLocalStorageState("lifeos:dsa:status", "all");
  const [difficulty, setDifficulty] = useLocalStorageState("lifeos:dsa:difficulty", "All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const confirm = useConfirm();

  const showSkeleton = loading && problems.length === 0;

  const approachCounts = useMemo(() => {
    const counts = new Map();
    for (const a of approaches) counts.set(a.problem_id, (counts.get(a.problem_id) || 0) + 1);
    return counts;
  }, [approaches]);
  const approachCountFor = (id) => approachCounts.get(id) || 0;

  // Category progress is always computed over every problem, never over the
  // filtered set: "7 / 9" has to mean seven of the nine that exist, or the
  // rail would read 0/0 the moment you filtered to unsolved.
  const allGroups = useMemo(() => groupByCategory(problems), [problems]);
  const totalProgress = useMemo(() => progressOf(problems), [problems]);

  const nextUp = useMemo(
    () => problems.filter((p) => !isSolved(p)).slice(0, NEXT_UP_COUNT),
    [problems]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = status === "next" ? nextUp : problems;
    return base.filter((p) => {
      if (category && p.category !== category) return false;
      if (difficulty !== "All" && p.difficulty !== difficulty) return false;
      if (status === "solved" && !isSolved(p)) return false;
      if (status === "unsolved" && isSolved(p)) return false;
      if (status === "nonotes" && hasWriteup(p, approachCountFor(p.id))) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.pattern || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
    // approachCountFor closes over the memoised counts map, so it is stable
    // for the same `approaches`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problems, nextUp, category, difficulty, status, query, approachCounts]);

  // "Next up" is a queue, so it stays in catalog order as one flat list.
  // Everything else groups, because that is what makes 150 rows navigable.
  const flat = status === "next" ? filtered : null;
  const groups = useMemo(() => (flat ? [] : groupByCategory(filtered)), [flat, filtered]);

  const openIndex = filtered.findIndex((p) => p.id === openId);
  const openProblem = openIndex >= 0 ? filtered[openIndex] : problems.find((p) => p.id === openId) || null;
  // "9/9" for the open problem's own group — context you want while studying
  // it, and it comes free from the grouping already computed for the rail.
  const openCategoryProgress = openProblem
    ? (() => {
        const g = allGroups.find((x) => x.name === openProblem.category);
        return g ? `${g.solved}/${g.total}` : null;
      })()
    : null;

  const handleDelete = async (p) => {
    if (await confirm(`Delete "${p.name}"? Your notes and approaches for it go too.`)) {
      await remove(p.id);
      setOpenId((cur) => (cur === p.id ? null : cur));
    }
  };

  const resetFilters = () => {
    setCategory(null);
    setStatus("all");
    setDifficulty("All");
    setQuery("");
  };

  return (
    // Capped and centred. Left to fill a 1600px window, the list stretches so
    // wide that a title and its right-aligned difficulty end up 700px apart
    // with nothing between them — the row stops reading as one thing.
    // `minmax(0, 1fr)` on every single-column grid below is what lets the
    // horizontally-scrolling filter strips actually scroll instead of pushing
    // the page wider than a phone screen.
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <PH title="DSA" />

      {showSkeleton ? (
        <LoadingState stacked={stacked} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "20px" }}>
          {/* Before the catalog exists there is no progress to summarise, and a
              "0 / 0 — complete" card would be actively misleading. The setup
              panel is the only thing on the page until there is something to
              make progress against. */}
          {problems.length > 0 && (
            <ProgressSummary
              problems={problems}
              streak={streak}
              todayCount={todayCount}
              isNarrow={stacked}
            />
          )}

          {!catalogStatus.complete && (
            <CatalogStatus status={catalogStatus} onSeed={seedCatalog} seeding={seeding} isNarrow={stacked} />
          )}

          {problems.length > 0 && (
            <>
              <Toolbar
                query={query}
                onQuery={setQuery}
                status={status}
                onStatus={setStatus}
                difficulty={difficulty}
                onDifficulty={setDifficulty}
                onAdd={() => setAdding(true)}
                isNarrow={stacked}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: stacked ? "minmax(0, 1fr)" : "236px minmax(0, 1fr)",
                  gap: stacked ? "16px" : "28px",
                  alignItems: "start",
                }}
              >
                {stacked ? (
                  <MobileCategoryPicker
                    groups={allGroups}
                    active={category}
                    onSelect={setCategory}
                    totalProgress={totalProgress}
                  />
                ) : (
                  // Sticky so the rail stays usable while the list scrolls —
                  // the page scrolls as a whole, and an 18-row rail that
                  // disappeared at problem 40 would be no use.
                  <div style={{ position: "sticky", top: "8px" }}>
                    <CategoryRail
                      groups={allGroups}
                      active={category}
                      onSelect={setCategory}
                      totalProgress={totalProgress}
                    />
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "14px", minWidth: 0 }}>
                  {filtered.length === 0 ? (
                    <div
                      style={{
                        background: C.surf,
                        border: `1px solid ${C.bord}`,
                        borderRadius: RADIUS.lg,
                      }}
                    >
                      <EmptyState
                        icon={<ListChecks size={22} />}
                        action={
                          <Btn size="sm" variant="ghost" onClick={resetFilters}>
                            Clear filters
                          </Btn>
                        }
                      >
                        {status === "solved"
                          ? "Nothing solved here yet."
                          : status === "nonotes"
                            ? "Every problem here already has notes."
                            : "No problems match these filters."}
                      </EmptyState>
                    </div>
                  ) : (
                    <ProblemList
                      groups={groups}
                      flat={flat}
                      approachCountFor={approachCountFor}
                      onOpen={setOpenId}
                      onToggleSolved={(p) => toggleSolved(p.id, !isSolved(p))}
                      isNarrow={isMobile}
                    />
                  )}
                  {/* Complete-state only: the incomplete panel already sits
                      above the toolbar, where it can't be scrolled past. */}
                  {catalogStatus.complete && (
                    <CatalogStatus
                      status={catalogStatus}
                      onSeed={seedCatalog}
                      seeding={seeding}
                      isNarrow={stacked}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {openProblem && (
        <ProblemDetail
          // Keyed so moving to the next problem remounts cleanly: the approach
          // fetch and every editable field's draft belong to one problem.
          key={openProblem.id}
          problem={openProblem}
          approaches={approaches}
          onUpdate={updateProblem}
          onToggleSolved={() => toggleSolved(openProblem.id, !isSolved(openProblem))}
          onMarkReviewed={() => markReviewed(openProblem.id)}
          onDelete={() => handleDelete(openProblem)}
          onClose={() => setOpenId(null)}
          categoryProgress={openCategoryProgress}
          onPrev={openIndex > 0 ? () => setOpenId(filtered[openIndex - 1].id) : null}
          onNext={
            openIndex >= 0 && openIndex < filtered.length - 1 ? () => setOpenId(filtered[openIndex + 1].id) : null
          }
          position={openIndex >= 0 ? `${openIndex + 1}/${filtered.length}` : null}
          isMobile={isMobile}
          loadApproachDetails={loadApproachDetails}
          addApproach={addApproach}
          updateApproach={updateApproach}
          removeApproach={removeApproach}
          setPrimaryApproach={setPrimaryApproach}
        />
      )}

      {adding && (
        <AddProblemModal onClose={() => setAdding(false)} onSubmit={addProblem} isMobile={isMobile} />
      )}
    </div>
  );
}

/**
 * The rail doesn't fit beside the list on a narrow screen, and an 18-item
 * dropdown loses the progress numbers that make it worth having — so it
 * becomes a horizontal strip that keeps them.
 */
function MobileCategoryPicker({ groups, active, onSelect, totalProgress }) {
  const items = [{ name: "All", solved: totalProgress.solved, total: totalProgress.total, key: null }, ...groups.map((g) => ({ ...g, key: g.name }))];
  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        overflowX: "auto",
        paddingBottom: "4px",
        scrollbarWidth: "none",
        minWidth: 0,
      }}
    >
      {items.map((it) => {
        const on = active === it.key;
        const done = it.total > 0 && it.solved === it.total;
        return (
          <button
            key={it.key ?? "all"}
            type="button"
            onClick={() => onSelect(it.key)}
            aria-pressed={on}
            style={{
              background: on ? C.high : "transparent",
              border: `1px solid ${on ? C.bordStrong : C.bord}`,
              borderRadius: RADIUS.md,
              padding: "7px 12px",
              fontFamily: "inherit",
              fontSize: "11.5px",
              fontWeight: 600,
              color: on ? C.text : C.mut,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              display: "inline-flex",
              gap: "7px",
              alignItems: "baseline",
            }}
          >
            {it.name === "All" ? "All problems" : it.name}
            <span style={{ opacity: 0.7, color: done ? C.suc : "inherit", fontSize: "10.5px" }}>
              {it.solved}/{it.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LoadingState({ stacked }) {
  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <Skeleton height={128} radius={RADIUS.lg} />
      <Skeleton height={38} radius={RADIUS.md} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: stacked ? "minmax(0, 1fr)" : "236px minmax(0, 1fr)",
          gap: stacked ? "16px" : "28px",
        }}
      >
        <div style={{ display: "grid", gap: "10px" }}>
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} height={28} />
          ))}
        </div>
        <Skeleton height={420} radius={RADIUS.lg} />
      </div>
    </div>
  );
}

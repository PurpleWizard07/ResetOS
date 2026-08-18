"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  Target,
} from "lucide-react";
import { Badge, Btn, Modal } from "@/ui/primitives";
import { C, MONO, RADIUS } from "@/ui/theme";
import { fmt } from "@/lib/dateUtils";
import { DIFF_HEX, isSolved } from "./constants";
import ApproachPanel from "./ApproachPanel";
import EditableText from "./EditableText";

/**
 * The study workspace for one problem.
 *
 * Two things changed from the record-viewer this replaces. Every block is
 * directly editable (see EditableText) so reading and writing are the same
 * screen. And the questions are asked out loud — "What is the problem really
 * asking?" instead of a box labelled "understanding" — because a specific
 * question gets answered and a vague label gets skipped.
 *
 * Layout is a wide main column with a narrow rail. It is a sized dialog, not a
 * fullscreen one: a fullscreen panel is pinned to the window height, and a
 * problem you have not written anything about yet only fills the top third of
 * it — which is precisely the "too empty, wastes the screen" complaint this
 * replaces. Sized to its content, capped at 88vh and scrolling past that, it
 * is compact when empty and a full workspace once you have filled it in.
 *
 * The rail collapses above the main column on narrow screens, which keeps
 * Pattern — the thing you want to recall first — near the top in both.
 */
export default function ProblemDetail({
  problem,
  approaches,
  onUpdate,
  onToggleSolved,
  onMarkReviewed,
  onDelete,
  onClose,
  categoryProgress,
  onPrev,
  onNext,
  position,
  isMobile,
  loadApproachDetails,
  addApproach,
  updateApproach,
  removeApproach,
  setPrimaryApproach,
}) {
  const [loadingApproaches, setLoadingApproaches] = useState(true);
  const solved = isSolved(problem);
  const narrow = isMobile;

  // Mount-only: this component remounts fresh whenever a different problem's
  // detail view opens (Dsa.jsx keys it on the problem id), so a single fetch
  // per mount is exactly one fetch per "problem opened" event.
  useEffect(() => {
    let active = true;
    loadApproachDetails(problem.id).finally(() => {
      if (active) setLoadingApproaches(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myApproaches = approaches
    .filter((a) => a.problem_id === problem.id)
    .sort((a, b) => a.sort_index - b.sort_index);

  const patch = useCallback((field) => (v) => onUpdate(problem.id, { [field]: v }), [onUpdate, problem.id]);

  const rail = (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "22px", alignContent: "start" }}>
      <PatternBlock value={problem.pattern} onSave={patch("pattern")} />

      {problem.tags?.length > 0 && (
        <div>
          <RailLabel>Tags</RailLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {problem.tags.map((t) => (
              <Badge key={t} color="mut">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <RailLabel>Progress</RailLabel>
        <dl style={{ display: "grid", gap: "9px", margin: 0 }}>
          <Fact label="Status" value={solved ? "Solved" : "Not solved"} tone={solved ? C.suc : C.mut} />
          {solved && <Fact label="Solved on" value={fmt(problem.date)} />}
          <Fact label="Last reviewed" value={problem.last_revised ? fmt(problem.last_revised) : "Never"} />
          <Fact label="Approaches" value={myApproaches.length || "None yet"} />
          {categoryProgress && <Fact label="In this group" value={categoryProgress} />}
        </dl>
      </div>
    </div>
  );

  /*
   * Actions are their own block so the two layouts can place them
   * differently. On desktop they close the rail. Stacked, the rail moves above
   * the content — and "Delete problem" must not end up above the notes you are
   * about to write, so it goes to the very bottom instead.
   */
  const actions = (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "7px" }}>
      <Btn size="sm" variant="ghost" onClick={onMarkReviewed} icon={<Check size={12} />} full>
        Mark reviewed today
      </Btn>
      <Btn size="sm" variant="ghost" onClick={onDelete} full>
        Delete problem
      </Btn>
    </div>
  );

  return (
    <Modal maxWidth="1040px" title={problem.name} onClose={onClose}>
      <div>
        <MetaStrip
          problem={problem}
          solved={solved}
          onToggleSolved={onToggleSolved}
          onPrev={onPrev}
          onNext={onNext}
          position={position}
          narrow={narrow}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: narrow ? "minmax(0, 1fr)" : "minmax(0, 1fr) 232px",
            gap: narrow ? "26px" : "44px",
            alignItems: "start",
          }}
        >
          {narrow && rail}

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "30px", minWidth: 0 }}>
            <section>
              <SectionHead icon={<Lightbulb size={13} />} title="Understanding" />
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "18px" }}>
                <Prompt
                  question="What is the problem really asking?"
                  value={problem.restated}
                  onSave={patch("restated")}
                  placeholder="Say it back in your own words, as if explaining to a friend."
                />
                <Prompt
                  question="Key observation"
                  value={problem.key_insight}
                  onSave={patch("key_insight")}
                  placeholder="The one thing you noticed that made the solution possible."
                />
                <Prompt
                  question="Why does this approach work?"
                  value={problem.why_it_works}
                  onSave={patch("why_it_works")}
                  placeholder="What stays true at every step, so the answer can't be wrong?"
                />
              </div>
            </section>

            <section>
              <ApproachPanel
                problemId={problem.id}
                approaches={myApproaches}
                loadingDetails={loadingApproaches}
                onAdd={addApproach}
                onUpdate={updateApproach}
                onDelete={removeApproach}
                onSetPrimary={setPrimaryApproach}
                isNarrow={narrow}
              />
            </section>

            <section>
              <SectionHead icon={<AlertTriangle size={13} />} title="Pitfalls" />
              <Prompt
                question="What went wrong, and what would catch you out next time?"
                value={problem.pitfalls}
                onSave={patch("pitfalls")}
                placeholder="Empty input. Duplicate values. Off-by-one. Moved the wrong pointer."
                minHeight={62}
              />
            </section>

            <section>
              <SectionHead title="Notes" />
              <Prompt
                value={problem.notes}
                onSave={patch("notes")}
                placeholder="Anything else worth keeping."
                minHeight={62}
              />
            </section>

            {narrow && actions}
          </div>

          {!narrow && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "22px", alignContent: "start" }}>
              {rail}
              {actions}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** Difficulty, source, category, the outbound link, and the solved toggle. */
function MetaStrip({ problem, solved, onToggleSolved, onPrev, onNext, position, narrow }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: narrow ? "10px" : "14px",
        flexWrap: "wrap",
        paddingBottom: "20px",
        marginBottom: "24px",
        borderBottom: `1px solid ${C.bord}`,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12.5px", flexWrap: "wrap" }}>
        {problem.problem_order && (
          <span style={{ fontFamily: MONO, fontSize: "11.5px", color: C.mut, opacity: 0.7 }}>
            #{problem.problem_order}
          </span>
        )}
        <span style={{ color: DIFF_HEX[problem.difficulty], fontWeight: 700 }}>{problem.difficulty}</span>
        <Dot />
        <span style={{ color: C.mut }}>{problem.source || "LeetCode"}</span>
        {problem.category && (
          <>
            <Dot />
            <span style={{ color: C.mut }}>{problem.category}</span>
          </>
        )}
      </span>

      <span style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: narrow ? 0 : "auto" }}>
        {(onPrev || onNext) && (
          <span style={{ display: "flex", alignItems: "center", gap: "2px", marginRight: "4px" }}>
            <NavArrow label="Previous problem" onClick={onPrev} disabled={!onPrev}>
              <ChevronLeft size={15} />
            </NavArrow>
            {position && (
              <span style={{ fontFamily: MONO, fontSize: "10.5px", color: C.mut, padding: "0 3px" }}>{position}</span>
            )}
            <NavArrow label="Next problem" onClick={onNext} disabled={!onNext}>
              <ChevronRight size={15} />
            </NavArrow>
          </span>
        )}
        {problem.link && (
          <a
            href={problem.link}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 600,
              color: C.acc,
              border: `1px solid ${C.bord}`,
              borderRadius: RADIUS.md,
              padding: "7px 12px",
              whiteSpace: "nowrap",
            }}
          >
            Open problem
            <ExternalLink size={12} />
          </a>
        )}
        <Btn size="sm" variant={solved ? "success" : "primary"} onClick={onToggleSolved} icon={<Check size={13} />}>
          {solved ? "Solved" : "Mark solved"}
        </Btn>
      </span>
    </div>
  );
}

/**
 * Pattern gets the loudest treatment in the rail — accent-coloured, larger
 * than anything around it. Naming the pattern is the recall you are actually
 * training, so it should be the first thing your eye lands on when you reopen
 * a problem weeks later.
 */
function PatternBlock({ value, onSave }) {
  return (
    <div
      style={{
        background: C.accBg,
        border: `1px solid ${C.accBord}`,
        borderRadius: RADIUS.md,
        padding: "13px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: C.acc,
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: "6px",
          opacity: 0.9,
        }}
      >
        <Target size={11} />
        Pattern
      </div>
      <PatternInput value={value} onSave={onSave} />
    </div>
  );
}

/** Seeded once and then left alone, for the same reason as EditableText. */
function PatternInput({ value, onSave }) {
  const [draft, setDraft] = useState(value || "");
  const saved = useRef(value || "");
  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft === saved.current) return;
        saved.current = draft;
        onSave(draft);
      }}
      placeholder="Name the technique"
      aria-label="Pattern"
      style={{
        background: "transparent",
        border: "none",
        borderBottom: `1px solid transparent`,
        color: draft ? C.acc : C.mut,
        fontFamily: "inherit",
        fontSize: "14.5px",
        fontWeight: 700,
        width: "100%",
        padding: "1px 0",
        outline: "none",
      }}
    />
  );
}

/**
 * A question and the answer, separated from its neighbours by a left rule
 * rather than by a box. Boxing five prompts would rebuild the form this view
 * exists to get away from; the rule marks the editable region and brightens
 * on hover, which is enough of an affordance.
 */
function Prompt({ question, value, onSave, placeholder, mono, minHeight }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderLeft: `2px solid ${hovered ? C.accBord : C.bord}`,
        paddingLeft: "13px",
        minWidth: 0,
        transition: "border-color 140ms ease",
      }}
    >
      {question && (
        <div
          style={{
            fontSize: "12.5px",
            fontWeight: 650,
            color: C.text,
            marginBottom: "3px",
            paddingLeft: "10px",
            lineHeight: 1.5,
          }}
        >
          {question}
        </div>
      )}
      <EditableText
        value={value || ""}
        onSave={onSave}
        placeholder={placeholder}
        ariaLabel={question}
        mono={mono}
        {...(minHeight ? { minHeight } : {})}
      />
    </div>
  );
}

function SectionHead({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
      {icon && <span style={{ display: "flex", color: C.mut }}>{icon}</span>}
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.11em",
          textTransform: "uppercase",
          color: C.mut,
        }}
      >
        {title}
      </span>
    </div>
  );
}

function RailLabel({ children }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: C.mut,
        marginBottom: "10px",
        opacity: 0.8,
      }}
    >
      {children}
    </div>
  );
}

function Fact({ label, value, tone }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "12px" }}>
      <dt style={{ color: C.mut }}>{label}</dt>
      <dd style={{ margin: 0, color: tone || C.text, fontWeight: 600, textAlign: "right" }}>{value}</dd>
    </div>
  );
}

function Dot() {
  return <span style={{ color: C.mut, opacity: 0.4 }}>·</span>;
}

function NavArrow({ children, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        background: "none",
        border: "none",
        color: C.mut,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.28 : 1,
        display: "flex",
        padding: "4px",
        borderRadius: RADIUS.sm,
      }}
    >
      {children}
    </button>
  );
}

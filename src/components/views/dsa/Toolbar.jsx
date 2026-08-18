"use client";
import { memo } from "react";
import { Plus, Search, X } from "lucide-react";
import { Btn } from "@/ui/primitives";
import { C, RADIUS } from "@/ui/theme";
import { DIFF_HEX, DIFFICULTIES, STATUS_FILTERS } from "./constants";
import Segmented from "./Segmented";

const DIFF_OPTIONS = [
  { id: "All", label: "Any" },
  ...DIFFICULTIES.map((d) => ({ id: d, label: d, tone: DIFF_HEX[d] })),
];

/**
 * Search plus the two filter questions. Kept to a single band above the list:
 * a filter panel with its own card and its own heading would put a second
 * heavy element between the progress summary and the thing you came to read.
 */
export const Toolbar = memo(function Toolbar({
  query,
  onQuery,
  status,
  onStatus,
  difficulty,
  onDifficulty,
  onAdd,
  isNarrow,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <SearchBox value={query} onChange={onQuery} isNarrow={isNarrow} />
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          alignItems: "center",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        <Segmented
          options={STATUS_FILTERS}
          value={status}
          onChange={onStatus}
          ariaLabel="Filter by status"
          scroll={isNarrow}
        />
        <Segmented
          options={DIFF_OPTIONS}
          value={difficulty}
          onChange={onDifficulty}
          ariaLabel="Filter by difficulty"
          scroll={isNarrow}
        />
        <Btn size="sm" variant="ghost" onClick={onAdd} icon={<Plus size={13} />}>
          {isNarrow ? "Add" : "Add problem"}
        </Btn>
      </div>
    </div>
  );
});

function SearchBox({ value, onChange, isNarrow }) {
  return (
    <div style={{ position: "relative", flex: isNarrow ? "1 1 100%" : "0 1 300px", minWidth: "180px" }}>
      <Search
        size={14}
        aria-hidden="true"
        style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.mut }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search problems, patterns, tags"
        aria-label="Search problems"
        className="input-control"
        style={{
          background: C.bg,
          border: `1px solid ${C.bord}`,
          borderRadius: RADIUS.md,
          padding: "9px 34px 9px 33px",
          color: C.text,
          fontFamily: "inherit",
          fontSize: "12.5px",
          width: "100%",
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: C.mut,
            cursor: "pointer",
            display: "flex",
            padding: "3px",
            borderRadius: RADIUS.sm,
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

export default Toolbar;

"use client";
import { memo } from "react";
import { CheckCircle2, Download, RotateCcw } from "lucide-react";
import { Btn } from "@/ui/primitives";
import { C, MONO, RADIUS } from "@/ui/theme";

/**
 * Whether the 150 are actually in the database, and the one control that puts
 * them there.
 *
 * Two states, because they want opposite amounts of attention:
 *  - incomplete: a real panel with an explanation. Nothing else on the page
 *    means anything until this is done.
 *  - complete: one quiet line under the list. It doubles as the standing
 *    "exactly 150 are present" check, so verifying the count never needs the
 *    database console — and it keeps re-sync reachable without a panel that
 *    sits there permanently telling you about a job already finished.
 */
export const CatalogStatus = memo(function CatalogStatus({ status, onSeed, seeding, isNarrow }) {
  if (status.complete) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          padding: "0 4px",
          fontSize: "11.5px",
          color: C.mut,
        }}
      >
        <CheckCircle2 size={13} style={{ color: C.suc, flexShrink: 0 }} />
        <span>
          <span style={{ fontFamily: MONO, color: C.text }}>{status.total}</span> problems in the catalog — the
          complete NeetCode 150.
        </span>
        <button
          type="button"
          onClick={onSeed}
          disabled={seeding}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: C.mut,
            fontFamily: "inherit",
            fontSize: "11.5px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            cursor: seeding ? "wait" : "pointer",
            padding: "4px",
            borderRadius: RADIUS.sm,
          }}
        >
          <RotateCcw size={11} />
          {seeding ? "Re-syncing…" : "Re-sync catalog"}
        </button>
      </div>
    );
  }

  const untouched = status.present === 0;
  return (
    <div
      style={{
        background: C.surf,
        border: `1px solid ${C.accBord}`,
        borderRadius: RADIUS.lg,
        padding: isNarrow ? "20px" : "22px 26px",
        display: "flex",
        gap: "20px",
        alignItems: isNarrow ? "flex-start" : "center",
        flexDirection: isNarrow ? "column" : "row",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.text, marginBottom: "7px" }}>
          {untouched ? "Set up NeetCode 150" : "Catalog is incomplete"}
        </div>
        <div style={{ fontSize: "12.5px", color: C.mut, lineHeight: 1.65 }}>
          {untouched ? (
            <>
              All 150 problems get added at once, grouped and ordered the way NeetCode teaches them. Nothing is
              marked solved — you work down the list from here.
            </>
          ) : (
            <>
              <span style={{ fontFamily: MONO, color: C.text }}>
                {status.present}/{status.total}
              </span>{" "}
              problems are here. Importing adds the missing {status.missing} and leaves everything you have written
              untouched.
            </>
          )}
          {status.legacy > 0 && (
            <>
              {" "}
              The {status.legacy} older hand-logged {status.legacy === 1 ? "entry" : "entries"} will be cleared.
            </>
          )}
        </div>
      </div>
      <Btn onClick={onSeed} loading={seeding} icon={<Download size={14} />}>
        {seeding ? "Importing…" : untouched ? "Import NeetCode 150" : `Add missing ${status.missing}`}
      </Btn>
    </div>
  );
});

export default CatalogStatus;

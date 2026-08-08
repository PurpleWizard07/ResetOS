"use client";
import { useId, useRef, useState } from "react";
import { C, MONO, RADIUS } from "@/ui/theme";

const PAD = { top: 22, right: 14, bottom: 22, left: 14 };
const VIEW_W = 600;

/**
 * Single-series trend line for magnitude-over-time (weight, sleep hours,
 * water totals, ...). One hue, no legend — a single series needs none, the
 * caller's own heading already names what's plotted. Per dataviz guidance:
 * 2px line, ~10% opacity area wash, hairline recessive gridlines, an
 * end-point direct label (the one value worth calling out), and a
 * crosshair+tooltip on hover/focus rather than a number on every point.
 *
 * `points`: [{ x: "2024-01-01", y: 72.4 }, ...] sorted ascending by x.
 * Renders an empty note instead of a chart when there's fewer than 2 points
 * — a single dot can't show a trend.
 */
export function TrendChart({
  points,
  color = C.acc,
  height = 130,
  formatValue = (y) => String(y),
  formatX = (x) => String(x),
  ariaLabel,
  empty = "Log a few more entries to see a trend.",
}) {
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  const gradId = useId();

  if (!points || points.length < 2) {
    return (
      <div style={{ color: C.mut, fontSize: "12px", padding: "18px 0", textAlign: "center" }}>{empty}</div>
    );
  }

  const plotW = VIEW_W - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const ys = points.map((p) => p.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const ySpan = yMax - yMin || 1;
  // Pad the y-domain a bit so the line never touches the plot's top/bottom edge.
  const yPad = ySpan * 0.15;
  const domainMin = yMin - yPad;
  const domainMax = yMax + yPad;

  const xAt = (i) => PAD.left + (points.length === 1 ? 0 : (i / (points.length - 1)) * plotW);
  const yAt = (v) => PAD.top + (1 - (v - domainMin) / (domainMax - domainMin)) * plotH;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.y).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${xAt(points.length - 1).toFixed(1)} ${(PAD.top + plotH).toFixed(1)} L ${xAt(0).toFixed(1)} ${(PAD.top + plotH).toFixed(1)} Z`;

  const last = points[points.length - 1];
  const hovered = hoverIdx != null ? points[hoverIdx] : null;

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(frac * (points.length - 1));
    setHoverIdx(idx);
  };

  const gridSteps = [domainMin + (domainMax - domainMin) * 0.15, domainMin + (domainMax - domainMin) * 0.85];
  const tooltipRight = hoverIdx != null && hoverIdx > points.length * 0.65;

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={ariaLabel || `Trend from ${formatValue(points[0].y)} to ${formatValue(last.y)}`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridSteps.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} x2={VIEW_W - PAD.right} y1={yAt(v)} y2={yAt(v)} stroke={C.bord} strokeWidth="1" />
            <text x={PAD.left} y={yAt(v) - 5} fontSize="10" fill={C.mut} fontFamily={MONO}>
              {formatValue(v)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${gradId})`} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {hovered && (
          <line
            x1={xAt(hoverIdx)}
            x2={xAt(hoverIdx)}
            y1={PAD.top}
            y2={PAD.top + plotH}
            stroke={C.bordStrong}
            strokeWidth="1"
          />
        )}

        {/* End-point direct label — the one value worth calling out; every
           other point is reachable via hover/focus, not printed inline. */}
        <circle cx={xAt(points.length - 1)} cy={yAt(last.y)} r="5" fill={color} stroke={C.surf} strokeWidth="2" />
        {hovered && (
          <circle cx={xAt(hoverIdx)} cy={yAt(hovered.y)} r="5" fill={color} stroke={C.surf} strokeWidth="2" />
        )}

        <text x={PAD.left} y={height - 4} fontSize="10" fill={C.mut}>
          {formatX(points[0].x)}
        </text>
        <text x={VIEW_W - PAD.right} y={height - 4} fontSize="10" fill={C.mut} textAnchor="end">
          {formatX(last.x)}
        </text>
      </svg>

      {hovered && (
        <div
          role="status"
          style={{
            position: "absolute",
            top: "4px",
            left: `${(xAt(hoverIdx) / VIEW_W) * 100}%`,
            transform: tooltipRight ? "translateX(calc(-100% - 6px))" : "translateX(6px)",
            background: C.glass,
            backdropFilter: "blur(12px)",
            border: `1px solid ${C.bord}`,
            borderRadius: RADIUS.sm,
            padding: "6px 9px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontSize: "11px",
          }}
        >
          <div style={{ color: C.mut, marginBottom: "1px" }}>{formatX(hovered.x)}</div>
          <div style={{ color: C.text, fontWeight: 700, fontFamily: MONO }}>{formatValue(hovered.y)}</div>
        </div>
      )}
    </div>
  );
}

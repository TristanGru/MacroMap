import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { PriceData } from "@/lib/types";

export interface DisruptionMarker {
  date: string;   // YYYY-MM-DD
  label: string;  // short chokepoint name
}

interface PriceChartProps {
  brent: PriceData | null;
  wti: PriceData | null;
  disruptionMarkers?: DisruptionMarker[];
}

interface ChartDataPoint {
  date: string;
  brent?: number;
  wti?: number;
}

function mergeHistory(brent: PriceData | null, wti: PriceData | null): ChartDataPoint[] {
  const dateMap = new Map<string, ChartDataPoint>();

  if (brent) {
    for (const pt of brent.history30d) {
      dateMap.set(pt.date, { date: pt.date, brent: pt.price });
    }
  }
  if (wti) {
    for (const pt of wti.history30d) {
      const existing = dateMap.get(pt.date) ?? { date: pt.date };
      dateMap.set(pt.date, { ...existing, wti: pt.price });
    }
  }

  return Array.from(dateMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function PriceChart({ brent, wti, disruptionMarkers = [] }: PriceChartProps) {
  const [expanded, setExpanded] = useState(false);
  const data = mergeHistory(brent, wti);

  const collapsedHeight = 40;
  const expandedHeight = 200;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(600px, calc(100vw - 32px))",
        background: "rgba(10, 15, 30, 0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--color-border)",
        borderBottom: "none",
        borderRadius: "8px 8px 0 0",
        overflow: "hidden",
        height: expanded ? `${expandedHeight}px` : `${collapsedHeight}px`,
        transition: "height 200ms ease-out",
        zIndex: 40,
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          height: `${collapsedHeight}px`,
          background: "transparent",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          cursor: "pointer",
          color: "var(--color-text-muted)",
          flexShrink: 0,
        }}
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} Brent/WTI 30-day price chart`}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            color: "var(--color-text-muted)",
          }}
        >
          Brent/WTI 30d
        </span>
        {brent && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              color: "var(--color-text-data)",
            }}
          >
            ${brent.current.toFixed(0)}
          </span>
        )}
        <span style={{ fontSize: "10px" }}>{expanded ? "▼" : "▲"}</span>
      </button>

      {/* Chart */}
      {expanded && (
        <div style={{ height: `${expandedHeight - collapsedHeight}px`, padding: "0 8px 8px" }}>
          {data.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "13px",
                color: "var(--color-text-muted)",
              }}
            >
              Price history unavailable
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fill: "#6b7280",
                  }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fill: "#6b7280",
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "12px",
                    color: "var(--color-text)",
                  }}
                  labelFormatter={(label) => typeof label === "string" ? formatDate(label) : String(label)}
                  formatter={(value) => {
                    const num = typeof value === "number" ? value : parseFloat(String(value));
                    return [`$${isNaN(num) ? "—" : num.toFixed(2)}`, ""] as [string, string];
                  }}
                />
                {disruptionMarkers.map((m) => (
                  <ReferenceLine
                    key={m.date + m.label}
                    x={m.date}
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="4 2"
                    label={{
                      value: m.label,
                      position: "insideTopRight",
                      fill: "#ef4444",
                      fontSize: 9,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="brent"
                  name="Brent"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="wti"
                  name="WTI"
                  stroke="#60a5fa"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}

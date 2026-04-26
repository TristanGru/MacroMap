import React from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import type { RiskTimelineEntry, DisruptionState } from "@/lib/types";

interface RiskTimelineProps {
  entries: RiskTimelineEntry[];
}

const STATE_VALUE: Record<DisruptionState, number> = {
  clean: 0,
  unknown: 0.3,
  stressed: 1,
  disrupted: 2,
};

export default function RiskTimeline({ entries }: RiskTimelineProps) {
  if (entries.length === 0) {
    return (
      <div
        style={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "11px",
          color: "var(--color-text-dim)",
        }}
      >
        No history yet
      </div>
    );
  }

  const data = entries.map((e) => ({
    date: e.date,
    value: STATE_VALUE[e.state],
    state: e.state,
  }));

  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as { date: string; value: number; state: string };
            return (
              <div
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  color: "var(--color-text)",
                }}
              >
                {d.date}: {d.state.toUpperCase()}
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#ef4444"
          strokeWidth={1.5}
          fill="url(#riskGradient)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

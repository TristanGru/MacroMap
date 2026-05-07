import React from "react";

type LegendDotTone =
  | "clean"
  | "elevated"
  | "stressed"
  | "disrupted"
  | "unknown"
  | "origin"
  | "destination"
  | "hub"
  | "conflict"
  | "disaster";

const DOT_COLORS: Record<LegendDotTone, string> = {
  clean: "var(--color-clean)",
  elevated: "var(--color-elevated)",
  stressed: "var(--color-stressed)",
  disrupted: "var(--color-disrupted)",
  unknown: "var(--color-unknown)",
  origin: "#f59e0b",
  destination: "#60a5fa",
  hub: "#14b8a6",
  conflict: "#ef4444",
  disaster: "#f97316",
};

function LegendDot({
  tone,
  ring = false,
}: {
  tone: LegendDotTone;
  ring?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        flexShrink: 0,
        background: ring ? "transparent" : DOT_COLORS[tone],
        border: ring ? `2px solid ${DOT_COLORS[tone]}` : "1px solid rgba(255,255,255,0.3)",
        boxShadow: ring ? `0 0 0 3px color-mix(in srgb, ${DOT_COLORS[tone]} 18%, transparent)` : "none",
      }}
    />
  );
}

function DisasterLegendIcon({
  icon,
  tone = "disaster",
}: {
  icon: string;
  tone?: Extract<LegendDotTone, "disaster" | "unknown">;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text)",
        fontSize: "11px",
        lineHeight: 1,
        background: "rgba(249, 115, 22, 0.14)",
        border: `2px solid ${DOT_COLORS[tone]}`,
        boxShadow: `0 0 0 3px color-mix(in srgb, ${DOT_COLORS[tone]} 16%, transparent)`,
      }}
    >
      {icon}
    </span>
  );
}

function ElevatedTrafficIcon() {
  return <LegendDot tone="elevated" />;
}

function LegendRow({
  marker,
  label,
  compact = false,
}: {
  marker: React.ReactNode;
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? "10px" : "12px",
        minHeight: compact ? "20px" : "24px",
        minWidth: 0,
      }}
    >
      <span
        style={{
          width: compact ? "18px" : "20px",
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {marker}
      </span>
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: compact ? "11px" : "12px",
          color: "var(--color-text-muted)",
          lineHeight: 1.25,
          whiteSpace: compact ? "nowrap" : "normal",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: "10px",
        marginBottom: "5px",
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: "10px",
        fontWeight: 600,
        color: "var(--color-text-dim)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      {children}
    </div>
  );
}

export default function MapLegend() {
  const compact = typeof window !== "undefined" && window.innerWidth <= 700;
  const rows = [
    { group: "Chokepoints", marker: <LegendDot tone="clean" />, label: "Clean" },
    { group: "Chokepoints", marker: <ElevatedTrafficIcon />, label: "Elevated traffic" },
    { group: "Chokepoints", marker: <LegendDot tone="stressed" />, label: "Stressed" },
    { group: "Chokepoints", marker: <LegendDot tone="disrupted" />, label: "Disrupted" },
    { group: "Chokepoints", marker: <LegendDot tone="unknown" />, label: "Monitoring" },
    { group: "Ports", marker: <LegendDot tone="origin" />, label: "Origin" },
    { group: "Ports", marker: <LegendDot tone="destination" />, label: "Destination" },
    { group: "Ports", marker: <LegendDot tone="hub" />, label: "Hub" },
    { group: "Events", marker: <LegendDot tone="conflict" ring />, label: "Conflict" },
    { group: "Events", marker: <DisasterLegendIcon icon="≋" />, label: "Earthquake" },
    { group: "Events", marker: <DisasterLegendIcon icon="🌩" />, label: "Storm" },
    { group: "Events", marker: <DisasterLegendIcon icon="🔥" />, label: "Wildfire" },
  ];

  return (
    <aside
      aria-label="Map icon legend"
      style={{
        position: "fixed",
        right: compact ? "16px" : "16px",
        left: compact ? "16px" : "auto",
        top: compact ? "150px" : "62px",
        width: compact ? "auto" : "190px",
        zIndex: 52,
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid var(--color-border)",
        background: "rgba(10, 15, 30, 0.92)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "11px",
        fontWeight: 600,
        color: "var(--color-text)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
      >
        Map Legend
      </div>

      {compact ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "4px 12px",
            marginTop: "9px",
          }}
        >
          {rows.map((row) => (
            <LegendRow
              key={`${row.group}-${row.label}`}
              marker={row.marker}
              label={row.label}
              compact
            />
          ))}
        </div>
      ) : (
        <>
          <SectionLabel>Chokepoints</SectionLabel>
          {rows
            .filter((row) => row.group === "Chokepoints")
            .map((row) => (
              <LegendRow key={row.label} marker={row.marker} label={row.label} />
            ))}

          <SectionLabel>Ports</SectionLabel>
          {rows
            .filter((row) => row.group === "Ports")
            .map((row) => (
              <LegendRow key={row.label} marker={row.marker} label={row.label} />
            ))}

          <SectionLabel>Events</SectionLabel>
          {rows
            .filter((row) => row.group === "Events")
            .map((row) => (
              <LegendRow
                key={row.label}
                marker={row.marker}
                label={row.label === "Conflict" ? "Conflict event" : row.label}
              />
            ))}
        </>
      )}
    </aside>
  );
}

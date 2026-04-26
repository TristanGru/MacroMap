import React from "react";

interface MapLayerToggleProps {
  showCountryBorders: boolean;
  onToggleCountryBorders: () => void;
  feedOpen?: boolean;
}

export default function MapLayerToggle({
  showCountryBorders,
  onToggleCountryBorders,
  feedOpen = false,
}: MapLayerToggleProps) {
  const compact = typeof window !== "undefined" && window.innerWidth <= 700;
  return (
    <button
      type="button"
      onClick={onToggleCountryBorders}
      aria-pressed={showCountryBorders}
      aria-label={showCountryBorders ? "Hide country borders" : "Show country borders"}
      title={showCountryBorders ? "Hide country borders" : "Show country borders"}
      style={{
        position: "fixed",
        right: compact ? "16px" : feedOpen ? "376px" : "16px",
        top: compact ? "58px" : "58px",
        height: "34px",
        borderRadius: "8px",
        border: showCountryBorders ? "1px solid rgba(147, 197, 253, 0.48)" : "1px solid var(--color-border)",
        background: showCountryBorders ? "rgba(30, 64, 175, 0.58)" : "rgba(10, 15, 30, 0.92)",
        backdropFilter: "blur(12px)",
        color: "var(--color-text)",
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: "12px",
        fontWeight: 500,
        cursor: "pointer",
        zIndex: 59,
        padding: "0 10px",
        display: "flex",
        alignItems: "center",
        gap: "7px",
        transition: "right 250ms ease-out, background 150ms ease, border-color 150ms ease",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "18px",
          height: "10px",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.25)",
          background: showCountryBorders ? "#93c5fd" : "rgba(255,255,255,0.12)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: showCountryBorders ? "10px" : "2px",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: showCountryBorders ? "#0a0f1e" : "rgba(255,255,255,0.72)",
            transition: "left 150ms ease",
          }}
        />
      </span>
      Country borders
    </button>
  );
}

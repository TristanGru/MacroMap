import React from "react";

export default function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      role="status"
      aria-label="Loading Macro Map"
    >
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "24px",
            fontWeight: 600,
            color: "#ffffff",
            margin: "0 0 8px 0",
          }}
        >
          Macro Map
        </h1>
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "14px",
            color: "var(--color-text-muted)",
            margin: 0,
          }}
        >
          Loading live resource flows...
        </p>
      </div>

      {/* Indeterminate progress bar at bottom */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "var(--color-accent)",
            animation: "loading-bar 1.8s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

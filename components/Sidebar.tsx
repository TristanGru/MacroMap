import React, { useEffect, useRef } from "react";
import type { Chokepoint, ChokepointState } from "@/lib/types";
import ArticleRow from "./ArticleRow";

interface SidebarProps {
  chokepoint: Chokepoint | null;
  state: ChokepointState | null;
  onClose: () => void;
}

const STATE_LABELS: Record<string, string> = {
  clean: "CLEAN",
  stressed: "STRESSED",
  disrupted: "DISRUPTED",
  unknown: "UNKNOWN",
};

export default function Sidebar({ chokepoint, state, onClose }: SidebarProps) {
  const isOpen = chokepoint !== null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevOpenRef = useRef(false);

  // Focus close button when sidebar opens; restore focus on close
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setTimeout(() => closeButtonRef.current?.focus(), 300); // after slide-in
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  // Close on Esc
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const stateKey = state?.state ?? "unknown";

  return (
    <aside
      role="dialog"
      aria-modal={isOpen}
      aria-label={`${chokepoint?.name ?? "Chokepoint"} details`}
      aria-hidden={!isOpen}
      style={{
        position: "fixed",
        right: 0,
        top: "7.5vh",
        height: "85vh",
        width: "400px",
        background: "rgba(10, 15, 30, 0.92)",
        backdropFilter: "blur(12px)",
        borderLeft: "1px solid var(--color-border)",
        borderRadius: "12px 0 0 12px",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 250ms ease-out",
      }}
    >
      {chokepoint && (
        <>
          {/* Aerial photo header */}
          <div
            style={{
              position: "relative",
              height: "160px",
              flexShrink: 0,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <img
              src={chokepoint.photoPath}
              alt={`Aerial view of ${chokepoint.name}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close sidebar"
              style={{
                position: "absolute",
                top: "8px",
                right: "12px",
                width: "44px",
                height: "44px",
                border: "none",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "50%",
                color: "var(--color-text-muted)",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              ×
            </button>
          </div>

          {/* Header */}
          <div style={{ padding: "16px 16px 8px", flexShrink: 0 }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <h2
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                {chokepoint.name}
              </h2>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  color: `var(--color-${stateKey})`,
                  background: `color-mix(in srgb, var(--color-${stateKey}) 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, var(--color-${stateKey}) 40%, transparent)`,
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                {STATE_LABELS[stateKey]}
              </span>
            </div>
            {state && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  marginTop: "4px",
                }}
              >
                {state.articleCount} articles · updated{" "}
                {new Date(state.lastUpdatedAt).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Context card */}
          <div
            style={{
              padding: "0 16px 16px",
              flexShrink: 0,
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "14px",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {chokepoint.summary}
            </p>
          </div>

          {/* Articles */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
            }}
            className="sidebar-scroll"
          >
            <div
              style={{
                padding: "12px 16px 6px",
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Recent News
            </div>

            {state === null && (
              /* Skeleton rows */
              <>
                {[0, 1, 2].map((i) => (
                  <SkeletonRow key={i} />
                ))}
              </>
            )}

            {state !== null && state.articles.length === 0 && (
              <p
                style={{
                  padding: "16px",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "14px",
                  color: "var(--color-text-muted)",
                }}
              >
                No articles found for this chokepoint in the last 24 hours.
              </p>
            )}

            {state !== null &&
              state.articles.map((article, i) => (
                <ArticleRow
                  key={i}
                  article={article}
                  resourceType={chokepoint.resourceTypes[0]}
                />
              ))}
          </div>
        </>
      )}
    </aside>
  );
}

function SkeletonRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        height: "56px",
        borderBottom: "1px solid var(--color-border-subtle)",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "56px",
          borderRadius: "4px",
          background: "rgba(255,255,255,0.06)",
          flexShrink: 0,
          animation: "shimmer 1.5s infinite",
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: "10px",
            width: "60%",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "4px",
            marginBottom: "6px",
            animation: "shimmer 1.5s infinite",
          }}
        />
        <div
          style={{
            height: "10px",
            width: "90%",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "4px",
            animation: "shimmer 1.5s infinite 0.3s",
          }}
        />
      </div>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

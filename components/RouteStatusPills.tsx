import React, { KeyboardEvent, useRef, useState } from "react";
import type { RouteStatus } from "@/lib/types";

const ROUTE_STATUSES: RouteStatus[] = ["primary", "diversion", "planned", "historical"];

const STATUS_LABELS: Record<RouteStatus, string> = {
  primary: "Primary",
  diversion: "Diversion",
  planned: "Planned",
  historical: "Historical",
};

const STATUS_COLORS: Record<RouteStatus, string> = {
  primary: "#ffffff",
  diversion: "#f59e0b",
  planned: "#60a5fa",
  historical: "#a78bfa",
};

interface RouteStatusPillsProps {
  activeStatuses: RouteStatus[];
  onStatusChange: (newStatuses: RouteStatus[]) => void;
}

export default function RouteStatusPills({
  activeStatuses,
  onStatusChange,
}: RouteStatusPillsProps) {
  const compact = typeof window !== "undefined" && window.innerWidth <= 700;
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState(0);

  const toggle = (status: RouteStatus) => {
    if (activeStatuses.includes(status)) {
      onStatusChange(activeStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...activeStatuses, status]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    let next = idx;
    if (e.key === "ArrowRight") {
      next = (idx + 1) % ROUTE_STATUSES.length;
    } else if (e.key === "ArrowLeft") {
      next = (idx - 1 + ROUTE_STATUSES.length) % ROUTE_STATUSES.length;
    } else {
      return;
    }
    e.preventDefault();
    setFocusIdx(next);
    pillRefs.current[next]?.focus();
  };

  return (
    <nav
      aria-label="Filter by route status"
      style={{
        position: "fixed",
        bottom: compact ? "56px" : "58px",
        right: "16px",
        left: compact ? "16px" : "auto",
        display: "flex",
        gap: "6px",
        alignItems: "center",
        justifyContent: compact ? "flex-start" : "flex-end",
        zIndex: 50,
        flexWrap: "wrap",
        maxWidth: compact ? "calc(100vw - 32px)" : "360px",
      }}
    >
      {ROUTE_STATUSES.map((status, idx) => {
        const active = activeStatuses.includes(status);
        const color = STATUS_COLORS[status];
        return (
          <button
            key={status}
            ref={(el) => { pillRefs.current[idx] = el; }}
            onClick={() => toggle(status)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            tabIndex={idx === focusIdx ? 0 : -1}
            aria-pressed={active}
            aria-label={`${STATUS_LABELS[status]} routes ${active ? "visible" : "hidden"}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: active ? "6px" : "0",
              padding: "6px 12px",
              minHeight: "34px",
              borderRadius: "17px",
              border: active ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.12)",
              background: active ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
              color: active ? "#ffffff" : "var(--color-text-muted)",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            {active && (
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: color,
                  flexShrink: 0,
                }}
              />
            )}
            {STATUS_LABELS[status]}
          </button>
        );
      })}
    </nav>
  );
}

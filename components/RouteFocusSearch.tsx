import React, { useMemo, useState } from "react";
import type { RouteFocusTarget } from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";
import { PORTS } from "@/data/ports";
import { ROUTES } from "@/data/routes";

interface RouteFocusSearchProps {
  selectedTarget: RouteFocusTarget | null;
  onTargetChange: (target: RouteFocusTarget | null) => void;
  onResetView: () => void;
}

interface SearchItem extends RouteFocusTarget {
  routeCount: number;
  detail: string;
}

function coordKey(coord: [number, number]): string {
  return `${coord[0].toFixed(2)},${coord[1].toFixed(2)}`;
}

function countPortRoutes(portId: string): number {
  const port = PORTS.find((p) => p.id === portId);
  if (!port) return 0;
  const key = coordKey(port.coordinates);
  return ROUTES.filter((route) => route.waypoints.some((coord) => coordKey(coord) === key)).length;
}

function countChokepointRoutes(chokepointId: string): number {
  return ROUTES.filter((route) => route.chokepointIds.includes(chokepointId)).length;
}

export default function RouteFocusSearch({
  selectedTarget,
  onTargetChange,
  onResetView,
}: RouteFocusSearchProps) {
  const compact = typeof window !== "undefined" && window.innerWidth <= 700;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const items = useMemo<SearchItem[]>(() => {
    const chokepoints = CHOKEPOINTS.map((cp) => ({
      kind: "chokepoint" as const,
      id: cp.id,
      name: cp.name,
      routeCount: countChokepointRoutes(cp.id),
      detail: "Strait / canal",
    }));

    const ports = PORTS.map((port) => ({
      kind: "port" as const,
      id: port.id,
      name: port.name,
      routeCount: countPortRoutes(port.id),
      detail: port.portType === "origin" ? "Origin" : port.portType === "destination" ? "Destination" : "Hub",
    }));

    return [...chokepoints, ...ports]
      .filter((item) => item.routeCount > 0)
      .sort((a, b) => b.routeCount - a.routeCount || a.name.localeCompare(b.name));
  }, []);

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items.slice(0, 12);
    return items
      .filter((item) =>
        item.name.toLowerCase().includes(needle) ||
        item.id.toLowerCase().includes(needle) ||
        item.detail.toLowerCase().includes(needle)
      )
      .slice(0, 12);
  }, [items, query]);

  const selectItem = (item: SearchItem) => {
    onTargetChange({ kind: item.kind, id: item.id, name: item.name });
    setQuery(item.name);
    setOpen(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: compact ? "104px" : "16px",
        left: compact ? "16px" : "50%",
        transform: compact ? "none" : "translateX(-50%)",
        width: compact ? "calc(100vw - 32px)" : "min(360px, calc(100vw - 32px))",
        zIndex: 70,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search ports and straits"
          aria-label="Search ports and straits to highlight associated routes"
          style={{
            width: "100%",
            height: "38px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            background: "rgba(10, 15, 30, 0.92)",
            color: "var(--color-text)",
            outline: "none",
            padding: selectedTarget ? "0 122px 0 12px" : "0 72px 0 12px",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "13px",
            backdropFilter: "blur(12px)",
            boxSizing: "border-box",
          }}
        />
        {selectedTarget && (
          <button
            type="button"
            onClick={() => {
              onTargetChange(null);
              setQuery("");
              setOpen(false);
            }}
            aria-label="Clear route highlight"
            style={{
              position: "absolute",
              right: "6px",
              top: "6px",
              height: "26px",
              padding: "0 9px",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.08)",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "12px",
            }}
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(false);
            onResetView();
          }}
          aria-label="Reset globe view"
          style={{
            position: "absolute",
            right: selectedTarget ? "62px" : "6px",
            top: "6px",
            height: "26px",
            padding: "0 9px",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.08)",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "12px",
          }}
        >
          Reset
        </button>
      </div>

      {selectedTarget && (
        <div
          style={{
            marginTop: "6px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(10, 15, 30, 0.82)",
            color: "var(--color-text)",
            padding: "6px 8px",
            fontSize: "12px",
            backdropFilter: "blur(12px)",
          }}
        >
          <span style={{ color: "var(--color-text-muted)" }}>
            {selectedTarget.kind === "chokepoint" ? "Strait" : "Port"}
          </span>
          <span>{selectedTarget.name}</span>
        </div>
      )}

      {open && (
        <div
          role="listbox"
          style={{
            marginTop: "6px",
            maxHeight: "330px",
            overflowY: "auto",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            background: "rgba(10, 15, 30, 0.96)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
          }}
        >
          {visibleItems.length === 0 ? (
            <div
              style={{
                padding: "12px",
                color: "var(--color-text-muted)",
                fontSize: "12px",
              }}
            >
              No matching port or strait
            </div>
          ) : (
            visibleItems.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                role="option"
                aria-selected={selectedTarget?.kind === item.kind && selectedTarget.id === item.id}
                onClick={() => selectItem(item)}
                style={{
                  width: "100%",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  border: 0,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background:
                    selectedTarget?.kind === item.kind && selectedTarget.id === item.id
                      ? "rgba(255,255,255,0.12)"
                      : "transparent",
                  color: "var(--color-text)",
                  padding: "8px 10px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      display: "block",
                      marginTop: "2px",
                      color: "var(--color-text-muted)",
                      fontSize: "11px",
                    }}
                  >
                    {item.detail}
                  </span>
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    color: "var(--color-text-muted)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                  }}
                >
                  {item.routeCount}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

import React, { useRef, useState, KeyboardEvent } from "react";
import type { ResourceType } from "@/lib/types";
import dynamic from "next/dynamic";

const MaterialCard = dynamic(() => import("./MaterialCard"), { ssr: false });

const RESOURCE_TYPES: ResourceType[] = [
  "oil", "gas", "lng", "container", "copper", "grain", "coal",
  "lithium", "cobalt", "rare-earth", "strategic-metals", "iron-ore", "uranium", "fertilizer",
];

const RESOURCE_LABELS: Record<ResourceType, string> = {
  oil: "Oil",
  gas: "Gas",
  lng: "LNG",
  container: "Shipping",
  copper: "Copper",
  grain: "Grain",
  coal: "Coal",
  lithium: "Lithium",
  cobalt: "Cobalt",
  "rare-earth": "Rare Earths",
  "strategic-metals": "Strategic Metals",
  "iron-ore": "Iron Ore",
  uranium: "Uranium",
  fertilizer: "Fertilizers",
};

interface FilterPillsProps {
  activeFilters: ResourceType[];
  onFilterChange: (newFilters: ResourceType[]) => void;
}

export default function FilterPills({ activeFilters, onFilterChange }: FilterPillsProps) {
  const compact = typeof window !== "undefined" && window.innerWidth <= 700;
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState(0);
  const [infoOpen, setInfoOpen] = useState<ResourceType | null>(null);
  const [hoveredType, setHoveredType] = useState<ResourceType | null>(null);

  const toggle = (type: ResourceType) => {
    if (activeFilters.includes(type)) {
      onFilterChange(activeFilters.filter((t) => t !== type));
    } else {
      onFilterChange([...activeFilters, type]);
    }
  };

  const allSelected = activeFilters.length === RESOURCE_TYPES.length;

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    let next = idx;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      next = (idx + 1) % RESOURCE_TYPES.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      next = (idx - 1 + RESOURCE_TYPES.length) % RESOURCE_TYPES.length;
    } else if (e.key === "Escape") {
      setInfoOpen(null);
      return;
    } else {
      return;
    }
    e.preventDefault();
    setFocusIdx(next);
    pillRefs.current[next]?.focus();
  };

  return (
    <>
      <nav
        aria-label="Filter by resource type"
        style={{
          position: "fixed",
          top: compact ? "326px" : "500px",
          bottom: compact ? "116px" : "104px",
          right: "16px",
          left: compact ? "16px" : "auto",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          alignItems: "stretch",
          justifyContent: "flex-start",
          zIndex: 50,
          width: compact ? "auto" : "190px",
          maxWidth: compact ? "calc(100vw - 32px)" : "190px",
          overflowY: "auto",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid var(--color-border)",
          background: "rgba(10, 15, 30, 0.92)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
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
            marginBottom: "3px",
          }}
        >
          Commodities
        </div>
        <button
          onClick={() => onFilterChange([...RESOURCE_TYPES])}
          aria-pressed={allSelected}
          aria-label="Select all resource routes"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            minHeight: "36px",
            padding: "6px 10px",
            borderRadius: "6px",
            border: allSelected ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(255,255,255,0.14)",
            background: allSelected ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)",
            color: allSelected ? "#ffffff" : "var(--color-text-muted)",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
          }}
        >
          <span>All</span>
          <span
            aria-hidden="true"
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: allSelected ? "#ffffff" : "rgba(255,255,255,0.24)",
            }}
          />
        </button>
        {RESOURCE_TYPES.map((type, idx) => {
          const active = activeFilters.includes(type);
          const showingInfo = infoOpen === type;
          const hovered = hoveredType === type;

          return (
            <div
              key={type}
              style={{ position: "relative", display: "flex", width: "100%" }}
              onMouseEnter={() => setHoveredType(type)}
              onMouseLeave={() => setHoveredType(null)}
            >
              <button
                ref={(el) => { pillRefs.current[idx] = el; }}
                onClick={() => toggle(type)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                tabIndex={idx === focusIdx ? 0 : -1}
                aria-pressed={active}
                aria-label={`${RESOURCE_LABELS[type]} routes ${active ? "visible" : "hidden"}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  gap: "6px",
                  padding: "6px 30px 6px 10px",
                  minHeight: "32px",
                  borderRadius: "6px",
                  border: showingInfo
                    ? `1px solid rgba(255,255,255,0.4)`
                    : active
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "1px solid rgba(255,255,255,0.12)",
                  background: showingInfo
                    ? "rgba(255,255,255,0.18)"
                    : active
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                  color: active ? "#ffffff" : "var(--color-text-muted)",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: `var(--color-${type})`,
                    flexShrink: 0,
                    opacity: active ? 1 : 0.35,
                  }}
                />
                {RESOURCE_LABELS[type]}
              </button>

              {/* ⓘ info button — appears on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInfoOpen(infoOpen === type ? null : type);
                }}
                aria-label={`Learn about ${RESOURCE_LABELS[type]}`}
                aria-expanded={showingInfo}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  padding: "2px",
                  cursor: "pointer",
                  color: showingInfo
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.35)",
                  fontSize: "13px",
                  lineHeight: 1,
                  opacity: hovered || showingInfo ? 1 : 0,
                  transition: "opacity 150ms ease, color 150ms ease",
                  pointerEvents: hovered || showingInfo ? "auto" : "none",
                }}
              >
                ⓘ
              </button>
            </div>
          );
        })}
      </nav>

      {/* Material info card */}
      {infoOpen && (
        <MaterialCard
          resourceType={infoOpen}
          onClose={() => setInfoOpen(null)}
        />
      )}
    </>
  );
}

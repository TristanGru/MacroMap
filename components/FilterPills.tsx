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
    if (e.key === "ArrowRight") {
      next = (idx + 1) % RESOURCE_TYPES.length;
    } else if (e.key === "ArrowLeft") {
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
          bottom: compact ? "186px" : "204px",
          right: "16px",
          left: compact ? "16px" : "auto",
          display: "flex",
          gap: "6px",
          alignItems: "flex-end",
          justifyContent: compact ? "flex-start" : "flex-end",
          zIndex: 50,
          flexWrap: "wrap",
          maxWidth: compact ? "calc(100vw - 32px)" : "360px",
          maxHeight: compact ? "170px" : "none",
          overflowY: compact ? "auto" : "visible",
          paddingBottom: compact ? "2px" : 0,
        }}
      >
        <button
          onClick={() => onFilterChange([...RESOURCE_TYPES])}
          aria-pressed={allSelected}
          aria-label="Select all resource routes"
          style={{
            display: "flex",
            alignItems: "center",
            minHeight: "36px",
            padding: "6px 12px",
            borderRadius: "18px",
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
          All
        </button>
        {RESOURCE_TYPES.map((type, idx) => {
          const active = activeFilters.includes(type);
          const showingInfo = infoOpen === type;
          const hovered = hoveredType === type;

          return (
            <div
              key={type}
              style={{ position: "relative", display: "inline-flex" }}
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
                  gap: "6px",
                  padding: "6px 28px 6px 12px",
                  minHeight: "36px",
                  borderRadius: "18px",
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
                    opacity: active ? 1 : 0,
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

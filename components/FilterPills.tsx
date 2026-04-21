import React, { useRef, useState, KeyboardEvent } from "react";
import type { ResourceType } from "@/lib/types";
import dynamic from "next/dynamic";

const MaterialCard = dynamic(() => import("./MaterialCard"), { ssr: false });

const RESOURCE_TYPES: ResourceType[] = [
  "oil", "gas", "lng", "container", "copper", "grain", "coal",
  "lithium", "rare-earth", "iron-ore", "uranium", "fertilizer",
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
  "rare-earth": "Rare Earths",
  "iron-ore": "Iron Ore",
  uranium: "Uranium",
  fertilizer: "Fertilizers",
};

interface FilterPillsProps {
  activeFilters: ResourceType[];
  onFilterChange: (newFilters: ResourceType[]) => void;
}

export default function FilterPills({ activeFilters, onFilterChange }: FilterPillsProps) {
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState(0);
  const [infoOpen, setInfoOpen] = useState<ResourceType | null>(null);

  const toggle = (type: ResourceType) => {
    if (infoOpen === type) {
      // second click on same pill: close info card
      setInfoOpen(null);
      return;
    }
    if (activeFilters.includes(type)) {
      if (activeFilters.length === 1) {
        // only pill active: open info card instead of deselecting
        setInfoOpen(type);
        return;
      }
      onFilterChange(activeFilters.filter((t) => t !== type));
      setInfoOpen(null);
    } else {
      onFilterChange([...activeFilters, type]);
      setInfoOpen(type);
    }
  };

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
          bottom: "130px",
          right: "16px",
          display: "flex",
          gap: "6px",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          zIndex: 50,
          flexWrap: "wrap",
          maxWidth: "360px",
        }}
      >
        {RESOURCE_TYPES.map((type, idx) => {
          const active = activeFilters.includes(type);
          const showingInfo = infoOpen === type;
          return (
            <button
              key={type}
              ref={(el) => { pillRefs.current[idx] = el; }}
              onClick={() => toggle(type)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              tabIndex={idx === focusIdx ? 0 : -1}
              aria-pressed={active}
              aria-expanded={showingInfo}
              aria-label={`${RESOURCE_LABELS[type]} routes ${active ? "visible" : "hidden"}. Press to learn more.`}
              title={`Click to toggle. Click again to learn about ${RESOURCE_LABELS[type]}.`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: active ? "6px" : "0",
                padding: "6px 12px",
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
                transition: "all 150ms ease",
              }}
            >
              {active && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: `var(--color-${type})`,
                    flexShrink: 0,
                  }}
                />
              )}
              {RESOURCE_LABELS[type]}
            </button>
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

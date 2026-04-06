import React, { useRef, KeyboardEvent } from "react";
import type { ResourceType } from "@/lib/types";

const RESOURCE_TYPES: ResourceType[] = [
  "oil", "gas", "lng", "container", "copper", "grain", "coal",
];

const RESOURCE_LABELS: Record<ResourceType, string> = {
  oil: "Oil",
  gas: "Gas",
  lng: "LNG",
  container: "Container",
  copper: "Copper",
  grain: "Grain",
  coal: "Coal",
};

interface FilterPillsProps {
  activeFilters: ResourceType[];
  onFilterChange: (newFilters: ResourceType[]) => void;
}

export default function FilterPills({ activeFilters, onFilterChange }: FilterPillsProps) {
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = React.useState(0);

  const toggle = (type: ResourceType) => {
    if (activeFilters.includes(type)) {
      // Don't allow deselecting all
      if (activeFilters.length === 1) return;
      onFilterChange(activeFilters.filter((t) => t !== type));
    } else {
      onFilterChange([...activeFilters, type]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    let next = idx;
    if (e.key === "ArrowRight") {
      next = (idx + 1) % RESOURCE_TYPES.length;
    } else if (e.key === "ArrowLeft") {
      next = (idx - 1 + RESOURCE_TYPES.length) % RESOURCE_TYPES.length;
    } else {
      return;
    }
    e.preventDefault();
    setFocusIdx(next);
    pillRefs.current[next]?.focus();
  };

  return (
    <nav
      aria-label="Filter by resource type"
      style={{
        position: "fixed",
        bottom: "60px", // above price chart collapsed state
        left: "16px",
        display: "flex",
        gap: "8px",
        alignItems: "center",
        zIndex: 50,
        flexWrap: "wrap",
        maxWidth: "420px",
      }}
    >
      {RESOURCE_TYPES.map((type, idx) => {
        const active = activeFilters.includes(type);
        return (
          <button
            key={type}
            ref={(el) => { pillRefs.current[idx] = el; }}
            onClick={() => toggle(type)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            tabIndex={idx === focusIdx ? 0 : -1}
            aria-pressed={active}
            aria-label={`${RESOURCE_LABELS[type]} routes ${active ? "visible" : "hidden"}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: active ? "6px" : "0",
              padding: "8px 14px",
              minHeight: "44px",
              borderRadius: "20px",
              border: active
                ? "1px solid rgba(255,255,255,0.2)"
                : "1px solid rgba(255,255,255,0.15)",
              background: active ? "rgba(255,255,255,0.12)" : "transparent",
              color: active ? "#ffffff" : "var(--color-text-muted)",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "13px",
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
  );
}

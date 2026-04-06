import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { toast } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingScreen from "@/components/LoadingScreen";
import type { DisruptionStateCache, Chokepoint, ResourceType, DisruptionState } from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";
import { ROUTES } from "@/data/routes";

// Cesium must be dynamically imported (browser-only)
const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });
const Sidebar = dynamic(() => import("@/components/Sidebar"), { ssr: false });
const PriceTicker = dynamic(() => import("@/components/PriceTicker"), { ssr: false });
const FilterPills = dynamic(() => import("@/components/FilterPills"), { ssr: false });
const PriceChart = dynamic(() => import("@/components/PriceChart"), { ssr: false });
const OnboardingTooltip = dynamic(() => import("@/components/OnboardingTooltip"), { ssr: false });

const ALL_RESOURCE_TYPES: ResourceType[] = [
  "oil", "gas", "lng", "container", "copper", "grain", "coal",
];

function parseFilterParam(param: string | undefined): ResourceType[] {
  if (!param) return ALL_RESOURCE_TYPES;
  const types = param.split(",").filter((t): t is ResourceType =>
    ALL_RESOURCE_TYPES.includes(t as ResourceType)
  );
  return types.length > 0 ? types : ALL_RESOURCE_TYPES;
}

export default function Home() {
  const router = useRouter();
  const [globeReady, setGlobeReady] = useState(false);
  const [cache, setCache] = useState<DisruptionStateCache | null>(null);
  const [selectedChokepoint, setSelectedChokepoint] = useState<Chokepoint | null>(null);
  const [activeFilters, setActiveFilters] = useState<ResourceType[]>(ALL_RESOURCE_TYPES);
  const [toastsShown, setToastsShown] = useState(false);

  // Parse filter from URL on mount
  useEffect(() => {
    if (!router.isReady) return;
    const types = parseFilterParam(router.query.types as string | undefined);
    setActiveFilters(types);
  }, [router.isReady, router.query.types]);

  // Fetch disruption states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch("/api/disruption-states");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DisruptionStateCache = await res.json();
        setCache(data);
      } catch (err) {
        console.error("[index] Failed to fetch disruption states:", err);
      }
    };
    fetchStates();
  }, []);

  // Show state-change toasts on cache update
  useEffect(() => {
    if (!cache || toastsShown) return;
    const prev = cache.previousStates;
    if (!prev || Object.keys(prev).length === 0) return;

    for (const [id, prevState] of Object.entries(prev)) {
      const current = cache.chokepoints[id]?.state;
      if (!current || current === prevState) continue;

      const cp = CHOKEPOINTS.find((c) => c.id === id);
      const name = cp?.name ?? id;

      const stateColors: Record<DisruptionState, string> = {
        clean: "#22c55e",
        stressed: "#f59e0b",
        disrupted: "#ef4444",
        unknown: "#6b7280",
      };

      let message = "";
      if (current === "disrupted") message = `${name} escalated to DISRUPTED`;
      else if (current === "stressed") message = `${name} now STRESSED`;
      else if (current === "clean") message = `${name} returned to clean`;
      else continue;

      toast(message, {
        style: {
          borderLeft: `4px solid ${stateColors[current]}`,
        },
      });
    }
    setToastsShown(true);
  }, [cache, toastsShown]);

  const handleFilterChange = useCallback(
    (newFilters: ResourceType[]) => {
      setActiveFilters(newFilters);
      const all = newFilters.length === ALL_RESOURCE_TYPES.length;
      router.replace(
        all ? "/" : `/?types=${newFilters.join(",")}`,
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  const handleChokepointClick = useCallback((cp: Chokepoint) => {
    setSelectedChokepoint(cp);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSelectedChokepoint(null);
  }, []);

  // Visible routes (for empty state check)
  const visibleRoutes = ROUTES.filter(
    (r) => activeFilters.includes(r.resourceType)
  );

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#000000" }}
      role="main"
      aria-label="Interactive globe showing resource flow disruptions across 10 chokepoints"
    >
      {/* Loading screen — shown until globe is ready */}
      {!globeReady && <LoadingScreen />}

      {/* Globe */}
      <ErrorBoundary>
        <Globe
          cache={cache}
          activeFilters={activeFilters}
          onChokepointClick={handleChokepointClick}
          onGlobeReady={() => setGlobeReady(true)}
        />
      </ErrorBoundary>

      {/* Price ticker — fixed top-right */}
      {globeReady && cache && (
        <PriceTicker brent={cache.prices.brent} wti={cache.prices.wti} />
      )}

      {/* Filter pills — fixed bottom-left */}
      {globeReady && (
        <FilterPills activeFilters={activeFilters} onFilterChange={handleFilterChange} />
      )}

      {/* Price chart — collapsible bottom-center */}
      {globeReady && cache && (
        <PriceChart brent={cache.prices.brent} wti={cache.prices.wti} />
      )}

      {/* Sidebar — slide in from right on chokepoint click */}
      {globeReady && (
        <Sidebar
          chokepoint={selectedChokepoint}
          state={selectedChokepoint ? (cache?.chokepoints[selectedChokepoint.id] ?? null) : null}
          onClose={handleSidebarClose}
        />
      )}

      {/* Onboarding tooltip */}
      {globeReady && <OnboardingTooltip />}

      {/* Empty state when all routes filtered out */}
      {globeReady && visibleRoutes.length === 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "16px",
              color: "var(--color-text)",
              margin: "0 0 8px 0",
            }}
          >
            No active routes match your filter.
          </p>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "14px",
              color: "var(--color-text-muted)",
              margin: 0,
            }}
          >
            Try adding oil or gas to see the major chokepoints.
          </p>
        </div>
      )}

      {/* Hidden keyboard chokepoint nav (a11y) */}
      <nav className="sr-only" aria-label="Navigate chokepoints">
        <ul role="listbox" aria-label="Chokepoints">
          {[...CHOKEPOINTS]
            .sort((a, b) => b.strategicImportance - a.strategicImportance || a.name.localeCompare(b.name))
            .map((cp) => {
              const state = cache?.chokepoints[cp.id]?.state ?? "unknown";
              const count = cache?.chokepoints[cp.id]?.articleCount ?? 0;
              return (
                <li
                  key={cp.id}
                  role="option"
                  aria-selected={false}
                  tabIndex={0}
                  data-id={cp.id}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleChokepointClick(cp);
                    }
                  }}
                >
                  {cp.name} — {state.toUpperCase()} — {count} articles in last 24h
                </li>
              );
            })}
        </ul>
      </nav>
    </div>
  );
}

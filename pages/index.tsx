import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { toast } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingScreen from "@/components/LoadingScreen";
import type { SourceHealthState } from "@/components/DataSourcesPanel";
import type { DisruptionStateCache, Chokepoint, ResourceType, RouteStatus, RouteFocusTarget, DisruptionState, ConflictEvent, CommodityPrices, DisasterEvent, MacroSignal, NewsArticle } from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";
import { ROUTES } from "@/data/routes";
import { PORTS } from "@/data/ports";
import { COUNTRY_PROFILE_BY_ISO3, findCountryProfileByName } from "@/data/country-profiles";

// Globe uses Three.js canvas — browser-only
const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });
const Sidebar = dynamic(() => import("@/components/Sidebar"), { ssr: false });
const PortPanel = dynamic(() => import("@/components/PortPanel"), { ssr: false });
const MacroPanel = dynamic(() => import("@/components/MacroPanel"), { ssr: false });
const FilterPills = dynamic(() => import("@/components/FilterPills"), { ssr: false });
const RouteStatusPills = dynamic(() => import("@/components/RouteStatusPills"), { ssr: false });
const RouteFocusSearch = dynamic(() => import("@/components/RouteFocusSearch"), { ssr: false });
const DataSourcesPanel = dynamic(() => import("@/components/DataSourcesPanel"), { ssr: false });
const MapLayerToggle = dynamic(() => import("@/components/MapLayerToggle"), { ssr: false });
const MapLegend = dynamic(() => import("@/components/MapLegend"), { ssr: false });
const PriceChart = dynamic(() => import("@/components/PriceChart"), { ssr: false });
const OnboardingTooltip = dynamic(() => import("@/components/OnboardingTooltip"), { ssr: false });
const EventFeed = dynamic(() => import("@/components/EventFeed"), { ssr: false });
const CountryProfilePanel = dynamic(() => import("@/components/CountryProfilePanel"), { ssr: false });

const ALL_RESOURCE_TYPES: ResourceType[] = [
  "oil", "gas", "lng", "container", "copper", "grain", "coal",
  "lithium", "cobalt", "rare-earth", "strategic-metals", "iron-ore", "uranium", "fertilizer",
];

const ALL_ROUTE_STATUSES: RouteStatus[] = ["primary", "diversion", "planned", "historical"];
const DEFAULT_RESOURCE_TYPES: ResourceType[] = ["oil"];
const DEFAULT_ROUTE_STATUSES: RouteStatus[] = ["primary"];

interface SelectedCountry {
  iso3: string;
  name: string;
  bbox: [number, number, number, number] | null;
}

function parseFilterParam(param: string | undefined): ResourceType[] {
  if (!param) return DEFAULT_RESOURCE_TYPES;
  if (param.trim() === "") return [];
  const types = param.split(",").filter((t): t is ResourceType =>
    ALL_RESOURCE_TYPES.includes(t as ResourceType)
  );
  return types.length > 0 ? types : DEFAULT_RESOURCE_TYPES;
}

function parseStatusParam(param: string | undefined): RouteStatus[] {
  if (!param) return DEFAULT_ROUTE_STATUSES;
  const statuses = param.split(",").filter((s): s is RouteStatus =>
    ALL_ROUTE_STATUSES.includes(s as RouteStatus)
  );
  return statuses.length > 0 ? statuses : DEFAULT_ROUTE_STATUSES;
}

function parseFocusParam(param: string | undefined): RouteFocusTarget | null {
  if (!param) return null;
  const [kind, id] = param.split(":");
  if (kind === "chokepoint") {
    const cp = CHOKEPOINTS.find((item) => item.id === id);
    return cp ? { kind, id: cp.id, name: cp.name } : null;
  }
  if (kind === "port") {
    const port = PORTS.find((item) => item.id === id);
    return port ? { kind, id: port.id, name: port.name } : null;
  }
  return null;
}

function serializeFocusParam(target: RouteFocusTarget | null): string | null {
  return target ? `${target.kind}:${target.id}` : null;
}

export default function Home() {
  const router = useRouter();
  const [globeReady, setGlobeReady] = useState(false);
  const [cache, setCache] = useState<DisruptionStateCache | null>(null);
  const [selectedChokepoint, setSelectedChokepoint] = useState<Chokepoint | null>(null);
  const [routeFocus, setRouteFocus] = useState<RouteFocusTarget | null>(null);
  const [activeFilters, setActiveFilters] = useState<ResourceType[]>(DEFAULT_RESOURCE_TYPES);
  const [activeRouteStatuses, setActiveRouteStatuses] = useState<RouteStatus[]>(DEFAULT_ROUTE_STATUSES);
  const [toastsShown, setToastsShown] = useState(false);
  const [conflictEvents, setConflictEvents] = useState<ConflictEvent[]>([]);
  const [disasterEvents, setDisasterEvents] = useState<DisasterEvent[]>([]);
  const [macroNews, setMacroNews] = useState<NewsArticle[]>([]);
  const [commodityPrices, setCommodityPrices] = useState<CommodityPrices | null>(null);
  const [macroSignals, setMacroSignals] = useState<MacroSignal[]>([]);
  const [feedOpen, setFeedOpen] = useState(false);
  const [showCountryBorders, setShowCountryBorders] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [viewResetKey, setViewResetKey] = useState(0);
  const [sourceHealth, setSourceHealth] = useState<Record<string, SourceHealthState>>({
    risk: "loading",
    conflict: "loading",
    disasters: "loading",
    prices: "loading",
    macro: "loading",
  });

  // Fallback: dismiss loading screen after 8s if globe textures are slow
  useEffect(() => {
    const t = setTimeout(() => setGlobeReady(true), 8000);
    return () => clearTimeout(t);
  }, []);

  // Parse filters from URL.
  useEffect(() => {
    if (!router.isReady) return;
    const types = parseFilterParam(router.query.types as string | undefined);
    const statuses = parseStatusParam(router.query.statuses as string | undefined);
    setActiveFilters(types);
    setActiveRouteStatuses(statuses);
  }, [router.isReady, router.query.types, router.query.statuses]);

  // Parse route focus from URL only when the focus parameter changes. This keeps
  // material/status filter changes from reopening a previously closed panel.
  useEffect(() => {
    if (!router.isReady) return;
    const focus = parseFocusParam(router.query.focus as string | undefined);
    setRouteFocus(focus);
    setSelectedChokepoint(focus?.kind === "chokepoint"
      ? CHOKEPOINTS.find((cp) => cp.id === focus.id) ?? null
      : null);
  }, [router.isReady, router.query.focus]);

  // Fetch disruption states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch("/api/disruption-states");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DisruptionStateCache = await res.json();
        setCache(data);
        setSourceHealth((health) => ({ ...health, risk: "live" }));
      } catch (err) {
        console.error("[index] Failed to fetch disruption states:", err);
        setSourceHealth((health) => ({ ...health, risk: "error" }));
      }
    };
    fetchStates();
  }, []);

  // Fetch conflict events (ACLED)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/conflict-events");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setConflictEvents(data.events ?? []);
        setSourceHealth((health) => ({ ...health, conflict: "live" }));
      } catch {
        setSourceHealth((health) => ({ ...health, conflict: "error" }));
        // Non-fatal — conflict events are supplementary
      }
    };
    fetchEvents();
  }, []);

  // Fetch commodity prices (Oil Price API + BDI)
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/prices");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CommodityPrices = await res.json();
        setCommodityPrices(data);
        setSourceHealth((health) => ({ ...health, prices: "live" }));
      } catch {
        setSourceHealth((health) => ({ ...health, prices: "error" }));
        // Non-fatal — prices panel will show "--"
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60 * 60 * 1000); // re-poll every hour (matches Yahoo Finance cache TTL)
    return () => clearInterval(interval);
  }, []);

  // Fetch GDELT macro headlines for the feed
  useEffect(() => {
    const fetchMacroNews = async () => {
      try {
        const res = await fetch("/api/macro-news");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMacroNews(data.articles ?? []);
      } catch (err) {
        console.error("[index] Failed to fetch macro news:", err);
      }
    };
    fetchMacroNews();
  }, []);

  // Fetch disaster events (USGS + GDACS + FIRMS)
  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const res = await fetch("/api/disasters");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDisasterEvents(data.events ?? []);
        setSourceHealth((health) => ({ ...health, disasters: "live" }));
      } catch {
        setSourceHealth((health) => ({ ...health, disasters: "error" }));
        // Non-fatal
      }
    };
    fetchDisasters();
  }, []);

  // Fetch FRED macro signals
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const res = await fetch("/api/macro-signals");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MacroSignal[] = await res.json();
        setMacroSignals(data);
        setSourceHealth((health) => ({ ...health, macro: "live" }));
      } catch {
        setSourceHealth((health) => ({ ...health, macro: "error" }));
        // Non-fatal
      }
    };
    fetchSignals();
    const interval = setInterval(fetchSignals, 60 * 60 * 1000); // re-poll every hour (matches FRED cache TTL)
    return () => clearInterval(interval);
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
        elevated: "#06b6d4",
        stressed: "#f59e0b",
        disrupted: "#ef4444",
        unknown: "#6b7280",
      };

      let message = "";
      if (current === "disrupted") message = `${name} escalated to DISRUPTED`;
      else if (current === "stressed") message = `${name} now STRESSED`;
      else if (current === "elevated") message = `${name} now has ELEVATED TRAFFIC`;
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
      const allTypes = newFilters.length === ALL_RESOURCE_TYPES.length;
      const allStatuses = activeRouteStatuses.length === ALL_ROUTE_STATUSES.length;
      const params = new URLSearchParams();
      if (!allTypes) params.set("types", newFilters.join(","));
      if (!allStatuses) params.set("statuses", activeRouteStatuses.join(","));
      const focusParam = serializeFocusParam(routeFocus);
      if (focusParam) params.set("focus", focusParam);
      const query = params.toString();
      router.replace(
        query ? `/?${query}` : "/",
        undefined,
        { shallow: true }
      );
    },
    [activeRouteStatuses, routeFocus, router]
  );

  const handleStatusChange = useCallback(
    (newStatuses: RouteStatus[]) => {
      setActiveRouteStatuses(newStatuses);
      const allTypes = activeFilters.length === ALL_RESOURCE_TYPES.length;
      const allStatuses = newStatuses.length === ALL_ROUTE_STATUSES.length;
      const params = new URLSearchParams();
      if (!allTypes) params.set("types", activeFilters.join(","));
      if (!allStatuses) params.set("statuses", newStatuses.join(","));
      const focusParam = serializeFocusParam(routeFocus);
      if (focusParam) params.set("focus", focusParam);
      const query = params.toString();
      router.replace(
        query ? `/?${query}` : "/",
        undefined,
        { shallow: true }
      );
    },
    [activeFilters, routeFocus, router]
  );

  const handleChokepointClick = useCallback((cp: Chokepoint) => {
    setSelectedCountry(null);
    setSelectedChokepoint(cp);
    setRouteFocus({ kind: "chokepoint", id: cp.id, name: cp.name });
  }, []);

  const handleRouteFocusChange = useCallback((target: RouteFocusTarget | null) => {
    setSelectedCountry(null);
    setRouteFocus(target);
    if (target?.kind === "chokepoint") {
      setSelectedChokepoint(CHOKEPOINTS.find((cp) => cp.id === target.id) ?? null);
    } else if (target?.kind === "port") {
      setSelectedChokepoint(null);
    }
    const allTypes = activeFilters.length === ALL_RESOURCE_TYPES.length;
    const allStatuses = activeRouteStatuses.length === ALL_ROUTE_STATUSES.length;
    const params = new URLSearchParams();
    if (!allTypes) params.set("types", activeFilters.join(","));
    if (!allStatuses) params.set("statuses", activeRouteStatuses.join(","));
    const focusParam = serializeFocusParam(target);
    if (focusParam) params.set("focus", focusParam);
    const query = params.toString();
    router.replace(query ? `/?${query}` : "/", undefined, { shallow: true });
  }, [activeFilters, activeRouteStatuses, router]);

  const handleSidebarClose = useCallback(() => {
    setSelectedChokepoint(null);
  }, []);

  const handleResetView = useCallback(() => {
    setSelectedCountry(null);
    handleRouteFocusChange(null);
    setViewResetKey((key) => key + 1);
  }, [handleRouteFocusChange]);

  const handleCountryClick = useCallback((country: SelectedCountry) => {
    const profile = COUNTRY_PROFILE_BY_ISO3[country.iso3] ?? findCountryProfileByName(country.name);
    if (!profile) return;
    setSelectedCountry({ ...country, iso3: profile.iso3, name: profile.name });
    setSelectedChokepoint(null);
    setRouteFocus(null);
  }, []);

  // Visible routes (for empty state check)
  const visibleRoutes = ROUTES.filter(
    (r) => activeFilters.includes(r.resourceType) && activeRouteStatuses.includes(r.routeStatus ?? "primary")
  );
  const selectedPort =
    routeFocus?.kind === "port"
      ? PORTS.find((port) => port.id === routeFocus.id) ?? null
      : null;

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
          activeRouteStatuses={activeRouteStatuses}
          showCountryBorders={showCountryBorders}
          conflictEvents={conflictEvents}
          disasterEvents={disasterEvents}
          routeFocus={routeFocus}
          viewResetKey={viewResetKey}
          onChokepointClick={handleChokepointClick}
          onRouteFocusChange={handleRouteFocusChange}
          onCountryClick={handleCountryClick}
          onGlobeReady={() => setGlobeReady(true)}
        />
      </ErrorBoundary>

      {globeReady && (
        <MapLayerToggle
          showCountryBorders={showCountryBorders}
          onToggleCountryBorders={() => setShowCountryBorders((value) => !value)}
          feedOpen={feedOpen}
        />
      )}

      {globeReady && (
        <RouteFocusSearch
          selectedTarget={routeFocus}
          onTargetChange={handleRouteFocusChange}
          onResetView={handleResetView}
        />
      )}

      {/* Macro signals panel — fixed left */}
      {globeReady && (
        <MacroPanel prices={commodityPrices} cache={cache} macroSignals={macroSignals} disasterEvents={disasterEvents} />
      )}

      {globeReady && <MapLegend />}

      {/* Commodity selector */}
      {globeReady && (
        <FilterPills activeFilters={activeFilters} onFilterChange={handleFilterChange} />
      )}

      {globeReady && (
        <RouteStatusPills activeStatuses={activeRouteStatuses} onStatusChange={handleStatusChange} />
      )}

      {/* Sources and caveats remain available even if WebGL is slow to initialize */}
      <DataSourcesPanel health={sourceHealth} />

      {globeReady && cache && (
        <PriceChart
          brent={cache.prices.brent}
          wti={cache.prices.wti}
          disruptionMarkers={Object.entries(cache.chokepoints)
            .filter(([, s]) => s.state === "disrupted")
            .flatMap(([id]) => {
              const brentClean = cache.brentAtLastClean?.[id];
              if (!brentClean) return [];
              const cp = CHOKEPOINTS.find((c) => c.id === id);
              return [{ date: brentClean.date, label: cp?.name.split(" ")[0] ?? id }];
            })}
        />
      )}

      {/* Sidebar — slide in from right on chokepoint click */}
      {globeReady && (
        <Sidebar
          chokepoint={selectedChokepoint}
          state={selectedChokepoint ? (cache?.chokepoints[selectedChokepoint.id] ?? null) : null}
          onClose={handleSidebarClose}
          conflictEvents={conflictEvents}
          disasterEvents={disasterEvents}
          brentAtLastClean={
            selectedChokepoint
              ? (cache?.brentAtLastClean?.[selectedChokepoint.id] ?? null)
              : null
          }
          portWatchReroutes={cache?.portWatchReroutes ?? []}
        />
      )}

      {/* Event feed — toggleable right panel */}
      {globeReady && (
        <PortPanel
          port={selectedPort}
          onClose={() => handleRouteFocusChange(null)}
        />
      )}

      {globeReady && (
        <CountryProfilePanel
          profile={
            selectedCountry
              ? COUNTRY_PROFILE_BY_ISO3[selectedCountry.iso3] ?? findCountryProfileByName(selectedCountry.name)
              : null
          }
          bbox={selectedCountry?.bbox ?? null}
          cache={cache}
          macroNews={macroNews}
          conflictEvents={conflictEvents}
          disasterEvents={disasterEvents}
          prices={commodityPrices}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      {globeReady && (
        <EventFeed
          open={feedOpen}
          onToggle={() => setFeedOpen((o) => !o)}
          conflictEvents={conflictEvents}
          disasterEvents={disasterEvents}
          macroNews={macroNews}
          cache={cache}
          onItemClick={(lat, lng, chokepointId) => {
            if (chokepointId) {
              const cp = CHOKEPOINTS.find((c) => c.id === chokepointId);
              if (cp) handleChokepointClick(cp);
            }
          }}
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

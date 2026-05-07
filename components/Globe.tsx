import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import GlobeGL, { GlobeMethods } from "react-globe.gl";
import type {
  DisruptionStateCache,
  Chokepoint,
  DisruptionState,
  ResourceType,
  RouteStatus,
  RouteFocusTarget,
  RouteAccuracy,
  TransportMode,
  ConflictEvent,
  DisasterEvent,
  DisasterType,
  DisasterSeverity,
} from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";
import { ROUTES } from "@/data/routes";
import { PORTS } from "@/data/ports";
import { normalizeDisasterEvents } from "@/lib/disaster-coordinates";
import countryBorders from "@/data/country-borders.json";

// ── Color maps ──────────────────────────────────────────────────────────────

const RESOURCE_COLORS: Record<ResourceType, string> = {
  oil: "#0ea5e9",
  gas: "#67e8f9",
  lng: "#a78bfa",
  container: "#34d399",
  copper: "#818cf8",
  grain: "#a3e635",
  coal: "#9ca3af",
  lithium: "#e879f9",
  cobalt: "#f472b6",
  "rare-earth": "#2dd4bf",
  "strategic-metals": "#fb923c",
  "iron-ore": "#78716c",
  uranium: "#22d3ee",
  fertilizer: "#fde047",
};

const STATE_COLORS: Record<DisruptionState, string> = {
  clean: "#22c55e",
  elevated: "#06b6d4",
  stressed: "#f59e0b",
  disrupted: "#ef4444",
  unknown: "#6b7280",
};

/** BL-002: arc color based on worst state across the route's chokepoints */
function getArcColor(resourceType: ResourceType, state: DisruptionState): string {
  if (state === "disrupted") return "#ef4444";
  return RESOURCE_COLORS[resourceType];
}

function getTransportMode(resourceType: ResourceType, transportMode?: TransportMode): TransportMode {
  return transportMode ?? (resourceType === "gas" ? "pipeline" : "sea");
}

function getTransportLabel(mode: TransportMode): string {
  switch (mode) {
    case "pipeline": return "Pipeline";
    case "rail": return "Rail corridor";
    case "road": return "Road corridor";
    case "multimodal": return "Multimodal corridor";
    default: return "Shipping route";
  }
}

function getRouteStatus(routeStatus?: RouteStatus): RouteStatus {
  return routeStatus ?? "primary";
}

function getRouteStatusLabel(status: RouteStatus): string {
  switch (status) {
    case "diversion": return "Diversion";
    case "planned": return "Planned";
    case "historical": return "Historical";
    default: return "Primary";
  }
}

function getRouteAccuracy(routeAccuracy?: RouteAccuracy): RouteAccuracy {
  return routeAccuracy ?? "approximate";
}

function getRouteConfidenceLabel(routeAccuracy: RouteAccuracy, transportMode: TransportMode): string {
  if (routeAccuracy === "observed") return "Confidence: observed corridor";
  if (transportMode === "sea") return "Confidence: approximate sea lane";
  return "Confidence: approximate corridor";
}

function getRouteFlowLabel(arc: ArcSegment): string {
  if (arc.resourceType === "oil" && arc.transportMode === "sea") {
    return `~${arc.flowMbpd}M barrels/day`;
  }
  return `Flow index ${arc.flowMbpd}`;
}

function toRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function coordKey(coord: [number, number]): string {
  return `${coord[0].toFixed(2)},${coord[1].toFixed(2)}`;
}

function angularDistanceSq(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const lngDelta = Math.abs(a.lng - b.lng);
  const wrappedLngDelta = Math.min(lngDelta, 360 - lngDelta);
  const latDelta = a.lat - b.lat;
  return latDelta * latDelta + wrappedLngDelta * wrappedLngDelta;
}

// ── Data types for globe layers ─────────────────────────────────────────────

interface ArcSegment {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  altitude: number;
  stroke: number;
  animateTime: number;
  routeId: string;
  routeName: string;
  resourceType: ResourceType;
  routeStatus: RouteStatus;
  routeAccuracy: RouteAccuracy;
  transportMode: TransportMode;
  flowMbpd: number;
  dashLength: number;
  dashGap: number;
  dashInitialGap: number;
  layer: "route" | "pulse";
  focusMatch: boolean;
  focusDimmed: boolean;
}

interface ChokepointPoint {
  _kind: "chokepoint";
  lat: number;
  lng: number;
  renderLat: number;
  renderLng: number;
  id: string;
  name: string;
  state: DisruptionState;
  articleCount: number;
}

interface PortPoint {
  _kind: "port";
  lat: number;
  lng: number;
  renderLat: number;
  renderLng: number;
  id: string;
  name: string;
  portType: "origin" | "destination" | "hub";
  resourceTypes: ResourceType[];
  description: string;
}

type GlobePoint = ChokepointPoint | PortPoint;

interface CountryFeature {
  bbox?: number[];
  properties?: {
    ADMIN?: string;
    NAME?: string;
    ISO_A3?: string;
    ADM0_A3?: string;
  };
}

const COUNTRY_BORDER_FEATURES = (countryBorders as unknown as { features: CountryFeature[] }).features;

const PORT_COLORS = {
  origin: "#f59e0b",
  destination: "#60a5fa",
  hub: "#14b8a6",
} as const;

function displayOffset(id: string, amount: number): { lat: number; lng: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const angle = (hash % 360) * (Math.PI / 180);
  return {
    lat: Math.sin(angle) * amount,
    lng: Math.cos(angle) * amount,
  };
}

function isNearAnyChokepoint(point: { lat: number; lng: number }): boolean {
  return CHOKEPOINTS.some((cp) => {
    const lat = cp.coordinates[1];
    const lng = cp.coordinates[0];
    return angularDistanceSq(point, { lat, lng }) < 0.08;
  });
}

// ── Disaster icon factory ────────────────────────────────────────────────────

const DISASTER_ICONS: Record<DisasterType, string> = {
  earthquake: "≋",
  storm:      "🌀",
  wildfire:   "🔥",
  flood:      "🌊",
  volcano:    "🌋",
  drought:    "🌵",
};

const SEVERITY_COLORS: Record<DisasterSeverity, string> = {
  watch:   "#f59e0b",
  warning: "#f97316",
  alert:   "#ef4444",
};

function injectPulseAnimation() {
  if (typeof document === "undefined") return;
  if (document.getElementById("disaster-pulse-style")) return;
  const style = document.createElement("style");
  style.id = "disaster-pulse-style";
  style.textContent = `
    @keyframes disasterPulse {
      0%   { box-shadow: 0 0 0 0px var(--pulse-color, #ef4444aa); }
      70%  { box-shadow: 0 0 0 8px transparent; }
      100% { box-shadow: 0 0 0 0px transparent; }
    }
    @keyframes disasterPulseAlert {
      0%   { box-shadow: 0 0 0 0px var(--pulse-color), 0 0 0 0px var(--pulse-color); }
      50%  { box-shadow: 0 0 0 8px transparent, 0 0 0 14px var(--pulse-color); }
      100% { box-shadow: 0 0 0 12px transparent, 0 0 0 20px transparent; }
    }
    .disaster-icon { animation: disasterPulse 2s infinite; cursor: pointer; }
    .disaster-icon.alert { animation: disasterPulseAlert 1.4s infinite; }
    .disaster-icon:hover { transform: scale(1.2); transition: transform 0.15s; }
    .disaster-icon.alert:hover { transform: scale(1.3); }
  `;
  document.head.appendChild(style);
}

function createDisasterIcon(
  event: DisasterEvent,
  onClick: (e: DisasterEvent) => void
): HTMLElement {
  injectPulseAnimation();
  const color = SEVERITY_COLORS[event.severity];
  const el = document.createElement("div");
  const isAlert = event.severity === "alert";
  el.className = isAlert ? "disaster-icon alert" : "disaster-icon";
  el.title = event.title;
  const size = isAlert ? 36 : 28;
  el.style.cssText = `
    width: ${size}px; height: ${size}px;
    border-radius: 50%;
    background: ${color}${isAlert ? "33" : "22"};
    border: ${isAlert ? "2.5" : "2"}px solid ${color};
    display: flex; align-items: center; justify-content: center;
    --pulse-color: ${color}88;
    user-select: none;
    overflow: hidden;
    ${isAlert ? `box-shadow: 0 0 8px ${color}66;` : ""}
  `;
  const icon = document.createElement("span");
  const verticalOffset = event.type === "earthquake" ? (isAlert ? 10 : 7) : (isAlert ? 6 : 4);
  icon.style.cssText = `
    font-size: 14px;
    line-height: 1;
    display: block;
    text-align: center;
    transform: translateY(${verticalOffset}px);
  `;
  icon.textContent = DISASTER_ICONS[event.type] ?? "⚠️";
  el.appendChild(icon);
  el.addEventListener("click", (ev) => {
    ev.stopPropagation();
    onClick(event);
  });
  return el;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface GlobeProps {
  cache: DisruptionStateCache | null;
  activeFilters: ResourceType[];
  activeRouteStatuses: RouteStatus[];
  showCountryBorders?: boolean;
  conflictEvents?: ConflictEvent[];
  disasterEvents?: DisasterEvent[];
  routeFocus: RouteFocusTarget | null;
  viewResetKey?: number;
  onChokepointClick: (chokepoint: Chokepoint) => void;
  onRouteFocusChange: (target: RouteFocusTarget | null) => void;
  onCountryClick?: (country: { name: string; iso3: string; bbox: [number, number, number, number] | null }) => void;
  onDisasterClick?: (event: DisasterEvent) => void;
  onGlobeReady: () => void;
}

// ── Tooltip state ────────────────────────────────────────────────────────────

interface TooltipState {
  x: number;
  y: number;
  content:
    | { type: "chokepoint"; point: ChokepointPoint }
    | { type: "port"; point: PortPoint }
    | { type: "arc"; arc: ArcSegment }
    | { type: "disaster"; event: DisasterEvent };
}

// ── Main component ───────────────────────────────────────────────────────────

export default function GlobeComponent({
  cache,
  activeFilters,
  activeRouteStatuses,
  showCountryBorders = false,
  conflictEvents = [],
  disasterEvents = [],
  routeFocus,
  viewResetKey = 0,
  onChokepointClick,
  onRouteFocusChange,
  onCountryClick,
  onDisasterClick,
  onGlobeReady,
}: GlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const hoveredPointRef = useRef<GlobePoint | null>(null);
  const clearTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track window size
  useEffect(() => {
    const update = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Track mouse position for tooltip placement
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    return () => {
      if (clearTooltipTimer.current) clearTimeout(clearTooltipTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!routeFocus) return;

    if (routeFocus.kind === "chokepoint") {
      const cp = CHOKEPOINTS.find((c) => c.id === routeFocus.id);
      if (!cp) return;
      globeRef.current?.pointOfView(
        { lat: cp.coordinates[1], lng: cp.coordinates[0], altitude: 1.2 },
        1000
      );
      return;
    }

    const port = PORTS.find((p) => p.id === routeFocus.id);
    if (!port) return;
    globeRef.current?.pointOfView(
      { lat: port.coordinates[1], lng: port.coordinates[0], altitude: 1.5 },
      1000
    );
  }, [routeFocus]);

  useEffect(() => {
    if (viewResetKey === 0) return;
    globeRef.current?.pointOfView({ lat: 20, lng: 10, altitude: 2.5 }, 900);
  }, [viewResetKey]);

  const focusedRouteIds = useMemo<Set<string>>(() => {
    if (!routeFocus) return new Set();

    if (routeFocus.kind === "chokepoint") {
      return new Set(
        ROUTES
          .filter((route) => route.chokepointIds.includes(routeFocus.id))
          .map((route) => route.id)
      );
    }

    const port = PORTS.find((p) => p.id === routeFocus.id);
    if (!port) return new Set();
    const portCoord = coordKey(port.coordinates);
    return new Set(
      ROUTES
        .filter((route) => route.waypoints.some((coord) => coordKey(coord) === portCoord))
        .map((route) => route.id)
    );
  }, [routeFocus]);

  // ── Derive arc segments from routes ─────────────────────────────────────

  const arcSegments = useMemo<ArcSegment[]>(() => {
    const segments: ArcSegment[] = [];
    for (const route of ROUTES) {
      // Filter by active resource types. Empty selection intentionally shows no routes.
      if (!activeFilters.includes(route.resourceType)) continue;
      const routeStatus = getRouteStatus(route.routeStatus);
      if (activeRouteStatuses.length > 0 && !activeRouteStatuses.includes(routeStatus)) continue;

      // Worst state across this route's chokepoints (BL-002)
      const states = route.chokepointIds.map(
        (id) => cache?.chokepoints[id]?.state ?? "unknown"
      );
      const worstState: DisruptionState = states.includes("disrupted")
        ? "disrupted"
        : states.includes("stressed")
        ? "stressed"
        : states.includes("elevated")
        ? "elevated"
        : states.includes("unknown")
        ? "unknown"
        : "clean";

      const color = getArcColor(route.resourceType, worstState);
      const focusMatch = !routeFocus || focusedRouteIds.has(route.id);
      const focusDimmed = Boolean(routeFocus && !focusMatch);
      const transportMode = getTransportMode(route.resourceType, route.transportMode);
      const routeAccuracy = getRouteAccuracy(route.routeAccuracy);
      const isLandMode = transportMode !== "sea";
      const altitude = isLandMode ? 0.015 : Math.min(0.4, 0.1 + route.flowMbpd / 150);
      const stroke = Math.max(
        transportMode === "road" ? 0.2 : 0.3,
        Math.min(isLandMode ? 1.4 : 2.0, route.flowMbpd / 12)
      ) * (routeFocus && focusMatch ? 1.9 : 1);
      const pulseLength =
        transportMode === "pipeline" ? 0.22 :
        transportMode === "rail" ? 0.15 :
        transportMode === "road" ? 0.12 :
        transportMode === "multimodal" ? 0.18 :
        0.20;
      const animateTime = isLandMode
        ? Math.max(4000, 9000 - route.flowMbpd * 80)
        : Math.max(2000, 6000 - route.flowMbpd * 80);

      // Keep every waypoint. Skipping intermediate sea waypoints can make globe.gl
      // draw a direct great-circle arc that cuts across land near coasts/straits.
      if (route.waypoints.length < 2) continue;
      const sampled = route.waypoints;

      // Approximate angular length of each segment for staggering comet phase
      const segLengths = sampled.slice(0, -1).map((wp, i) => {
        const [lng0, lat0] = wp;
        const [lng1, lat1] = sampled[i + 1];
        const dlng = Math.min(Math.abs(lng1 - lng0), 360 - Math.abs(lng1 - lng0));
        return Math.sqrt((lat1 - lat0) ** 2 + dlng ** 2);
      });
      const totalLen = segLengths.reduce((a, b) => a + b, 0) || 1;

      let cumulLen = 0;
      for (let i = 0; i < sampled.length - 1; i++) {
        const [startLng, startLat] = sampled[i];
        const [endLng, endLat] = sampled[i + 1];
        // dashInitialGap offsets each segment so its dot enters at the right
        // phase — the dot appears to flow from one segment into the next
        // without waiting at waypoints.
        const initialGap = 1 - (cumulLen / totalLen);
        cumulLen += segLengths[i];

        const baseSegment = {
          startLat,
          startLng,
          endLat,
          endLng,
          color,
          altitude,
          stroke,
          animateTime,
          routeId: route.id,
          routeName: route.name,
          resourceType: route.resourceType,
          routeStatus,
          routeAccuracy,
          transportMode,
          flowMbpd: route.flowMbpd,
          focusMatch,
          focusDimmed,
        };
        segments.push({
          ...baseSegment,
          stroke,
          animateTime: 0,
          dashLength: 1,
          dashGap: 0,
          dashInitialGap: 0,
          layer: "route",
        });
        segments.push({
          ...baseSegment,
          stroke: stroke * 1.4,
          animateTime,
          dashLength: 0.04,
          dashGap: 0.96,
          dashInitialGap: initialGap % 1,
          layer: "pulse",
        });
      }
    }
    return segments;
  }, [cache, activeFilters, activeRouteStatuses, focusedRouteIds, routeFocus]);

  // ── Derive chokepoint points ─────────────────────────────────────────────

  const chokepointPoints = useMemo<ChokepointPoint[]>(() => {
    return CHOKEPOINTS.map((cp) => ({
      _kind: "chokepoint" as const,
      lat: cp.coordinates[1],
      lng: cp.coordinates[0],
      renderLat: cp.coordinates[1],
      renderLng: cp.coordinates[0],
      id: cp.id,
      name: cp.name,
      state: cache?.chokepoints[cp.id]?.state ?? "unknown",
      articleCount: cache?.chokepoints[cp.id]?.articleCount ?? 0,
    }));
  }, [cache]);

  // ── Derive port points (filtered by active resource types) ───────────────

  const portPoints = useMemo<PortPoint[]>(() => {
    return PORTS
      .filter((p) =>
        activeFilters.length > 0 &&
        p.resourceTypes.some((r) => activeFilters.includes(r))
      )
      .map((p) => {
        const lat = p.coordinates[1];
        const lng = p.coordinates[0];
        const offset = isNearAnyChokepoint({ lat, lng })
          ? displayOffset(p.id, 0.16)
          : { lat: 0, lng: 0 };
        return {
          _kind: "port" as const,
          lat,
          lng,
          renderLat: lat + offset.lat,
          renderLng: lng + offset.lng,
          id: p.id,
          name: p.name,
          portType: p.portType,
          resourceTypes: p.resourceTypes,
          description: p.description,
        };
      });
  }, [activeFilters]);

  const allPoints = useMemo<GlobePoint[]>(
    () => [...chokepointPoints, ...portPoints],
    [chokepointPoints, portPoints]
  );

  const clickablePointByCoord = useMemo(() => {
    return new Map(allPoints.map((point) => [coordKey([point.lng, point.lat]), point]));
  }, [allPoints]);

  // ── Derive ring data from conflict events ────────────────────────────────

  const ringData = useMemo(() => {
    return conflictEvents.filter(
      (e) =>
        e.nearestChokepointId !== null &&
        e.distanceKm !== null &&
        e.distanceKm <= 100 &&
        e.fatalities > 0
    );
  }, [conflictEvents]);

  // ── Label data: major events (fatalities > 10 or < 200km from CP) ────────

  // ── Filter disaster events — wildfires only at warning+ severity ────────

  const filteredDisasterEvents = useMemo(() => {
    return normalizeDisasterEvents(disasterEvents).filter((e) => {
      if (e.type === "wildfire") {
        return e.severity === "warning" || e.severity === "alert";
      }
      return true;
    });
  }, [disasterEvents]);

  // ── Disaster icon element factory ────────────────────────────────────────

  const handleDisasterClick = useCallback(
    (event: DisasterEvent) => {
      onDisasterClick?.(event);
      setTooltip({
        x: mousePos.current.x,
        y: mousePos.current.y,
        content: { type: "disaster", event },
      });
    },
    [onDisasterClick]
  );

  const makeDisasterElement = useCallback(
    (d: object) => createDisasterIcon(d as DisasterEvent, handleDisasterClick),
    [handleDisasterClick]
  );

  // ── Hover handlers ────────────────────────────────────────────────────────

  const handlePointHover = useCallback((point: object | null) => {
    if (!point) {
      hoveredPointRef.current = null;
      if (clearTooltipTimer.current) clearTimeout(clearTooltipTimer.current);
      clearTooltipTimer.current = setTimeout(() => {
        if (!hoveredPointRef.current) setTooltip(null);
      }, 120);
      return;
    }
    if (clearTooltipTimer.current) clearTimeout(clearTooltipTimer.current);
    const p = point as GlobePoint;
    hoveredPointRef.current = p;
    setTooltip(null);
  }, []);

  const handleArcHover = useCallback((arc: object | null) => {
    if (hoveredPointRef.current) return;
    if (!arc) {
      if (clearTooltipTimer.current) clearTimeout(clearTooltipTimer.current);
      clearTooltipTimer.current = setTimeout(() => {
        if (!hoveredPointRef.current) setTooltip(null);
      }, 80);
      return;
    }
    setTooltip({
      x: mousePos.current.x,
      y: mousePos.current.y,
      content: { type: "arc", arc: arc as ArcSegment },
    });
  }, []);

  // ── Click handler ────────────────────────────────────────────────────────

  const handlePointClick = useCallback(
    (point: object) => {
      const p = point as GlobePoint;

      // Ports: fly to location and pin the tooltip — no sidebar
      if (p._kind === "port") {
        onRouteFocusChange({ kind: "port", id: p.id, name: p.name });
        globeRef.current?.pointOfView(
          { lat: p.lat, lng: p.lng, altitude: 1.5 },
          1200
        );
        setTooltip(null);
        return;
      }

      // Chokepoints: fly and open sidebar
      const cp = CHOKEPOINTS.find((c) => c.id === p.id);
      if (!cp) return;
      onRouteFocusChange({ kind: "chokepoint", id: cp.id, name: cp.name });
      globeRef.current?.pointOfView(
        { lat: p.lat, lng: p.lng, altitude: 1.2 },
        1500
      );
      onChokepointClick(cp);
      setTooltip(null);
    },
    [onChokepointClick, onRouteFocusChange]
  );

  // ── Globe ready ──────────────────────────────────────────────────────────

  const handleArcClick = useCallback(
    (arcObject: object, _event?: MouseEvent, coords?: { lat: number; lng: number }) => {
      const arc = arcObject as ArcSegment;
      const candidates = [
        clickablePointByCoord.get(coordKey([arc.startLng, arc.startLat])),
        clickablePointByCoord.get(coordKey([arc.endLng, arc.endLat])),
      ].filter((point): point is GlobePoint => Boolean(point));

      if (candidates.length === 0) return;

      const clicked = coords
        ? candidates.reduce((best, point) =>
            angularDistanceSq(point, coords) < angularDistanceSq(best, coords) ? point : best
          )
        : candidates[0];

      handlePointClick(clicked);
    },
    [clickablePointByCoord, handlePointClick]
  );

  const handleGlobeReady = useCallback(() => {
    // Set initial POV to center on the world
    globeRef.current?.pointOfView({ lat: 20, lng: 10, altitude: 2.5 }, 0);
    onGlobeReady();
  }, [onGlobeReady]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a1628" }}>
      <GlobeGL
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        backgroundColor="#0a1628"
        showAtmosphere={true}
        atmosphereColor="#4fc3f7"
        atmosphereAltitude={0.18}
        onGlobeReady={handleGlobeReady}
        polygonsData={showCountryBorders ? COUNTRY_BORDER_FEATURES : []}
        polygonAltitude={0.003}
        polygonCapColor={() => "rgba(255, 255, 255, 0.012)"}
        polygonSideColor={() => "rgba(255, 255, 255, 0)"}
        polygonStrokeColor={() => "rgba(226, 232, 240, 0.42)"}
        polygonLabel={(d) => {
          const feature = d as CountryFeature;
          return feature.properties?.ADMIN || feature.properties?.NAME || "";
        }}
        onPolygonClick={(d) => {
          const feature = d as CountryFeature;
          const name = feature.properties?.ADMIN || feature.properties?.NAME || "";
          const iso3 = feature.properties?.ISO_A3 || feature.properties?.ADM0_A3 || "";
          const bbox =
            feature.bbox && feature.bbox.length >= 4
              ? [feature.bbox[0], feature.bbox[1], feature.bbox[2], feature.bbox[3]] as [number, number, number, number]
              : null;
          if (name && iso3) onCountryClick?.({ name, iso3, bbox });
        }}
        polygonsTransitionDuration={0}
        // Arcs — animated shipping routes (BL-001 to BL-004)
        arcsData={arcSegments}
        arcStartLat={(d) => (d as ArcSegment).startLat}
        arcStartLng={(d) => (d as ArcSegment).startLng}
        arcEndLat={(d) => (d as ArcSegment).endLat}
        arcEndLng={(d) => (d as ArcSegment).endLng}
        arcColor={(d: object) => {
          const arc = d as ArcSegment;
          if (arc.layer === "pulse") {
            return arc.focusDimmed
              ? toRgba(arc.color, 0.06)
              : toRgba(arc.color, 1.0);
          }
          // Gradient: faint at origin → solid at destination (bakes in direction)
          if (arc.focusDimmed) return [toRgba(arc.color, 0.08), toRgba(arc.color, 0.18)];
          return [toRgba(arc.color, 0.35), toRgba(arc.color, 0.85)];
        }}
        arcAltitude={(d) => (d as ArcSegment).altitude}
        arcStroke={(d) => (d as ArcSegment).stroke}
        arcDashLength={(d) => (d as ArcSegment).dashLength}
        arcDashGap={(d) => (d as ArcSegment).dashGap}
        arcDashInitialGap={(d) => (d as ArcSegment).dashInitialGap}
        arcDashAnimateTime={(d) => (d as ArcSegment).animateTime}
        onArcClick={handleArcClick}
        onArcHover={handleArcHover}
        arcLabel={() => ""}
        // Points — chokepoints + ports combined
        pointsData={allPoints}
        pointLat={(d) => (d as GlobePoint).renderLat}
        pointLng={(d) => (d as GlobePoint).renderLng}
        pointColor={(d) => {
          const p = d as GlobePoint;
          if (p._kind === "port") return PORT_COLORS[p.portType];
          return STATE_COLORS[p.state];
        }}
        pointAltitude={(d) => ((d as GlobePoint)._kind === "port" ? 0.016 : 0.01)}
        pointRadius={(d) => {
          const p = d as GlobePoint;
          if (p._kind === "port") return 0.3;
          const state = p.state;
          if (state === "disrupted") return 0.6;
          if (state === "stressed") return 0.5;
          if (state === "elevated") return 0.46;
          if (state === "clean") return 0.4;
          return 0.3;
        }}
        onPointClick={handlePointClick}
        onPointHover={handlePointHover}
        pointLabel={() => ""}
        // Rings — ACLED conflict events (BL-006)
        ringsData={ringData}
        ringLat={(d) => (d as ConflictEvent).lat}
        ringLng={(d) => (d as ConflictEvent).lng}
        ringColor={() => "#ef444488"}
        ringMaxRadius={2.5}
        ringPropagationSpeed={0.8}
        ringRepeatPeriod={2000}
        // Labels — major events
        labelsData={[]}
        labelLat={(d) => (d as ConflictEvent).lat}
        labelLng={(d) => (d as ConflictEvent).lng}
        labelText={() => ""}
        labelColor={() => "#fbbf24"}
        labelSize={0.4}
        labelDotRadius={0.3}
        labelAltitude={0.01}
        // HTML elements — disaster icons (earthquakes, storms, wildfires, floods, volcanoes, droughts)
        htmlElementsData={filteredDisasterEvents}
        htmlLat={(d) => (d as DisasterEvent).lat}
        htmlLng={(d) => (d as DisasterEvent).lng}
        htmlAltitude={0.02}
        htmlElement={makeDisasterElement}
      />

      {/* HTML tooltip overlay */}
      {tooltip && (
        <TooltipOverlay tooltip={tooltip} />
      )}
    </div>
  );
}

// ── Tooltip overlay ──────────────────────────────────────────────────────────

function TooltipOverlay({ tooltip }: { tooltip: TooltipState }) {
  const style: React.CSSProperties = {
    position: "fixed",
    left: tooltip.x + 14,
    top: tooltip.y - 10,
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "6px",
    padding: "8px 12px",
    pointerEvents: "none",
    zIndex: 100,
    minWidth: "160px",
  };

  if (tooltip.content.type === "chokepoint") {
    const { point } = tooltip.content;
    return (
      <div style={style}>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--color-text)",
            marginBottom: "4px",
          }}
        >
          {point.name}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            color: STATE_COLORS[point.state],
            marginBottom: point.articleCount > 0 ? "3px" : 0,
          }}
        >
          {point.state === "disrupted" && "⚠️ Disrupted — active threat to shipping"}
          {point.state === "stressed" && "🟡 Stressed — elevated tensions nearby"}
          {point.state === "elevated" && "Elevated traffic - heavier diversion flow"}
          {point.state === "clean" && "✅ Normal — no significant disruptions"}
          {point.state === "unknown" && "⬜ No data yet"}
        </div>
        {point.articleCount > 0 && (
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "11px", color: "var(--color-text-muted)" }}>
            {point.articleCount} news articles in last 24h
          </div>
        )}
      </div>
    );
  }

  if (tooltip.content.type === "port") {
    const { point } = tooltip.content;
    const color = PORT_COLORS[point.portType];
    const label =
      point.portType === "origin" ? "Export terminal" :
      point.portType === "destination" ? "Import hub" : "Trading hub";
    return (
      <div style={{ ...style, borderLeft: `3px solid ${color}` }}>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "var(--color-text)", marginBottom: "3px" }}>
          {point.name}
        </div>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "11px", color, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </div>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
          {point.description}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {point.resourceTypes.map((r) => (
            <span key={r} style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "10px", background: "var(--color-border)", color: "var(--color-text-muted)", borderRadius: "3px", padding: "1px 5px" }}>
              {r}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (tooltip.content.type === "disaster") {
    const { event } = tooltip.content;
    const color = SEVERITY_COLORS[event.severity];
    return (
      <div style={{ ...style, borderLeft: `3px solid ${color}` }}>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "12px", color, fontWeight: 600, marginBottom: "2px" }}>
          {event.type.toUpperCase()} · {event.severity.toUpperCase()}
        </div>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "12px", color: "var(--color-text)", marginBottom: "3px" }}>
          {event.title}
        </div>
        {event.magnitude && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
            M{event.magnitude.toFixed(1)}
          </div>
        )}
        {event.nearestChokepointId && (
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "11px", color: "var(--color-text-muted)" }}>
            {Math.round(event.distanceKm ?? 0)} km from chokepoint
          </div>
        )}
      </div>
    );
  }

  if (tooltip.content.type === "arc") {
    const { arc } = tooltip.content;
    return (
      <div style={style}>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "13px",
            color: "var(--color-text)",
            marginBottom: "3px",
          }}
        >
          {arc.routeName}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            color: "var(--color-text-muted)",
          }}
        >
          {`${arc.resourceType.charAt(0).toUpperCase() + arc.resourceType.slice(1)} · ${getTransportLabel(arc.transportMode)} · ${getRouteStatusLabel(arc.routeStatus)} · ${getRouteConfidenceLabel(arc.routeAccuracy, arc.transportMode)}`}
          {arc.transportMode === "sea" && ` · ${getRouteFlowLabel(arc)}`}
        </div>
      </div>
    );
  }

  return null;
}

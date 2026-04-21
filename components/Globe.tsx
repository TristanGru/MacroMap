import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import GlobeGL, { GlobeMethods } from "react-globe.gl";
import type {
  DisruptionStateCache,
  Chokepoint,
  DisruptionState,
  ResourceType,
  ConflictEvent,
  DisasterEvent,
  DisasterType,
  DisasterSeverity,
} from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";
import { ROUTES } from "@/data/routes";

// ── Color maps ──────────────────────────────────────────────────────────────

const RESOURCE_COLORS: Record<ResourceType, string> = {
  oil: "#0ea5e9",
  gas: "#60a5fa",
  lng: "#a78bfa",
  container: "#34d399",
  copper: "#a855f7",
  grain: "#a3e635",
  coal: "#9ca3af",
  lithium: "#e879f9",
  "rare-earth": "#f472b6",
  "iron-ore": "#78716c",
  uranium: "#22d3ee",
  fertilizer: "#fb923c",
};

const STATE_COLORS: Record<DisruptionState, string> = {
  clean: "#22c55e",
  stressed: "#f59e0b",
  disrupted: "#ef4444",
  unknown: "#6b7280",
};

/** BL-002: arc color based on worst state across the route's chokepoints */
function getArcColor(resourceType: ResourceType, state: DisruptionState): string {
  if (state === "disrupted") return "#ef4444";
  if (state === "unknown") return "#6b7280";
  if (state === "stressed") {
    // 50% lerp between resource color and amber
    const r1 = parseInt(RESOURCE_COLORS[resourceType].slice(1, 3), 16);
    const g1 = parseInt(RESOURCE_COLORS[resourceType].slice(3, 5), 16);
    const b1 = parseInt(RESOURCE_COLORS[resourceType].slice(5, 7), 16);
    const r2 = 0xf5, g2 = 0x9e, b2 = 0x0b;
    const r = Math.round((r1 + r2) / 2).toString(16).padStart(2, "0");
    const g = Math.round((g1 + g2) / 2).toString(16).padStart(2, "0");
    const b = Math.round((b1 + b2) / 2).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  return RESOURCE_COLORS[resourceType];
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
  flowMbpd: number;
}

interface ChokepointPoint {
  lat: number;
  lng: number;
  id: string;
  name: string;
  state: DisruptionState;
  articleCount: number;
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
  conflictEvents?: ConflictEvent[];
  disasterEvents?: DisasterEvent[];
  onChokepointClick: (chokepoint: Chokepoint) => void;
  onDisasterClick?: (event: DisasterEvent) => void;
  onGlobeReady: () => void;
}

// ── Tooltip state ────────────────────────────────────────────────────────────

interface TooltipState {
  x: number;
  y: number;
  content:
    | { type: "chokepoint"; point: ChokepointPoint }
    | { type: "arc"; arc: ArcSegment }
    | { type: "disaster"; event: DisasterEvent };
}

// ── Main component ───────────────────────────────────────────────────────────

export default function GlobeComponent({
  cache,
  activeFilters,
  conflictEvents = [],
  disasterEvents = [],
  onChokepointClick,
  onDisasterClick,
  onGlobeReady,
}: GlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

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

  // ── Derive arc segments from routes ─────────────────────────────────────

  const arcSegments = useMemo<ArcSegment[]>(() => {
    const segments: ArcSegment[] = [];
    for (const route of ROUTES) {
      // Filter by active resource types
      if (activeFilters.length > 0 && !activeFilters.includes(route.resourceType)) continue;

      // Worst state across this route's chokepoints (BL-002)
      const states = route.chokepointIds.map(
        (id) => cache?.chokepoints[id]?.state ?? "unknown"
      );
      const worstState: DisruptionState = states.includes("disrupted")
        ? "disrupted"
        : states.includes("stressed")
        ? "stressed"
        : states.includes("unknown")
        ? "unknown"
        : "clean";

      const color = getArcColor(route.resourceType, worstState);
      // BL-003: altitude proportional to flow
      const altitude = Math.min(0.4, 0.1 + route.flowMbpd / 150);
      const stroke = Math.max(0.3, Math.min(2.0, route.flowMbpd / 12));
      // BL-004: faster animation = more flow (gentler range: 3000–8000ms)
      const animateTime = Math.max(3000, 8000 - route.flowMbpd * 80);

      // Find waypoint indices nearest to each chokepoint on this route
      const mustInclude = new Set<number>([0, route.waypoints.length - 1]);
      for (const cpId of route.chokepointIds) {
        const cp = CHOKEPOINTS.find((c) => c.id === cpId);
        if (!cp) continue;
        const [cpLon, cpLat] = cp.coordinates;
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let i = 0; i < route.waypoints.length; i++) {
          const [wLon, wLat] = route.waypoints[i];
          const d = (wLon - cpLon) ** 2 + (wLat - cpLat) ** 2;
          if (d < bestDist) { bestDist = d; bestIdx = i; }
        }
        mustInclude.add(bestIdx);
      }

      // Subsample: every 2nd waypoint + all chokepoint waypoints (keeps ocean path tight)
      if (route.waypoints.length < 2) continue;
      const sampled: [number, number][] = [];
      for (let i = 0; i < route.waypoints.length; i++) {
        if (i % 2 === 0 || mustInclude.has(i)) {
          sampled.push(route.waypoints[i] as [number, number]);
        }
      }
      for (let i = 0; i < sampled.length - 1; i++) {
        const [startLng, startLat] = sampled[i];
        const [endLng, endLat] = sampled[i + 1];
        segments.push({
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
          flowMbpd: route.flowMbpd,
        });
      }
    }
    return segments;
  }, [cache, activeFilters]);

  // ── Derive chokepoint points ─────────────────────────────────────────────

  const chokepointPoints = useMemo<ChokepointPoint[]>(() => {
    return CHOKEPOINTS.map((cp) => ({
      lat: cp.coordinates[1],
      lng: cp.coordinates[0],
      id: cp.id,
      name: cp.name,
      state: cache?.chokepoints[cp.id]?.state ?? "unknown",
      articleCount: cache?.chokepoints[cp.id]?.articleCount ?? 0,
    }));
  }, [cache]);

  // ── Derive ring data from conflict events ────────────────────────────────

  const ringData = useMemo(() => {
    return conflictEvents.filter((e) => e.nearestChokepointId !== null);
  }, [conflictEvents]);

  // ── Label data: major events (fatalities > 10 or < 200km from CP) ────────

  const labelData = useMemo(() => {
    return conflictEvents.filter(
      (e) => e.fatalities > 10 || (e.distanceKm !== null && e.distanceKm < 200)
    );
  }, [conflictEvents]);

  // ── Filter disaster events — wildfires only at warning+ severity ────────

  const filteredDisasterEvents = useMemo(() => {
    return disasterEvents.filter((e) => {
      if (e.type === "wildfire") return e.severity === "warning" || e.severity === "alert";
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
      setTooltip(null);
      return;
    }
    setTooltip({
      x: mousePos.current.x,
      y: mousePos.current.y,
      content: { type: "chokepoint", point: point as ChokepointPoint },
    });
  }, []);

  const handleArcHover = useCallback((arc: object | null) => {
    if (!arc) {
      setTooltip(null);
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
      const p = point as ChokepointPoint;
      const cp = CHOKEPOINTS.find((c) => c.id === p.id);
      if (!cp) return;

      // Fly to chokepoint
      globeRef.current?.pointOfView(
        { lat: p.lat, lng: p.lng, altitude: 1.2 },
        1500
      );

      onChokepointClick(cp);
      setTooltip(null);
    },
    [onChokepointClick]
  );

  // ── Globe ready ──────────────────────────────────────────────────────────

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
        // Arcs — animated shipping routes (BL-001 to BL-004)
        arcsData={arcSegments}
        arcStartLat={(d) => (d as ArcSegment).startLat}
        arcStartLng={(d) => (d as ArcSegment).startLng}
        arcEndLat={(d) => (d as ArcSegment).endLat}
        arcEndLng={(d) => (d as ArcSegment).endLng}
        arcColor={(d: object) => (d as ArcSegment).color}
        arcAltitude={(d) => (d as ArcSegment).altitude}
        arcStroke={(d) => (d as ArcSegment).stroke}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={(d) => (d as ArcSegment).animateTime}
        onArcHover={handleArcHover}
        arcLabel={() => ""}
        // Points — chokepoint markers (BL-005)
        pointsData={chokepointPoints}
        pointLat={(d) => (d as ChokepointPoint).lat}
        pointLng={(d) => (d as ChokepointPoint).lng}
        pointColor={(d) => STATE_COLORS[(d as ChokepointPoint).state]}
        pointAltitude={0.01}
        pointRadius={(d) => {
          const state = (d as ChokepointPoint).state;
          if (state === "disrupted") return 0.6;
          if (state === "stressed") return 0.5;
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
        labelsData={labelData}
        labelLat={(d) => (d as ConflictEvent).lat}
        labelLng={(d) => (d as ConflictEvent).lng}
        labelText={(d) => (d as ConflictEvent).description.slice(0, 40)}
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
          {arc.resourceType.charAt(0).toUpperCase() + arc.resourceType.slice(1)} shipping route · ~{arc.flowMbpd}M barrels/day
        </div>
      </div>
    );
  }

  return null;
}

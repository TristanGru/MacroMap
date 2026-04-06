import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Cesium from "cesium";
import { Viewer, useCesium, ScreenSpaceEventHandler, ScreenSpaceEvent } from "resium";
import type {
  DisruptionStateCache,
  Chokepoint,
  DisruptionState,
  ResourceType,
} from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";
import { ROUTES } from "@/data/routes";

// Set Cesium base URL before any Cesium usage (client-side only)
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).CESIUM_BASE_URL = "/cesium";
}

// Resource type → Cesium.Color
const RESOURCE_COLORS: Record<ResourceType, Cesium.Color> = {
  oil: Cesium.Color.fromCssColorString("#f97316"),
  gas: Cesium.Color.fromCssColorString("#60a5fa"),
  lng: Cesium.Color.fromCssColorString("#a78bfa"),
  container: Cesium.Color.fromCssColorString("#34d399"),
  copper: Cesium.Color.fromCssColorString("#fb923c"),
  grain: Cesium.Color.fromCssColorString("#fbbf24"),
  coal: Cesium.Color.fromCssColorString("#9ca3af"),
};

// Disruption state → Cesium.Color
const STATE_COLORS: Record<DisruptionState, Cesium.Color> = {
  clean: Cesium.Color.fromCssColorString("#22c55e"),
  stressed: Cesium.Color.fromCssColorString("#f59e0b"),
  disrupted: Cesium.Color.fromCssColorString("#ef4444"),
  unknown: Cesium.Color.fromCssColorString("#6b7280"),
};

function getArcColor(resourceType: ResourceType, state: DisruptionState): Cesium.Color {
  if (state === "unknown") return STATE_COLORS.unknown.withAlpha(0.6);
  if (state === "disrupted") return STATE_COLORS.disrupted.withAlpha(0.9);
  if (state === "stressed") {
    return Cesium.Color.lerp(
      RESOURCE_COLORS[resourceType],
      STATE_COLORS.stressed,
      0.5,
      new Cesium.Color()
    ).withAlpha(0.8);
  }
  return RESOURCE_COLORS[resourceType].withAlpha(1.0);
}

function getArcWidth(state: DisruptionState, flowMbpd: number): number {
  const base = Math.max(1, Math.min(4, flowMbpd / 6));
  if (state === "disrupted") return base * 1.5;
  if (state === "stressed") return base * 1.2;
  return base;
}

function interpolateWaypoints(
  waypoints: [number, number][],
  t: number
): [number, number] {
  if (waypoints.length === 1) return waypoints[0];
  const segCount = waypoints.length - 1;
  const segT = t * segCount;
  const segIdx = Math.min(Math.floor(segT), segCount - 1);
  const segProg = segT - segIdx;
  const from = waypoints[segIdx];
  const to = waypoints[segIdx + 1];
  return [
    from[0] + (to[0] - from[0]) * segProg,
    from[1] + (to[1] - from[1]) * segProg,
  ];
}

function createMarkerCanvas(color: Cesium.Color): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const r = Math.round(color.red * 255);
  const g = Math.round(color.green * 255);
  const b = Math.round(color.blue * 255);
  ctx.strokeStyle = `rgba(${r},${g},${b},${color.alpha})`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(16, 16, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(${r},${g},${b},${color.alpha})`;
  ctx.beginPath();
  ctx.arc(16, 16, 5, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

function createParticleCanvas(color: Cesium.Color): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext("2d")!;
  const r = Math.round(color.red * 255);
  const g = Math.round(color.green * 255);
  const b = Math.round(color.blue * 255);
  ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
  ctx.beginPath();
  ctx.arc(4, 4, 3, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

// ── Inner component — uses useCesium hook to access viewer after mount ──

interface GlobeInnerProps {
  cache: DisruptionStateCache | null;
  activeFilters: ResourceType[];
  onChokepointClick: (cp: Chokepoint) => void;
  onReady: () => void;
}

interface TooltipState {
  x: number;
  y: number;
  type: "chokepoint" | "arc";
  chokepointId?: string;
  routeId?: string;
}

function GlobeInner({ cache, activeFilters, onChokepointClick, onReady }: GlobeInnerProps) {
  const { viewer } = useCesium();
  const polylineCollRef = useRef<Cesium.PolylineCollection | null>(null);
  const bbCollRef = useRef<Cesium.BillboardCollection | null>(null);
  const particleCollRef = useRef<Cesium.BillboardCollection | null>(null);
  const particleDataRef = useRef<
    Array<{
      billboard: Cesium.Billboard;
      waypoints: [number, number][];
      totalTime: number;
      startTime: number;
    }>
  >([]);
  const animHandleRef = useRef<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const initializedRef = useRef(false);

  // Initialize Cesium primitives once viewer is available
  useEffect(() => {
    if (!viewer || initializedRef.current) return;
    initializedRef.current = true;

    // Configure Cesium scene settings
    // eslint-disable-next-line react-hooks/immutability
    viewer.scene.globe.enableLighting = false;

    // WebGL context loss recovery via canvas event
    const canvas = viewer.canvas;
    const handleContextLost = () => {
      console.warn("[Globe] WebGL context lost");
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);

    // Create primitive collections
    const polyColl = new Cesium.PolylineCollection();
    polylineCollRef.current = polyColl;
    viewer.scene.primitives.add(polyColl);

    const bbColl = new Cesium.BillboardCollection();
    bbCollRef.current = bbColl;
    viewer.scene.primitives.add(bbColl);

    const particleColl = new Cesium.BillboardCollection();
    particleCollRef.current = particleColl;
    viewer.scene.primitives.add(particleColl);

    onReady();

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
    };
  }, [viewer, onReady]);

  const getChokepointState = useCallback(
    (id: string): DisruptionState =>
      cache?.chokepoints[id]?.state ?? "unknown",
    [cache]
  );

  // Update arcs
  useEffect(() => {
    const polyColl = polylineCollRef.current;
    if (!polyColl) return;
    polyColl.removeAll();

    const visibleRoutes = ROUTES.filter(
      (r) => activeFilters.length === 0 || activeFilters.includes(r.resourceType)
    );

    for (const route of visibleRoutes) {
      const states = route.chokepointIds.map(getChokepointState);
      const worstState = states.includes("disrupted")
        ? "disrupted"
        : states.includes("stressed")
        ? "stressed"
        : states.includes("unknown")
        ? "unknown"
        : "clean";

      const positions = route.waypoints.map(([lon, lat]) =>
        Cesium.Cartesian3.fromDegrees(lon, lat, 20000)
      );

      polyColl.add({
        positions,
        width: getArcWidth(worstState, route.flowMbpd),
        material: Cesium.Material.fromType("Color", {
          color: getArcColor(route.resourceType, worstState),
        }),
        id: route.id,
      });
    }
  }, [cache, activeFilters, getChokepointState]);

  // Update chokepoint markers
  useEffect(() => {
    const bbColl = bbCollRef.current;
    if (!bbColl) return;
    bbColl.removeAll();

    for (const cp of CHOKEPOINTS) {
      const state = getChokepointState(cp.id);
      bbColl.add({
        position: Cesium.Cartesian3.fromDegrees(
          cp.coordinates[0],
          cp.coordinates[1],
          50000
        ),
        image: createMarkerCanvas(STATE_COLORS[state]),
        width: 24,
        height: 24,
        id: `chokepoint:${cp.id}`,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.5, 8.0e6, 0.8),
      });
    }
  }, [cache, getChokepointState]);

  // Particle animation
  useEffect(() => {
    const particleColl = particleCollRef.current;
    if (!particleColl) return;

    // Cancel previous animation
    if (animHandleRef.current !== null) {
      cancelAnimationFrame(animHandleRef.current);
    }

    particleColl.removeAll();
    particleDataRef.current = [];

    const visibleRoutes = ROUTES.filter(
      (r) => activeFilters.length === 0 || activeFilters.includes(r.resourceType)
    );

    const now = Date.now();
    for (const route of visibleRoutes) {
      const states = route.chokepointIds.map(getChokepointState);
      const worstState = states.includes("disrupted")
        ? "disrupted"
        : states.includes("stressed")
        ? "stressed"
        : states.includes("unknown")
        ? "unknown"
        : "clean";

      if (worstState === "disrupted") continue; // no particles on disrupted routes

      const particleCount = Math.min(Math.floor(route.flowMbpd * 0.5), 200);
      const traversalMs =
        Math.max(20, Math.min(120, 120 / (route.flowMbpd / 10))) * 1000;
      const color = RESOURCE_COLORS[route.resourceType];

      for (let i = 0; i < particleCount; i++) {
        const billboard = particleColl.add({
          position: Cesium.Cartesian3.fromDegrees(
            route.waypoints[0][0],
            route.waypoints[0][1],
            30000
          ),
          image: createParticleCanvas(color),
          width: 6,
          height: 6,
          id: `particle:${route.id}:${i}`,
        });

        particleDataRef.current.push({
          billboard,
          waypoints: route.waypoints,
          totalTime: traversalMs,
          startTime: now - (i / particleCount) * traversalMs,
        });
      }
    }

    const animate = () => {
      const t = Date.now();
      for (const p of particleDataRef.current) {
        const elapsed = (t - p.startTime) % p.totalTime;
        const progress = elapsed / p.totalTime;
        const pos = interpolateWaypoints(p.waypoints, progress);
        try {
          p.billboard.position = Cesium.Cartesian3.fromDegrees(pos[0], pos[1], 30000);
        } catch {
          // Billboard may have been destroyed when collection was cleared
        }
      }
      animHandleRef.current = requestAnimationFrame(animate);
    };

    animHandleRef.current = requestAnimationFrame(animate);

    return () => {
      if (animHandleRef.current !== null) {
        cancelAnimationFrame(animHandleRef.current);
      }
    };
  }, [cache, activeFilters, getChokepointState]);

  // Mouse move → tooltip
  const handleMouseMove = useCallback(
    (e: { position: Cesium.Cartesian2 } | { startPosition: Cesium.Cartesian2; endPosition: Cesium.Cartesian2 }) => {
      if (!viewer) return;
      const pos = "endPosition" in e ? e.endPosition : e.position;
      const picked = viewer.scene.pick(pos);

      if (!picked) {
        setTooltip(null);
        return;
      }

      const id = picked.id as string;
      if (typeof id === "string" && id.startsWith("chokepoint:")) {
        setTooltip({
          x: pos.x,
          y: pos.y,
          type: "chokepoint",
          chokepointId: id.replace("chokepoint:", ""),
        });
      } else if (typeof id === "string" && !id.startsWith("particle:")) {
        setTooltip({ x: pos.x, y: pos.y, type: "arc", routeId: id });
      } else {
        setTooltip(null);
      }
    },
    [viewer]
  );

  // Click → fly to + open sidebar
  const handleClick = useCallback(
    (e: { position: Cesium.Cartesian2 } | { startPosition: Cesium.Cartesian2; endPosition: Cesium.Cartesian2 }) => {
      if (!viewer) return;
      const clickPos = "position" in e ? e.position : e.endPosition;
      const picked = viewer.scene.pick(clickPos);
      if (!picked) return;

      const id = picked.id as string;
      if (typeof id === "string" && id.startsWith("chokepoint:")) {
        const cpId = id.replace("chokepoint:", "");
        const cp = CHOKEPOINTS.find((c) => c.id === cpId);
        if (!cp) return;

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            cp.coordinates[0],
            cp.coordinates[1],
            800000
          ),
          duration: 1.5,
        });

        onChokepointClick(cp);
        setTooltip(null);
      }
    },
    [viewer, onChokepointClick]
  );

  return (
    <>
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent
          action={handleMouseMove}
          type={Cesium.ScreenSpaceEventType.MOUSE_MOVE}
        />
        <ScreenSpaceEvent
          action={handleClick}
          type={Cesium.ScreenSpaceEventType.LEFT_CLICK}
        />
      </ScreenSpaceEventHandler>

      {/* HTML tooltip overlay */}
      {tooltip && <TooltipOverlay tooltip={tooltip} cache={cache} />}
    </>
  );
}

// ── Public Globe component (creates the Viewer, then mounts GlobeInner) ──

interface GlobeProps {
  cache: DisruptionStateCache | null;
  activeFilters: ResourceType[];
  onChokepointClick: (chokepoint: Chokepoint) => void;
  onGlobeReady: () => void;
}

export default function GlobeComponent({
  cache,
  activeFilters,
  onChokepointClick,
  onGlobeReady,
}: GlobeProps) {
  // Ion token set on mount
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
    if (token) Cesium.Ion.defaultAccessToken = token;
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Viewer
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        infoBox={false}
        selectionIndicator={false}
        style={{ background: "#000000" }}
      >
        <GlobeInner
          cache={cache}
          activeFilters={activeFilters}
          onChokepointClick={onChokepointClick}
          onReady={onGlobeReady}
        />
      </Viewer>
    </div>
  );
}

// ── Tooltip overlay ──────────────────────────────────────────────────

function TooltipOverlay({
  tooltip,
  cache,
}: {
  tooltip: TooltipState;
  cache: DisruptionStateCache | null;
}) {
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

  if (tooltip.type === "chokepoint" && tooltip.chokepointId) {
    const cp = CHOKEPOINTS.find((c) => c.id === tooltip.chokepointId);
    const state = cache?.chokepoints[tooltip.chokepointId]?.state ?? "unknown";
    const count = cache?.chokepoints[tooltip.chokepointId]?.articleCount ?? 0;
    if (!cp) return null;

    return (
      <div style={style}>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "11px",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "3px",
          }}
        >
          {cp.name}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "13px",
            color: `var(--color-${state})`,
          }}
        >
          {state.toUpperCase()}
          {count > 0 && (
            <span style={{ color: "var(--color-text-muted)" }}>
              {" · "}{count} articles
            </span>
          )}
        </div>
      </div>
    );
  }

  if (tooltip.type === "arc" && tooltip.routeId) {
    const route = ROUTES.find((r) => r.id === tooltip.routeId);
    if (!route) return null;

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
          {route.name}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "13px",
            color: "var(--color-text-muted)",
          }}
        >
          {route.resourceType.toUpperCase()} · ~{route.flowMbpd} Mbpd
        </div>
      </div>
    );
  }

  return null;
}

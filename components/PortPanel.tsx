import React, { useEffect, useMemo, useRef } from "react";
import type { Port, ResourceType, ShippingRoute } from "@/lib/types";
import { ROUTES } from "@/data/routes";

interface PortPanelProps {
  port: Port | null;
  onClose: () => void;
}

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
  fertilizer: "Fertilizer",
};

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

const ROLE_LABELS: Record<Port["portType"], string> = {
  origin: "Export origin",
  destination: "Import destination",
  hub: "Trade hub",
};

const ROLE_COLORS: Record<Port["portType"], string> = {
  origin: "#f59e0b",
  destination: "#60a5fa",
  hub: "#14b8a6",
};

const ROLE_CONTEXT: Record<Port["portType"], string> = {
  origin:
    "Export origins are upstream supply nodes. Disruption here usually shows up first as fewer cargoes leaving the region, higher replacement costs, or pressure on buyers that depend on a specific grade or basin.",
  destination:
    "Import destinations are demand-side gateways. Disruption here can delay deliveries, raise local inventories or demurrage costs, and expose how dependent a market is on a particular route.",
  hub:
    "Trading hubs concentrate transshipment, storage, refining, finance, or inland logistics. Stress here can ripple through multiple routes even when the underlying commodity supply is still available.",
};

const RESOURCE_CONTEXT: Record<ResourceType, string> = {
  oil: "Crude and refined-product flows are sensitive to sanctions, tanker insurance, refinery demand, and chokepoint closures.",
  gas: "Pipeline gas exposure depends on field output, compressor stations, border interconnectors, storage, and political transit risk.",
  lng: "LNG exposure depends on liquefaction trains, regas terminals, vessel availability, and spot cargo redirection between Europe and Asia.",
  container: "Container flows proxy finished goods, machinery, retail inventory, and manufacturing inputs moving through global liner networks.",
  copper: "Copper routes matter for power grids, construction, EVs, and electronics; concentrate logistics can be bottlenecked by rail and port access.",
  grain: "Grain routes are tied to food inflation, livestock feed costs, crop calendars, river levels, and inspection or export-control policy.",
  coal: "Coal routes affect power generation and steelmaking, with Asian demand, rail reliability, and weather disruptions often driving stress.",
  lithium: "Lithium flows link mines and brine operations to battery chemical conversion, cathode production, and EV supply chains.",
  cobalt: "Cobalt routes are concentrated around Central African mining and Asian refining, making corridor reliability unusually important.",
  "rare-earth": "Rare earth exposure is less about bulk tonnage and more about separation capacity, magnet inputs, and export-control risk.",
  "strategic-metals": "Strategic metals support semiconductors, aerospace, defense, and high-end manufacturing, so small logistics shocks can matter.",
  "iron-ore": "Iron ore flows are bulk-heavy and steel-cycle sensitive, with China demand and Australian or Brazilian export reliability setting tone.",
  uranium: "Uranium logistics are small by volume but high consequence for nuclear fuel security, conversion, enrichment, and utility contracting.",
  fertilizer: "Fertilizer flows matter for planting costs and food supply, especially when ammonia, urea, potash, or phosphate trade is interrupted.",
};

function coordKey(coord: [number, number]): string {
  return `${coord[0].toFixed(2)},${coord[1].toFixed(2)}`;
}

function associatedRoutes(port: Port): ShippingRoute[] {
  const key = coordKey(port.coordinates);
  return ROUTES.filter((route) => route.waypoints.some((coord) => coordKey(coord) === key));
}

export default function PortPanel({ port, onClose }: PortPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = Boolean(port);

  const routes = useMemo(() => (port ? associatedRoutes(port) : []), [port]);
  const routeCounts = useMemo(() => {
    return routes.reduce<Record<string, number>>((counts, route) => {
      const label = RESOURCE_LABELS[route.resourceType];
      counts[label] = (counts[label] ?? 0) + 1;
      return counts;
    }, {});
  }, [routes]);
  const profileHighlights = useMemo(() => {
    if (!port) return [];
    return port.resourceTypes.slice(0, 4).map((resource) => ({
      label: RESOURCE_LABELS[resource],
      color: RESOURCE_COLORS[resource],
      body: RESOURCE_CONTEXT[resource],
    }));
  }, [port]);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => closeButtonRef.current?.focus(), 200);
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <aside
      role="dialog"
      aria-modal={isOpen}
      aria-label={`${port?.name ?? "Port"} details`}
      aria-hidden={!isOpen}
      style={{
        position: "fixed",
        right: 0,
        top: "7.5vh",
        height: "85vh",
        width: "min(380px, calc(100vw - 24px))",
        background: "rgba(10, 15, 30, 0.92)",
        backdropFilter: "blur(12px)",
        borderLeft: `3px solid ${port ? ROLE_COLORS[port.portType] : "var(--color-border)"}`,
        borderRadius: "12px 0 0 12px",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 250ms ease-out",
      }}
    >
      {port && (
        <>
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    color: ROLE_COLORS[port.portType],
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "6px",
                  }}
                >
                  {ROLE_LABELS[port.portType]}
                </div>
                <h2
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--color-text)",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {port.name}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close port details"
                style={{
                  width: "34px",
                  height: "34px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  color: "var(--color-text-muted)",
                  fontSize: "18px",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          </div>

          <div style={{ padding: "16px", overflowY: "auto" }}>
            <section style={{ marginBottom: "18px" }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "7px",
                }}
              >
                Why it matters
              </div>
              <p
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {port.description}
              </p>
            </section>

            <section style={{ marginBottom: "18px" }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "8px",
                }}
              >
                Role in the network
              </div>
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)",
                  padding: "10px",
                }}
              >
                <p
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.72)",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {ROLE_CONTEXT[port.portType]}
                </p>
              </div>
            </section>

            <section style={{ marginBottom: "18px" }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "8px",
                }}
              >
                Macro materials
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {port.resourceTypes.map((resource) => (
                  <span
                    key={resource}
                    style={{
                      border: `1px solid ${RESOURCE_COLORS[resource]}55`,
                      background: `${RESOURCE_COLORS[resource]}18`,
                      color: RESOURCE_COLORS[resource],
                      borderRadius: "6px",
                      padding: "4px 7px",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    {RESOURCE_LABELS[resource]}
                  </span>
                ))}
              </div>
            </section>

            <section style={{ marginBottom: "18px" }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "8px",
                }}
              >
                What to watch
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {profileHighlights.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      padding: "9px",
                    }}
                  >
                    <div
                      style={{
                        color: item.color,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: "12px",
                        lineHeight: 1.45,
                      }}
                    >
                      {item.body}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ marginBottom: "18px" }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "8px",
                }}
              >
                Route links
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {routes.length === 0 ? (
                  <div
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: "12px",
                    }}
                  >
                    No visible macro routes terminate here yet.
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginBottom: "4px",
                      }}
                    >
                      {Object.entries(routeCounts).map(([label, count]) => (
                        <span
                          key={label}
                          style={{
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "6px",
                            color: "var(--color-text-muted)",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "10px",
                            padding: "3px 6px",
                          }}
                        >
                          {label} {count}
                        </span>
                      ))}
                    </div>
                    {routes.slice(0, 12).map((route) => (
                    <div
                      key={route.id}
                      style={{
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.04)",
                        padding: "8px 9px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'IBM Plex Sans', sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--color-text)",
                          lineHeight: 1.35,
                        }}
                      >
                        {route.name}
                      </div>
                      <div
                        style={{
                          marginTop: "4px",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "10px",
                          color: RESOURCE_COLORS[route.resourceType],
                          textTransform: "uppercase",
                        }}
                      >
                        {RESOURCE_LABELS[route.resourceType]}
                        {(route.routeAccuracy === "approximate" || route.transportMode === "rail" || route.transportMode === "road" || route.transportMode === "multimodal") && " · APPROXIMATE"}
                      </div>
                    </div>
                    ))}
                  </>
                )}
              </div>
            </section>

            <section>
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "8px",
                }}
              >
                Coordinates
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.62)",
                }}
              >
                {port.coordinates[1].toFixed(2)}°, {port.coordinates[0].toFixed(2)}°
              </div>
            </section>
          </div>
        </>
      )}
    </aside>
  );
}

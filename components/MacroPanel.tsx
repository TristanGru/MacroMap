import React, { useState } from "react";
import type { CommodityPrices, DisruptionStateCache, MacroSignal, DisasterEvent } from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";

// US agricultural regions (lat/lng bounding boxes) for wildfire filtering
const US_AGRI_REGIONS = [
  { name: "Great Plains", latMin: 30, latMax: 49, lngMin: -105, lngMax: -90 },
  { name: "Midwest Corn Belt", latMin: 36, latMax: 47, lngMin: -97, lngMax: -80 },
  { name: "California Central Valley", latMin: 35, latMax: 40, lngMin: -123, lngMax: -118 },
  { name: "Pacific Northwest", latMin: 44, latMax: 49, lngMin: -124, lngMax: -116 },
];

function isNearUSAgriRegion(lat: number, lng: number): string | null {
  for (const r of US_AGRI_REGIONS) {
    if (lat >= r.latMin && lat <= r.latMax && lng >= r.lngMin && lng <= r.lngMax) {
      return r.name;
    }
  }
  return null;
}

interface MacroPanelProps {
  prices: CommodityPrices | null;
  cache: DisruptionStateCache | null;
  macroSignals?: MacroSignal[];
  disasterEvents?: DisasterEvent[];
}

interface PriceRowProps {
  label: string;
  value: number | null;
  delta: number | null;
  unit?: string;
  note?: string;
}

function PriceRow({ label, value, delta, unit = "", note }: PriceRowProps) {
  const deltaColor =
    delta === null ? "var(--color-text-muted)"
    : delta > 0 ? "#ef4444"   // inflation = bad
    : delta < 0 ? "#22c55e"   // lower prices = good from supply perspective
    : "var(--color-text-muted)";

  const deltaSymbol = delta === null ? "" : delta > 0 ? "▲" : delta < 0 ? "▼" : "–";
  const deltaStr = delta === null ? "" : `${deltaSymbol} ${Math.abs(delta).toFixed(1)}%`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "12px",
          color: "var(--color-text-muted)",
          flexShrink: 0,
          minWidth: "80px",
        }}
      >
        {label}
        {note && (
          <span style={{ fontSize: "10px", display: "block", opacity: 0.6 }}>
            {note}
          </span>
        )}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "13px",
            color: "var(--color-text-data)",
            minWidth: "60px",
            textAlign: "right",
          }}
        >
          {value !== null ? `${unit}${value.toFixed(2)}` : "—"}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            color: deltaColor,
            minWidth: "54px",
            textAlign: "right",
          }}
        >
          {deltaStr}
        </span>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: "10px", fontWeight: 500,
      color: "var(--color-text-muted)",
      textTransform: "uppercase", letterSpacing: "0.08em",
      marginBottom: "2px",
    }}>
      {children}
    </div>
  );
}

function signalToPriceData(signal: MacroSignal | undefined) {
  if (!signal) return null;
  return {
    current: signal.value,
    delta24h: signal.delta,
    history30d: [],
    fetchedAt: signal.date,
  };
}

export default function MacroPanel({ prices, cache, macroSignals = [], disasterEvents = [] }: MacroPanelProps) {
  const compact = typeof window !== "undefined" && window.innerWidth <= 700;
  const [collapsed, setCollapsed] = useState(compact);

  // US wildfires near agricultural regions
  const usAgriWildfires = disasterEvents.filter(
    (e) => e.type === "wildfire" && isNearUSAgriRegion(e.lat, e.lng) !== null
  );

  // Group macro signals by category
  const agriSignals = macroSignals.filter((s) => s.category === "agriculture");
  const energySignals = macroSignals.filter((s) => s.category === "energy");
  const macroSignalsFiltered = macroSignals.filter((s) => s.category === "macro" || !s.category);
  const signalById = new Map(macroSignals.map((s) => [s.id, s]));
  const displayPrices = {
    brent: prices?.brent ?? cache?.prices.brent ?? null,
    wti: prices?.wti ?? cache?.prices.wti ?? null,
    natGas: prices?.natGas ?? signalToPriceData(signalById.get("DHHNGSP")),
    wheat: prices?.wheat ?? signalToPriceData(signalById.get("PWHEAMTUSDM")),
    copper: prices?.copper ?? signalToPriceData(signalById.get("PCOPPUSDM")),
    bdi: prices?.bdi ?? null,
  };

  // Count disrupted/stressed chokepoints
  const disruptedCount = cache
    ? Object.values(cache.chokepoints).filter((s) => s.state === "disrupted").length
    : 0;
  const stressedCount = cache
    ? Object.values(cache.chokepoints).filter((s) => s.state === "stressed").length
    : 0;

  const style: React.CSSProperties = {
    position: "fixed",
    left: 16,
    top: 16,
    bottom: compact ? "auto" : 58,
    width: collapsed ? "44px" : compact ? "min(280px, calc(100vw - 32px))" : "240px",
    height: compact ? (collapsed ? "44px" : "min(520px, calc(100vh - 32px))") : "auto",
    background: "rgba(10, 15, 30, 0.92)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    zIndex: 50,
    overflow: "hidden",
    transition: "width 200ms ease-out, height 200ms ease-out",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={style} role="complementary" aria-label="Macro price signals">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: collapsed ? "12px" : "10px 12px",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setCollapsed((c) => !c)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setCollapsed((c) => !c);
        }}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand macro signals panel" : "Collapse macro signals panel"}
      >
        {!collapsed && (
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Macro Signals
          </span>
        )}
        <span
          style={{
            color: "var(--color-text-muted)",
            fontSize: "14px",
            lineHeight: 1,
            marginLeft: collapsed ? 0 : "auto",
          }}
        >
          {collapsed ? "›" : "‹"}
        </span>
      </div>

      {/* Content */}
      {!collapsed && (
        <div style={{ padding: "0 12px 12px", overflowY: "auto", flex: 1, minHeight: 0 }}>
          {/* BDI */}
          <PriceRow
            label="Baltic Dry"
            value={displayPrices.bdi?.current ?? null}
            delta={displayPrices.bdi?.delta24h ?? null}
            note="Daily signal"
          />
          {/* Oil */}
          <PriceRow
            label="Brent"
            value={displayPrices.brent?.current ?? null}
            delta={displayPrices.brent?.delta24h ?? null}
            unit="$"
          />
          <PriceRow
            label="WTI"
            value={displayPrices.wti?.current ?? null}
            delta={displayPrices.wti?.delta24h ?? null}
            unit="$"
          />
          {/* Nat Gas */}
          <PriceRow
            label="Nat Gas"
            value={displayPrices.natGas?.current ?? null}
            delta={displayPrices.natGas?.delta24h ?? null}
            unit="$"
          />
          {/* Grain */}
          <PriceRow
            label="Wheat"
            value={displayPrices.wheat?.current ?? null}
            delta={displayPrices.wheat?.delta24h ?? null}
            unit="$"
          />
          {/* Copper */}
          <PriceRow
            label="Copper"
            value={displayPrices.copper?.current ?? null}
            delta={displayPrices.copper?.delta24h ?? null}
            unit="$"
          />

          {/* Economic signals */}
          {macroSignalsFiltered.length > 0 && (
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--color-border)" }}>
              <SectionHeader>Economic Signals</SectionHeader>
              {macroSignalsFiltered.map((sig) => (
                <PriceRow key={sig.id} label={sig.label} value={sig.value} delta={sig.delta}
                  unit={sig.unit === "idx" || sig.unit === "%" ? "" : sig.unit.split("/")[0]}
                  note={sig.isAlert ? "⚠ alert" : undefined} />
              ))}
            </div>
          )}

          {/* Energy signals */}
          {energySignals.length > 0 && (
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--color-border)" }}>
              <SectionHeader>Energy</SectionHeader>
              {energySignals.map((sig) => (
                <PriceRow key={sig.id} label={sig.label} value={sig.value} delta={sig.delta}
                  unit={sig.unit === "idx" || sig.unit === "%" ? "" : sig.unit.split("/")[0]}
                  note={sig.isAlert ? "⚠ alert" : undefined} />
              ))}
            </div>
          )}

          {/* US Agriculture section */}
          {(agriSignals.length > 0 || usAgriWildfires.length > 0) && (
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--color-border)" }}>
              <SectionHeader>🌾 US Agriculture</SectionHeader>
              {agriSignals.map((sig) => (
                <PriceRow key={sig.id} label={sig.label} value={sig.value} delta={sig.delta}
                  unit={sig.unit === "idx" || sig.unit === "%" ? "" : sig.unit.split("/")[0]}
                  note={sig.isAlert ? "⚠ alert" : undefined} />
              ))}
              {usAgriWildfires.length > 0 && (
                <div style={{ marginTop: "6px" }}>
                  {usAgriWildfires.slice(0, 3).map((fire) => {
                    const region = isNearUSAgriRegion(fire.lat, fire.lng);
                    return (
                      <div key={fire.id} style={{
                        display: "flex", alignItems: "flex-start", gap: "6px",
                        padding: "5px 0", borderBottom: "1px solid var(--color-border-subtle)",
                      }}>
                        <span style={{ fontSize: "12px", flexShrink: 0 }}>🔥</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "11px",
                            color: "#fb923c", fontWeight: 500, marginBottom: "1px",
                          }}>
                            {region} wildfire
                          </div>
                          <div style={{
                            fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "10px",
                            color: "var(--color-text-muted)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {fire.title}
                          </div>
                        </div>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: "9px",
                          color: "#f59e0b", flexShrink: 0, marginTop: "1px",
                        }}>
                          {fire.severity.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                  {usAgriWildfires.length > 0 && (
                    <div style={{
                      fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "10px",
                      color: "var(--color-text-muted)", marginTop: "5px", lineHeight: 1.4,
                    }}>
                      Active wildfires may affect crop yields → watch corn/soybean prices.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Active disruptions summary */}
          {(disruptedCount > 0 || stressedCount > 0) && (
            <div
              style={{
                marginTop: "10px",
                paddingTop: "10px",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "10px",
                  fontWeight: 500,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "6px",
                }}
              >
                Active Disruptions
              </div>
              {cache &&
                Object.entries(cache.chokepoints)
                  .filter(([, s]) => s.state === "disrupted" || s.state === "stressed")
                  .map(([id, s]) => {
                    const cp = CHOKEPOINTS.find((c) => c.id === id);
                    const color = s.state === "disrupted" ? "#ef4444" : "#f59e0b";
                    return (
                      <div
                        key={id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ color, fontSize: "8px" }}>●</span>
                        <span
                          style={{
                            fontFamily: "'IBM Plex Sans', sans-serif",
                            fontSize: "11px",
                            color: "var(--color-text)",
                          }}
                        >
                          {cp?.name ?? id}
                        </span>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "10px",
                            color,
                            marginLeft: "auto",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {s.state.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

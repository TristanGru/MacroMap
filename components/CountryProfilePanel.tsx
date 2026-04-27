import React, { useEffect, useMemo, useState } from "react";
import type {
  CommodityPrices,
  ConflictEvent,
  CountryProfile,
  CountryTradeData,
  DisasterEvent,
  DisruptionState,
  DisruptionStateCache,
  NewsArticle,
} from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";
import { PORTS } from "@/data/ports";

interface CountryProfilePanelProps {
  profile: CountryProfile | null;
  bbox: [number, number, number, number] | null;
  cache: DisruptionStateCache | null;
  macroNews: NewsArticle[];
  conflictEvents: ConflictEvent[];
  disasterEvents: DisasterEvent[];
  prices: CommodityPrices | null;
  onClose: () => void;
}

const STATE_COLORS: Record<DisruptionState, string> = {
  clean: "#22c55e",
  stressed: "#f59e0b",
  disrupted: "#ef4444",
  unknown: "#6b7280",
};

function containsAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function isInsideBbox(event: DisasterEvent, bbox: [number, number, number, number] | null): boolean {
  if (!bbox) return false;
  const [west, south, east, north] = bbox;
  return event.lng >= west && event.lng <= east && event.lat >= south && event.lat <= north;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontSize: "10px",
      fontWeight: 700,
      color: "var(--color-text-muted)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: "7px",
    }}>
      {children}
    </div>
  );
}

function PillList({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {items.map((item) => (
        <span
          key={item}
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "11px",
            color: "var(--color-text-muted)",
            background: "rgba(255, 255, 255, 0.045)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "6px",
            padding: "4px 7px",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function metricLabel(label: string, value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined) return null;
  return `${label}: ${value.toFixed(2)}${suffix}`;
}

function formatUsd(value: number): string {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${value.toFixed(0)}`;
}

function TradeList({ title, items }: { title: string; items: CountryTradeData["exports"] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "6px" }}>
        {title}
      </div>
      <div style={{ display: "grid", gap: "6px" }}>
        {items.slice(0, 5).map((item) => (
          <div key={`${title}-${item.name}`} style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "12px", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.name}
            </span>
            <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--color-text-dim)", flexShrink: 0 }}>
              {formatUsd(item.valueUsd)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CountryProfilePanel({
  profile,
  bbox,
  cache,
  macroNews,
  conflictEvents,
  disasterEvents,
  prices,
  onClose,
}: CountryProfilePanelProps) {
  const [tradeData, setTradeData] = useState<CountryTradeData | null>(null);

  useEffect(() => {
    if (!profile) return;

    let cancelled = false;
    fetch(`/api/country-trade?iso3=${encodeURIComponent(profile.iso3)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: CountryTradeData | null) => {
        if (!cancelled) setTradeData(data);
      })
      .catch(() => {
        if (!cancelled) setTradeData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [profile]);

  const matchedNews = useMemo(() => {
    if (!profile) return [];
    const seen = new Set<string>();
    const articles = [
      ...macroNews,
      ...Object.values(cache?.chokepoints ?? {}).flatMap((state) => state.articles),
    ].filter((article) => containsAny(`${article.title} ${article.source}`, profile.aliases));

    return articles
      .filter((article) => {
        if (seen.has(article.url)) return false;
        seen.add(article.url);
        return true;
      })
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 5);
  }, [cache, macroNews, profile]);

  const matchedConflicts = useMemo(() => {
    if (!profile) return [];
    return conflictEvents
      .filter((event) =>
        containsAny(event.country, profile.aliases) ||
        containsAny(event.description, profile.aliases)
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [conflictEvents, profile]);

  const matchedDisasters = useMemo(() => {
    return disasterEvents
      .filter((event) => isInsideBbox(event, bbox))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [bbox, disasterEvents]);

  if (!profile) return null;
  const activeTradeData = tradeData?.iso3 === profile.iso3 ? tradeData : null;

  const linkedChokepoints = profile.linkedChokepointIds
    .map((id) => {
      const chokepoint = CHOKEPOINTS.find((cp) => cp.id === id);
      const state = cache?.chokepoints[id]?.state ?? "unknown";
      return chokepoint ? { chokepoint, state } : null;
    })
    .filter((item): item is { chokepoint: typeof CHOKEPOINTS[number]; state: DisruptionState } => Boolean(item));

  const linkedPorts = profile.linkedPortIds
    .map((id) => PORTS.find((port) => port.id === id))
    .filter((port): port is typeof PORTS[number] => Boolean(port))
    .slice(0, 8);

  const macroMetrics = [
    profile.resourceTypes.includes("oil") ? metricLabel("Brent", prices?.brent?.current ?? cache?.prices.brent?.current, "$") : null,
    profile.resourceTypes.includes("oil") ? metricLabel("WTI", prices?.wti?.current ?? cache?.prices.wti?.current, "$") : null,
    profile.resourceTypes.some((type) => type === "gas" || type === "lng") ? metricLabel("Nat Gas", prices?.natGas?.current, "$") : null,
    profile.resourceTypes.includes("grain") ? metricLabel("Wheat", prices?.wheat?.current, "$") : null,
    profile.resourceTypes.includes("copper") ? metricLabel("Copper", prices?.copper?.current, "$") : null,
    prices?.bdi ? `Baltic Dry: ${prices.bdi.current.toFixed(0)}` : null,
  ].filter((metric): metric is string => Boolean(metric));

  return (
    <aside
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: "390px",
        maxWidth: "calc(100vw - 20px)",
        background: "rgba(10, 15, 30, 0.97)",
        backdropFilter: "blur(16px)",
        borderLeft: "1px solid var(--color-border)",
        zIndex: 64,
        display: "flex",
        flexDirection: "column",
      }}
      aria-label={`${profile.name} trade profile`}
    >
      <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid var(--color-border)" }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close country profile"
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "30px",
            height: "30px",
            borderRadius: "6px",
            border: "1px solid var(--color-border)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            fontSize: "18px",
            lineHeight: 1,
          }}
        >
          x
        </button>
        <div style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "11px",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "5px",
        }}>
          Country trade profile
        </div>
        <h2 style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "22px",
          lineHeight: 1.15,
          color: "var(--color-text)",
          margin: "0 40px 8px 0",
        }}>
          {profile.name}
        </h2>
        <p style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "13px",
          lineHeight: 1.45,
          color: "var(--color-text-muted)",
          margin: 0,
        }}>
          {profile.role}
        </p>
      </div>

      <div style={{ padding: "16px 18px 24px", overflowY: "auto", flex: 1 }}>
        <section style={{ marginBottom: "18px" }}>
          <SectionTitle>Macro Stats</SectionTitle>
          <PillList items={[
            ...profile.stats,
            ...(activeTradeData ? [`Comtrade ${activeTradeData.year}`] : []),
            ...macroMetrics,
          ].slice(0, 8)} />
        </section>

        {activeTradeData && (
          <section style={{ marginBottom: "18px" }}>
            <SectionTitle>UN Comtrade</SectionTitle>
            <div style={{ display: "grid", gap: "14px" }}>
              <TradeList title="Top export products" items={activeTradeData.exports} />
              <TradeList title="Top import products" items={activeTradeData.imports} />
              <TradeList title="Top export partners" items={activeTradeData.exportPartners} />
              <TradeList title="Top import partners" items={activeTradeData.importPartners} />
            </div>
          </section>
        )}

        <section style={{ marginBottom: "18px" }}>
          <SectionTitle>Major Exports</SectionTitle>
          <PillList items={profile.majorExports} />
        </section>

        <section style={{ marginBottom: "18px" }}>
          <SectionTitle>Major Imports</SectionTitle>
          <PillList items={profile.majorImports} />
        </section>

        <section style={{ marginBottom: "18px" }}>
          <SectionTitle>Trade Partners</SectionTitle>
          <PillList items={profile.tradePartners} />
        </section>

        <section style={{ marginBottom: "18px" }}>
          <SectionTitle>Trade Reliances</SectionTitle>
          <ul style={{ margin: 0, paddingLeft: "16px", color: "var(--color-text-muted)", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "12px", lineHeight: 1.45 }}>
            {profile.tradeReliances.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section style={{ marginBottom: "18px" }}>
          <SectionTitle>Macro Sensitivity</SectionTitle>
          <PillList items={profile.macroSensitivity} />
        </section>

        <section style={{ marginBottom: "18px" }}>
          <SectionTitle>Opposition / Risk</SectionTitle>
          <ul style={{ margin: 0, paddingLeft: "16px", color: "var(--color-text-muted)", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "12px", lineHeight: 1.45 }}>
            {profile.strategicRisks.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        {linkedChokepoints.length > 0 && (
          <section style={{ marginBottom: "18px" }}>
            <SectionTitle>Route Exposure</SectionTitle>
            <div style={{ display: "grid", gap: "7px" }}>
              {linkedChokepoints.map(({ chokepoint, state }) => (
                <div
                  key={chokepoint.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "12px",
                    color: "var(--color-text)",
                  }}
                >
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: STATE_COLORS[state], flexShrink: 0 }} />
                  <span>{chokepoint.name}</span>
                  <span style={{ marginLeft: "auto", color: STATE_COLORS[state], fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
                    {state.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {linkedPorts.length > 0 && (
          <section style={{ marginBottom: "18px" }}>
            <SectionTitle>Relevant Hubs</SectionTitle>
            <PillList items={linkedPorts.map((port) => port.name)} />
          </section>
        )}

        <section style={{ marginBottom: "18px" }}>
          <SectionTitle>Live Overlays</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
            {[
              ["News", matchedNews.length],
              ["Conflict", matchedConflicts.length],
              ["Disasters", matchedDisasters.length],
            ].map(([label, count]) => (
              <div key={label} style={{ border: "1px solid var(--color-border-subtle)", borderRadius: "7px", padding: "8px", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", color: "var(--color-text)" }}>{count}</div>
                <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "10px", color: "var(--color-text-muted)" }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {matchedNews.length > 0 && (
          <section style={{ marginBottom: "18px" }}>
            <SectionTitle>Recent News</SectionTitle>
            <div style={{ display: "grid", gap: "8px" }}>
              {matchedNews.map((article) => (
                <a key={article.url} href={article.url} target="_blank" rel="noreferrer" style={{ color: "var(--color-text)", textDecoration: "none", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "12px", lineHeight: 1.35 }}>
                  {article.title}
                  <span style={{ display: "block", color: "var(--color-text-dim)", fontSize: "10px", marginTop: "2px" }}>{article.source}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {matchedConflicts.length > 0 && (
          <section style={{ marginBottom: "18px" }}>
            <SectionTitle>Conflict Signals</SectionTitle>
            <div style={{ display: "grid", gap: "8px" }}>
              {matchedConflicts.map((event) => (
                <div key={event.id} style={{ color: "var(--color-text-muted)", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "12px", lineHeight: 1.35 }}>
                  <span style={{ color: "#f87171" }}>{event.type}</span> - {event.description}
                </div>
              ))}
            </div>
          </section>
        )}

        {matchedDisasters.length > 0 && (
          <section>
            <SectionTitle>Disaster Signals</SectionTitle>
            <div style={{ display: "grid", gap: "8px" }}>
              {matchedDisasters.map((event) => (
                <div key={event.id} style={{ color: "var(--color-text-muted)", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "12px", lineHeight: 1.35 }}>
                  <span style={{ color: event.severity === "alert" ? "#ef4444" : "#f97316" }}>{event.type.toUpperCase()} {event.severity.toUpperCase()}</span> - {event.title}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}

import React, { useState } from "react";

export type SourceHealthState = "loading" | "live" | "fallback" | "error";

interface DataSourcesPanelProps {
  health?: Record<string, SourceHealthState>;
}

type PanelMode = "sources" | "info" | null;

const ROUTE_DATA_LAST_UPDATED = "2026-04-26";

const INFO_SECTIONS = [
  {
    title: "What The Map Tracks",
    body:
      "The globe connects major commodity flows to chokepoints, ports, pipelines, rail corridors, and diversion routes. It currently covers oil, LNG and natural gas, wheat, copper, lithium, cobalt, and rare earth exposure.",
  },
  {
    title: "Live Disruption Signals",
    body:
      "Chokepoint status combines current news, nearby conflict events, disaster feeds, and observed maritime flow from IMF PortWatch where available. Clean means no strong current operational evidence; elevated traffic means heavier diversion flow; stressed means degraded or rerouted flow; disrupted means severe restriction, closure, or near-zero observed transit.",
  },
  {
    title: "Events Feed",
    body:
      "The feed separates macro news, route and rerouting signals, conflicts, and disasters so earthquakes and fires do not crowd out trade and market news. Articles and signals are connected back to nearby chokepoints when the data supports that relationship.",
  },
  {
    title: "Prices And Macro",
    body:
      "Market cards pull commodity and macro indicators such as Brent, natural gas, wheat, copper, energy data, rates, inflation, and crop data when API keys are available. Fallbacks are marked so stale or backup data is not confused with live data.",
  },
  {
    title: "How To Read It",
    body:
      "This is a strategic monitoring tool, not a navigation chart or trading system. Routes are simplified macro corridors, port status is evidence-weighted, and disruption labels highlight where a real-world event may matter for supply chains and markets.",
  },
];

const SOURCES = [
  { label: "ACLED conflict events", url: "https://acleddata.com/" },
  { label: "GDELT news monitoring", url: "https://www.gdeltproject.org/" },
  { label: "USGS earthquake feed", url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php" },
  { label: "GDACS disaster alerts", url: "https://www.gdacs.org/" },
  { label: "NASA FIRMS wildfire data", url: "https://firms.modaps.eosdis.nasa.gov/" },
  { label: "EIA open energy data", url: "https://www.eia.gov/opendata/" },
  { label: "FRED macro data", url: "https://fred.stlouisfed.org/" },
  { label: "USDA NASS crop data", url: "https://quickstats.nass.usda.gov/" },
  { label: "Baltic Exchange / BDI reference", url: "https://www.balticexchange.com/" },
  { label: "Natural Earth country polygons", url: "https://www.naturalearthdata.com/" },
  { label: "IMF PortWatch maritime disruption platform", url: "https://www.imf.org/portwatch" },
  { label: "UNCTADstat maritime transport data", url: "https://unctadstat.unctad.org/insights/theme/245" },
  { label: "UN Comtrade commodity trade data", url: "https://comtradeplus.un.org/" },
  { label: "WITS / UN Comtrade DRC cobalt hydroxide exports", url: "https://wits.worldbank.org/trade/comtrade/en/country/ZAR/year/2023/tradeflow/Exports/partner/ALL/product/282200" },
  { label: "World Bank Logistics Performance Index", url: "https://datacatalog.worldbank.org/infrastructure-data/search/dataset/0038649/logistics-performance-index" },
  { label: "OECD Trade in Value Added", url: "https://www.oecd.org/en/tiva.html" },
  { label: "OECD cobalt, lithium, and nickel trade case studies", url: "https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/12/trade-and-domestic-effects-of-export-restrictions_fdf21fd0/502e3bcf-en.pdf" },
  { label: "Our World in Data cobalt mining and refining split", url: "https://ourworldindata.org/data-insights/most-of-the-worlds-cobalt-is-mined-in-the-democratic-republic-of-congo-but-refined-in-china" },
  { label: "IEA Critical Minerals Data Explorer", url: "https://www.iea.org/data-and-statistics/data-tools/critical-minerals-data-explorer" },
  { label: "IEA Critical Minerals Dataset", url: "https://www.iea.org/data-and-statistics/data-product/critical-minerals-dataset" },
  { label: "USGS Mineral Commodity Summaries", url: "https://www.usgs.gov/science/science-explorer/minerals/mineral-commodities" },
  { label: "IEA Middle East Maritime Chokepoints Monitor", url: "https://www.iea.org/data-and-statistics/data-tools/middle-east-maritime-chokepoints-shipping-monitor" },
  { label: "MarineTraffic AIS and port congestion reference", url: "https://www.marinetraffic.com/" },
  { label: "European Maritime Safety Agency", url: "https://www.emsa.europa.eu/" },
  { label: "EU TEN-T transport network", url: "https://transport.ec.europa.eu/transport-themes/infrastructure-and-investment/trans-european-transport-network-ten-t_en" },
  { label: "CPEC Secretariat", url: "https://cpec.gov.pk/" },
  { label: "Northern Corridor Transit and Transport Coordination Authority", url: "https://www.ttcanc.org/" },
  { label: "SADC transport corridors", url: "https://www.sadc.int/" },
];

function statusColor(state: SourceHealthState): string {
  if (state === "live") return "#22c55e";
  if (state === "loading") return "#f59e0b";
  if (state === "fallback") return "#a78bfa";
  return "#ef4444";
}

export default function DataSourcesPanel({ health = {} }: DataSourcesPanelProps) {
  const compact = typeof window !== "undefined" && window.innerWidth <= 700;
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const healthEntries = Object.entries(health);

  return (
    <>
      <div
        style={{
          position: "fixed",
          right: "auto",
          left: "16px",
          top: compact ? "16px" : "auto",
          bottom: compact ? "auto" : "58px",
          zIndex: 54,
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => setPanelMode((value) => value === "sources" ? null : "sources")}
          aria-expanded={panelMode === "sources"}
          aria-label={panelMode === "sources" ? "Close data sources and route caveats" : "Open data sources and route caveats"}
          style={{
            height: "34px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            background: panelMode === "sources" ? "rgba(37, 99, 235, 0.28)" : "rgba(10, 15, 30, 0.92)",
            backdropFilter: "blur(12px)",
            color: "var(--color-text)",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            padding: "0 12px",
          }}
        >
          Sources
        </button>

        <button
          type="button"
          onClick={() => setPanelMode((value) => value === "info" ? null : "info")}
          aria-expanded={panelMode === "info"}
          aria-label={panelMode === "info" ? "Close application information" : "Read about information included in this application"}
          title="About the information in this application"
          style={{
            height: "34px",
            width: "34px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            background: panelMode === "info" ? "rgba(37, 99, 235, 0.28)" : "rgba(10, 15, 30, 0.92)",
            backdropFilter: "blur(12px)",
            color: "var(--color-text)",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
          }}
        >
          i
        </button>
      </div>

      {panelMode && (
        <section
          role="dialog"
          aria-label={panelMode === "info" ? "Application information" : "Data sources and caveats"}
          style={{
            position: "fixed",
            right: "auto",
            left: "16px",
            top: compact ? "58px" : "auto",
            bottom: compact ? "auto" : "100px",
            width: "min(380px, calc(100vw - 32px))",
            maxHeight: "min(520px, calc(100vh - 92px))",
            overflowY: "auto",
            border: "1px solid var(--color-border)",
            borderRadius: "10px",
            background: "rgba(10, 15, 30, 0.96)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
            zIndex: 54,
            padding: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "10px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "var(--color-text)",
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              {panelMode === "info" ? "What This Includes" : "Data Sources"}
            </h2>
            <button
              type="button"
              onClick={() => setPanelMode(null)}
              aria-label={panelMode === "info" ? "Close application information" : "Close data sources"}
              style={{
                border: 0,
                background: "transparent",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              x
            </button>
          </div>

          {panelMode === "info" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {INFO_SECTIONS.map((section) => (
                <section key={section.title}>
                  <h3
                    style={{
                      margin: "0 0 4px",
                      color: "var(--color-text)",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {section.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: "rgba(255,255,255,0.72)",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: "12px",
                      lineHeight: 1.55,
                    }}
                  >
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          ) : (
            <>
              <p
                style={{
                  margin: "0 0 12px",
                  color: "rgba(255,255,255,0.72)",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "12px",
                  lineHeight: 1.55,
                }}
              >
                Routes are macro-scale approximations for analysis, not navigation charts. Land, rail,
                pipeline, and diversion corridors are simplified to show strategic exposure and may not
                trace every real interchange, siding, or shipping lane. Approximate routes are synthetic
                corridor sketches based on public trade patterns, not AIS-derived tracks. Source links
                include live feeds, public datasets, corridor authorities, and supporting references.
              </p>

              <p
                style={{
                  margin: "0 0 12px",
                  color: "rgba(255,255,255,0.58)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  lineHeight: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Route/corridor data last updated: {ROUTE_DATA_LAST_UPDATED}
              </p>

              {healthEntries.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginBottom: "12px",
                  }}
                >
                  {healthEntries.map(([label, state]) => (
                    <span
                      key={label}
                      style={{
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "6px",
                        color: statusColor(state),
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "10px",
                        padding: "3px 6px",
                        textTransform: "uppercase",
                      }}
                    >
                      {label}: {state}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {SOURCES.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#93c5fd",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: "12px",
                      lineHeight: 1.4,
                      textDecoration: "none",
                    }}
                  >
                    {source.label}
                  </a>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}

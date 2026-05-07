/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import type {
  Chokepoint,
  ChokepointState,
  ConflictEvent,
  RiskTimelineEntry,
  DisasterEvent,
  DisasterType,
  HistoricalDisruption,
  NewsArticle,
  PortWatchRerouteSignal,
} from "@/lib/types";
import ArticleRow from "./ArticleRow";
import RiskTimeline from "./RiskTimeline";
import { getDisruptionsForChokepoint } from "@/data/historical-disruptions";

const DISASTER_ICONS: Record<DisasterType, string> = {
  earthquake: "🌍",
  storm:      "🌀",
  wildfire:   "🔥",
  flood:      "🌊",
  volcano:    "🌋",
  drought:    "🌵",
};

interface SidebarProps {
  chokepoint: Chokepoint | null;
  state: ChokepointState | null;
  onClose: () => void;
  conflictEvents?: ConflictEvent[];
  disasterEvents?: DisasterEvent[];
  brentAtLastClean?: { price: number; date: string } | null;
  portWatchReroutes?: PortWatchRerouteSignal[];
}

const STATE_LABELS: Record<string, string> = {
  clean: "CLEAN",
  elevated: "ELEVATED TRAFFIC",
  stressed: "STRESSED",
  disrupted: "DISRUPTED",
  unknown: "MONITORING",
};

const RESOURCE_LABELS: Record<string, string> = {
  oil: "Oil",
  gas: "Gas",
  lng: "LNG",
  container: "Containers",
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

export default function Sidebar({
  chokepoint,
  state,
  onClose,
  conflictEvents = [],
  disasterEvents = [],
  brentAtLastClean,
  portWatchReroutes = [],
}: SidebarProps) {
  const isOpen = chokepoint !== null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevOpenRef = useRef(false);
  const [riskTimeline, setRiskTimeline] = useState<RiskTimelineEntry[]>([]);
  const [recentArticles, setRecentArticles] = useState<NewsArticle[]>([]);
  const [nowMs, setNowMs] = useState(0);

  // Focus close button when sidebar opens; restore focus on close
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setTimeout(() => closeButtonRef.current?.focus(), 300);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  // Close on Esc
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const chokepointId = chokepoint?.id ?? null;

  useEffect(() => {
    if (isOpen) queueMicrotask(() => setNowMs(Date.now()));
  }, [isOpen, chokepointId]);

  // Fetch risk timeline when chokepoint opens
  useEffect(() => {
    if (!chokepointId) {
      queueMicrotask(() => setRiskTimeline([]));
      return;
    }
    let cancelled = false;
    const fetchTimeline = async () => {
      try {
        const res = await fetch(`/api/risk-timeline/${chokepointId}`);
        if (!res.ok) return;
        const data: RiskTimelineEntry[] = await res.json();
        if (!cancelled) setRiskTimeline(data);
      } catch {
        // Non-fatal
      }
    };
    fetchTimeline();
    return () => {
      cancelled = true;
    };
  }, [chokepointId]);

  useEffect(() => {
    if (!chokepointId) {
      queueMicrotask(() => setRecentArticles([]));
      return;
    }

    queueMicrotask(() => setRecentArticles(state?.articles ?? []));

    let cancelled = false;
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/chokepoint-news?id=${encodeURIComponent(chokepointId)}`);
        if (!res.ok) return;
        const data: { articles?: NewsArticle[] } = await res.json();
        if (!cancelled && data.articles) setRecentArticles(data.articles);
      } catch {
        // Non-fatal; keep cached articles if available.
      }
    };
    fetchNews();
    return () => {
      cancelled = true;
    };
  }, [chokepointId, state?.articles]);

  // Nearby ACLED events for this chokepoint
  const nearbyEvents = conflictEvents
    .filter((e) => e.nearestChokepointId === chokepoint?.id)
    .slice(0, 5);

  // Nearby disaster events for this chokepoint
  const nearbyDisasters = disasterEvents
    .filter((e) => e.nearestChokepointId === chokepoint?.id)
    .slice(0, 4);

  // Historical disruptions for this chokepoint
  const historicalDisruptions = chokepoint
    ? getDisruptionsForChokepoint(chokepoint.id)
    : [];
  const relatedReroutes = chokepoint
    ? portWatchReroutes.filter(
        (signal) =>
          signal.impactedChokepointIds.includes(chokepoint.id) ||
          signal.diversionChokepointIds.includes(chokepoint.id)
      )
    : [];

  // Price delta since disruption
  const stateKey = state?.state ?? "unknown";
  const visibleStateKey = stateKey === "unknown" ? "clean" : stateKey;
  const isDisrupted = stateKey === "disrupted";
  const priceDelta =
    isDisrupted && brentAtLastClean && state
      ? null // will be computed below once we have current brent — passed from parent
      : null;
  void priceDelta;

  return (
    <aside
      role="dialog"
      aria-modal={isOpen}
      aria-label={`${chokepoint?.name ?? "Chokepoint"} details`}
      aria-hidden={!isOpen}
      style={{
        position: "fixed",
        right: 0,
        top: "7.5vh",
        height: "85vh",
        width: "min(400px, calc(100vw - 24px))",
        background: "rgba(10, 15, 30, 0.92)",
        backdropFilter: "blur(12px)",
        borderLeft: "1px solid var(--color-border)",
        borderRadius: "12px 0 0 12px",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 250ms ease-out",
      }}
    >
      {chokepoint && (
        <>
          {/* Aerial photo header */}
          <div
            style={{
              position: "relative",
              height: "160px",
              flexShrink: 0,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <ChokepointHero chokepoint={chokepoint} />
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close sidebar"
              style={{
                position: "absolute",
                top: "8px",
                right: "12px",
                width: "44px",
                height: "44px",
                border: "none",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "50%",
                color: "var(--color-text-muted)",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              ×
            </button>
          </div>

          {/* Header */}
          <div style={{ padding: "16px 16px 8px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                {chokepoint.name}
              </h2>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  color: `var(--color-${visibleStateKey})`,
                  background: `color-mix(in srgb, var(--color-${visibleStateKey}) 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, var(--color-${visibleStateKey}) 40%, transparent)`,
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                {STATE_LABELS[stateKey]}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                marginTop: "8px",
              }}
            >
              {chokepoint.resourceTypes.slice(0, 4).map((resource) => (
                <span
                  key={resource}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "10px",
                    color: "var(--color-text-muted)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "4px",
                    padding: "2px 6px",
                  }}
                >
                  {RESOURCE_LABELS[resource] ?? resource}
                </span>
              ))}
            </div>
            {state && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  marginTop: "4px",
                }}
              >
                {state.articleCount} articles · updated{" "}
                {new Date(state.lastUpdatedAt).toLocaleTimeString()}
                {state.observedFlow && (
                  <>
                    <br />
                    PortWatch AIS: {state.observedFlow.summary}
                  </>
                )}
                {state.confidence && (
                  <>
                    <br />
                    Confidence: {state.confidence.level.toUpperCase()}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Price delta since disruption (BL-010) */}
          {isDisrupted && brentAtLastClean && (
            <PriceDeltaRow brentAtLastClean={brentAtLastClean} nowMs={nowMs} />
          )}

          {/* Context card */}
          <div
            style={{
              padding: "0 16px 16px",
              flexShrink: 0,
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "14px",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {chokepoint.summary}
            </p>
          </div>

          {/* Scrollable content area */}
          <div
            style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
            className="sidebar-scroll"
          >
            {/* Consumer impact explainer */}
            {chokepoint.consumerImpact && (
              <div
                style={{
                  margin: "12px 16px",
                  padding: "12px 14px",
                  background: "rgba(0, 212, 255, 0.06)",
                  border: "1px solid rgba(0, 212, 255, 0.18)",
                  borderLeft: "3px solid #00d4ff",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#00d4ff",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "6px",
                  }}
                >
                  💡 What this means for you
                </div>
                <p
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {chokepoint.consumerImpact}
                </p>
              </div>
            )}

            {/* Nearby disaster events */}
            {relatedReroutes.length > 0 && (
              <div>
                <SectionLabel>Observed Rerouting</SectionLabel>
                {relatedReroutes.map((signal) => (
                  <div
                    key={signal.id}
                    style={{
                      margin: "0 16px 10px",
                      padding: "12px",
                      borderRadius: "8px",
                      background:
                        signal.state === "disrupted"
                          ? "rgba(239, 68, 68, 0.08)"
                          : "rgba(245, 158, 11, 0.08)",
                      border: `1px solid ${
                        signal.state === "disrupted"
                          ? "rgba(239, 68, 68, 0.24)"
                          : "rgba(245, 158, 11, 0.24)"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--color-text)",
                        marginBottom: "4px",
                      }}
                    >
                      {signal.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: "12px",
                        lineHeight: 1.5,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {signal.summary}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nearby disaster events */}
            {nearbyDisasters.length > 0 && (
              <div>
                <SectionLabel>Nearby Disasters</SectionLabel>
                {nearbyDisasters.map((event) => (
                  <DisasterEventRow key={event.id} event={event} nowMs={nowMs} />
                ))}
              </div>
            )}

            {/* Nearby conflict events */}
            {nearbyEvents.length > 0 && (
              <div>
                <SectionLabel>Nearby Conflict Events</SectionLabel>
                {nearbyEvents.map((event) => (
                  <ConflictEventRow key={event.id} event={event} nowMs={nowMs} />
                ))}
              </div>
            )}

            {/* Historical disruptions */}
            {historicalDisruptions.length > 0 && (
              <div>
                <SectionLabel>📜 Past Disruptions</SectionLabel>
                {historicalDisruptions.map((d) => (
                  <HistoricalDisruptionRow key={d.id} disruption={d} />
                ))}
              </div>
            )}

            {/* Recent news articles */}
            <div>
              <SectionLabel>Recent News</SectionLabel>

              {state === null &&
                [0, 1, 2].map((i) => <SkeletonRow key={i} />)}

              {state !== null && recentArticles.length === 0 && (
                <p
                  style={{
                    padding: "16px",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "14px",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Checking current chokepoint headlines...
                </p>
              )}

              {state !== null &&
                recentArticles.map((article, i) => (
                  <ArticleRow
                    key={i}
                    article={article}
                    resourceType={chokepoint.resourceTypes[0]}
                  />
                ))}
            </div>

            {/* Risk timeline sparkline */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <SectionLabel>30-Day Risk History</SectionLabel>
              <RiskTimeline entries={riskTimeline} />
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ChokepointHero({ chokepoint }: { chokepoint: Chokepoint }) {
  const [imgError, setImgError] = useState(false);
  const primary = chokepoint.resourceTypes[0] ?? "oil";
  const label = RESOURCE_LABELS[primary] ?? primary;

  if (!imgError) {
    return (
      <img
        src={chokepoint.photoPath}
        alt={`Aerial view of ${chokepoint.name}`}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      aria-label={`${chokepoint.name} route image`}
      role="img"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #07111f 0%, #102733 45%, #173b35 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 30%, rgba(34,197,94,0.22), transparent 22%), radial-gradient(circle at 72% 40%, rgba(0,212,255,0.18), transparent 24%)",
        }}
      />
      <svg
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <path d="M0 112 C78 80 138 86 202 70 C275 51 326 72 400 38" fill="none" stroke="rgba(0,212,255,0.62)" strokeWidth="5" />
        <path d="M0 126 C84 96 151 98 218 82 C288 66 330 88 400 56" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
        <path d="M-10 152 L92 98 L168 122 L244 76 L414 122 L414 170 L-10 170 Z" fill="rgba(6,95,70,0.42)" />
        <path d="M-10 46 L92 62 L174 28 L246 50 L414 18 L414 -10 L-10 -10 Z" fill="rgba(120,113,108,0.26)" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: "16px",
          bottom: "14px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          color: "rgba(255,255,255,0.8)",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "4px",
          padding: "4px 7px",
          backdropFilter: "blur(4px)",
        }}
      >
        {label} chokepoint
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "12px 16px 6px",
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: "11px",
        fontWeight: 500,
        color: "var(--color-text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </div>
  );
}

function PriceDeltaRow({
  brentAtLastClean,
  nowMs,
}: {
  brentAtLastClean: { price: number; date: string };
  nowMs: number;
}) {
  const currentMs = nowMs || new Date(brentAtLastClean.date).getTime();
  const daysAgo = Math.floor(
    (currentMs - new Date(brentAtLastClean.date).getTime()) / 86400000
  );
  const daysLabel = daysAgo === 0 ? "today" : `${daysAgo}d ago`;

  return (
    <div
      style={{
        margin: "0 16px 12px",
        padding: "10px 12px",
        background: "rgba(239, 68, 68, 0.08)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        borderRadius: "6px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "11px",
          color: "var(--color-text-muted)",
          marginBottom: "3px",
        }}
      >
        Price delta since disruption started {daysLabel}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "13px",
          color: "var(--color-text-data)",
        }}
      >
        Brent at clean:{" "}
        <span style={{ color: "#22c55e" }}>${brentAtLastClean.price.toFixed(2)}</span>
        <span style={{ color: "var(--color-text-muted)", margin: "0 6px" }}>→</span>
        <span style={{ color: "#ef4444" }}>now disrupted</span>
      </div>
    </div>
  );
}

function ConflictEventRow({ event, nowMs }: { event: ConflictEvent; nowMs: number }) {
  const currentMs = nowMs || new Date(event.date).getTime();
  const daysAgo = Math.floor(
    (currentMs - new Date(event.date).getTime()) / 86400000
  );
  const timeLabel = daysAgo === 0 ? "today" : `${daysAgo}d ago`;

  return (
    <div
      style={{
        padding: "8px 16px",
        borderBottom: "1px solid var(--color-border-subtle)",
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          color: "#ef4444",
          fontSize: "8px",
          marginTop: "4px",
          flexShrink: 0,
        }}
      >
        ●
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--color-text)",
            marginBottom: "2px",
          }}
        >
          {event.type} — {event.country}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "11px",
            color: "var(--color-text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {event.description}
        </div>
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          color: "var(--color-text-dim)",
          flexShrink: 0,
        }}
      >
        {timeLabel}
      </span>
    </div>
  );
}

function DisasterEventRow({ event, nowMs }: { event: DisasterEvent; nowMs: number }) {
  const currentMs = nowMs || new Date(event.date).getTime();
  const daysAgo = Math.floor(
    (currentMs - new Date(event.date).getTime()) / 86400000
  );
  const timeLabel = daysAgo === 0 ? "today" : `${daysAgo}d ago`;
  const severityColor =
    event.severity === "alert" ? "#ef4444" :
    event.severity === "warning" ? "#f97316" : "#f59e0b";

  return (
    <div
      style={{
        padding: "8px 16px",
        borderBottom: "1px solid var(--color-border-subtle)",
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>
        {DISASTER_ICONS[event.type] ?? "⚠️"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: severityColor,
            marginBottom: "2px",
          }}
        >
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)} · {event.severity}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "11px",
            color: "var(--color-text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {event.description}
        </div>
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          color: "var(--color-text-dim)",
          flexShrink: 0,
        }}
      >
        {timeLabel}
      </span>
    </div>
  );
}

function HistoricalDisruptionRow({ disruption }: { disruption: HistoricalDisruption }) {
  const [expanded, setExpanded] = useState(false);
  const year = disruption.dateStart.slice(0, 4);
  const isOngoing = !disruption.dateEnd;

  return (
    <div
      style={{
        padding: "8px 16px",
        borderBottom: "1px solid var(--color-border-subtle)",
        cursor: "pointer",
      }}
      onClick={() => setExpanded((e) => !e)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: isOngoing ? "#ef4444" : "var(--color-text-dim)",
            flexShrink: 0,
            marginTop: "2px",
            minWidth: "34px",
          }}
        >
          {isOngoing ? "NOW" : year}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--color-text)",
              lineHeight: 1.4,
            }}
          >
            {disruption.title}
          </div>
          {expanded && (
            <>
              <p
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.6,
                  margin: "6px 0 0 0",
                }}
              >
                {disruption.description}
              </p>
              {disruption.oilImpact && (
                <div
                  style={{
                    marginTop: "6px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    color: "#f59e0b",
                  }}
                >
                  ↑ {disruption.oilImpact}
                </div>
              )}
            </>
          )}
        </div>
        <span
          style={{
            color: "var(--color-text-dim)",
            fontSize: "10px",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          {expanded ? "▲" : "▼"}
        </span>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        height: "56px",
        borderBottom: "1px solid var(--color-border-subtle)",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "56px",
          borderRadius: "4px",
          background: "rgba(255,255,255,0.06)",
          flexShrink: 0,
          animation: "shimmer 1.5s infinite",
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: "10px",
            width: "60%",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "4px",
            marginBottom: "6px",
            animation: "shimmer 1.5s infinite",
          }}
        />
        <div
          style={{
            height: "10px",
            width: "90%",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "4px",
            animation: "shimmer 1.5s infinite 0.3s",
          }}
        />
      </div>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

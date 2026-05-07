import React, { useCallback, useMemo, useRef, useState } from "react";
import type {
  ConflictEvent,
  DisasterEvent,
  DisasterType,
  DisruptionState,
  DisruptionStateCache,
  NewsArticle,
} from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";

interface FeedItem {
  id: string;
  type: "conflict" | "article" | "disaster" | "reroute";
  timestamp: string;
  chokepointId: string | null;
  chokepointName: string | null;
  title: string;
  detail: string;
  state: DisruptionState | null;
  lat: number | null;
  lng: number | null;
  accentColor?: string;
  sourceLabel?: string;
  url?: string;
}

type FeedTab = "news" | "routes" | "conflict" | "disasters";

const TAB_LABELS: Record<FeedTab, string> = {
  news: "Macro News",
  routes: "Routes",
  conflict: "Conflict",
  disasters: "Disasters",
};

const DISASTER_LABELS: Record<DisasterType, string> = {
  earthquake: "Earthquake",
  storm: "Storm",
  wildfire: "Wildfire",
  flood: "Flood",
  volcano: "Volcano",
  drought: "Drought",
};

interface EventFeedProps {
  open: boolean;
  onToggle: () => void;
  conflictEvents: ConflictEvent[];
  disasterEvents?: DisasterEvent[];
  macroNews?: NewsArticle[];
  cache: DisruptionStateCache | null;
  onItemClick: (lat: number, lng: number, chokepointId: string | null) => void;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000);
  const d = Math.floor(ms / 86400000);
  if (d >= 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  return "< 1h ago";
}

const STATE_COLORS: Record<DisruptionState, string> = {
  clean: "#22c55e",
  elevated: "#06b6d4",
  stressed: "#f59e0b",
  disrupted: "#ef4444",
  unknown: "#6b7280",
};

export default function EventFeed({
  open,
  onToggle,
  conflictEvents,
  disasterEvents = [],
  macroNews = [],
  cache,
  onItemClick,
}: EventFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>("news");
  const listRef = useRef<HTMLDivElement | null>(null);

  const switchTab = useCallback((tab: FeedTab) => {
    setActiveTab(tab);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, []);

  const newsItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    const seen = new Set<string>();

    for (const article of macroNews) {
      seen.add(article.url);
      items.push({
        id: `macro-${article.url}`,
        type: "article",
        timestamp: article.publishedAt,
        chokepointId: null,
        chokepointName: "Macro News",
        title: article.title,
        detail: article.source,
        state: null,
        lat: null,
        lng: null,
        sourceLabel: "GDELT",
        url: article.url,
      });
    }

    for (const [id, cpState] of Object.entries(cache?.chokepoints ?? {})) {
      const cp = CHOKEPOINTS.find((c) => c.id === id);
      for (const article of cpState.articles) {
        if (seen.has(article.url)) continue;
        seen.add(article.url);
        items.push({
          id: `article-${id}-${article.url}`,
          type: "article",
          timestamp: article.publishedAt,
          chokepointId: id,
          chokepointName: cp?.name ?? id,
          title: article.title,
          detail: article.source,
          state: cpState.state,
          lat: cp ? cp.coordinates[1] : null,
          lng: cp ? cp.coordinates[0] : null,
          sourceLabel: "GDELT",
          url: article.url,
        });
      }
    }

    items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return items.slice(0, 50);
  }, [cache, macroNews]);

  const conflictItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    for (const event of conflictEvents) {
      if (!event.nearestChokepointId) continue;
      const cp = CHOKEPOINTS.find((c) => c.id === event.nearestChokepointId);
      const state = cache?.chokepoints[event.nearestChokepointId]?.state ?? null;
      items.push({
        id: `acled-${event.id}`,
        type: "conflict",
        timestamp: event.date,
        chokepointId: event.nearestChokepointId,
        chokepointName: cp?.name ?? event.nearestChokepointId,
        title: `${event.type} - ${event.country}`,
        detail: event.description,
        state,
        lat: event.lat,
        lng: event.lng,
        sourceLabel: "ACLED",
      });
    }

    items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return items.slice(0, 50);
  }, [conflictEvents, cache]);

  const disasterItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    for (const event of disasterEvents) {
      const cp = event.nearestChokepointId
        ? CHOKEPOINTS.find((c) => c.id === event.nearestChokepointId)
        : null;
      const severityColor =
        event.severity === "alert"
          ? "#ef4444"
          : event.severity === "warning"
            ? "#f97316"
            : "#f59e0b";
      items.push({
        id: event.id,
        type: "disaster",
        timestamp: event.date,
        chokepointId: event.nearestChokepointId,
        chokepointName: cp?.name ?? null,
        title: event.title,
        detail: event.description,
        state: null,
        lat: event.lat,
        lng: event.lng,
        accentColor: severityColor,
        sourceLabel: `${DISASTER_LABELS[event.type] ?? "Disaster"} - ${event.source.toUpperCase()}`,
      });
    }

    items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return items.slice(0, 50);
  }, [disasterEvents]);

  const routeItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    for (const signal of cache?.portWatchReroutes ?? []) {
      const primaryId = signal.impactedChokepointIds[0] ?? signal.diversionChokepointIds[0];
      const cp = CHOKEPOINTS.find((c) => c.id === primaryId);
      items.push({
        id: `reroute-${signal.id}`,
        type: "reroute",
        timestamp: new Date().toISOString(),
        chokepointId: primaryId ?? null,
        chokepointName: cp?.name ?? "Observed routes",
        title: signal.title,
        detail: signal.summary,
        state: signal.state,
        lat: cp ? cp.coordinates[1] : null,
        lng: cp ? cp.coordinates[0] : null,
        sourceLabel: `PortWatch - ${signal.confidence.toUpperCase()} confidence`,
      });
    }

    return items;
  }, [cache]);

  const tabItems: Record<FeedTab, FeedItem[]> = {
    news: newsItems,
    routes: routeItems,
    conflict: conflictItems,
    disasters: disasterItems,
  };
  const feedItems = tabItems[activeTab];
  const totalCount = newsItems.length + routeItems.length + conflictItems.length + disasterItems.length;

  const toggleButton = (
    <button
      onClick={onToggle}
      style={{
        position: "fixed",
        right: open ? "376px" : "16px",
        top: "16px",
        background: "rgba(10, 15, 30, 0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "8px 12px",
        color: "var(--color-text)",
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: "12px",
        fontWeight: 500,
        cursor: "pointer",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "right 250ms ease-out",
      }}
      aria-expanded={open}
      aria-label={open ? "Close event feed" : "Open event feed"}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: totalCount > 0 ? "#ef4444" : "#22c55e",
          flexShrink: 0,
        }}
      />
      Feed
      {totalCount > 0 && (
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: "var(--color-text-muted)",
          }}
        >
          {totalCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      {toggleButton}

      {open && (
        <div
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            width: "360px",
            background: "rgba(10, 15, 30, 0.96)",
            backdropFilter: "blur(16px)",
            borderLeft: "1px solid var(--color-border)",
            zIndex: 65,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          role="feed"
          aria-label="Live geopolitical event feed"
        >
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-text)",
              }}
            >
              {TAB_LABELS[activeTab]}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                color: "var(--color-text-muted)",
              }}
            >
              {feedItems.length} items
            </span>
          </div>

          <div
            role="tablist"
            aria-label="Event feed category"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "6px",
              padding: "10px 12px",
              borderBottom: "1px solid var(--color-border)",
              flexShrink: 0,
              position: "relative",
              zIndex: 2,
            }}
          >
            {(["news", "routes", "conflict", "disasters"] as FeedTab[]).map((tab) => (
              <FeedTabButton
                key={tab}
                label={TAB_LABELS[tab]}
                count={tabItems[tab].length}
                selected={activeTab === tab}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  switchTab(tab);
                }}
              />
            ))}
          </div>

          <div key={activeTab} ref={listRef} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {feedItems.length === 0 ? (
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "13px",
                }}
              >
                {activeTab === "news" ? "No macro news yet." : "No active events."}
                <br />
                <span style={{ fontSize: "11px", opacity: 0.7 }}>
                  {activeTab === "news"
                    ? "GDELT headlines appear after the chokepoint refresh runs."
                    : "Events appear when source data refreshes."}
                </span>
              </div>
            ) : (
              feedItems.map((item) => (
                <FeedItemRow
                  key={item.id}
                  item={item}
                  onClick={() => {
                    if (item.type === "article" && item.url) {
                      window.open(item.url, "_blank", "noopener,noreferrer");
                      return;
                    }
                    if (item.lat !== null && item.lng !== null) {
                      onItemClick(item.lat, item.lng, item.chokepointId);
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

function FeedTabButton({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  selected: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      style={{
        position: "relative",
        zIndex: 3,
        minWidth: 0,
        border: selected
          ? "1px solid var(--color-accent)"
          : "1px solid var(--color-border-subtle)",
        borderRadius: "6px",
        background: selected
          ? "rgba(0, 212, 255, 0.12)"
          : "rgba(255, 255, 255, 0.03)",
        color: selected ? "var(--color-text)" : "var(--color-text-muted)",
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: "11px",
        fontWeight: 600,
        padding: "7px 6px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {label} {count}
    </button>
  );
}

function FeedItemRow({
  item,
  onClick,
}: {
  item: FeedItem;
  onClick: () => void;
}) {
  const stateColor = item.accentColor ?? (item.state ? STATE_COLORS[item.state] : "#6b7280");
  const isConflict = item.type === "conflict";

  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--color-border-subtle)",
        cursor: item.url || item.lat !== null ? "pointer" : "default",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--color-surface-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      role={item.url || item.lat !== null ? "button" : undefined}
      tabIndex={item.url || item.lat !== null ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "4px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: isConflict ? "#ef4444" : stateColor,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--color-text)",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.chokepointName ?? item.sourceLabel ?? "Unmapped"}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: "var(--color-text-dim)",
            flexShrink: 0,
          }}
        >
          {timeAgo(item.timestamp)}
        </span>
      </div>

      <div
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "12px",
          color: "var(--color-text)",
          lineHeight: 1.4,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          marginBottom: "2px",
        }}
      >
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {item.title}
          </a>
        ) : (
          item.title
        )}
      </div>

      <div
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "10px",
          color: "var(--color-text-dim)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {item.sourceLabel ? `${item.sourceLabel} - ${item.detail}` : item.detail}
      </div>
    </div>
  );
}

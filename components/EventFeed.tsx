import React, { useMemo } from "react";
import type { ConflictEvent, DisruptionStateCache, DisruptionState, DisasterEvent, DisasterType } from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";

interface FeedItem {
  id: string;
  type: "conflict" | "article" | "disaster";
  timestamp: string; // ISO 8601
  chokepointId: string | null;
  chokepointName: string | null;
  title: string;
  detail: string;
  state: DisruptionState | null;
  lat: number | null;
  lng: number | null;
  icon?: string;
  accentColor?: string;
}

const DISASTER_ICONS: Record<DisasterType, string> = {
  earthquake: "🌍",
  storm:      "🌀",
  wildfire:   "🔥",
  flood:      "🌊",
  volcano:    "🌋",
  drought:    "🌵",
};

interface EventFeedProps {
  open: boolean;
  onToggle: () => void;
  conflictEvents: ConflictEvent[];
  disasterEvents?: DisasterEvent[];
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
  stressed: "#f59e0b",
  disrupted: "#ef4444",
  unknown: "#6b7280",
};

export default function EventFeed({
  open,
  onToggle,
  conflictEvents,
  disasterEvents = [],
  cache,
  onItemClick,
}: EventFeedProps) {
  // Build unified feed combining ACLED events + disaster events + GDELT article headlines
  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    // Disaster events (earthquakes, storms, wildfires, floods, volcanoes, droughts)
    for (const event of disasterEvents) {
      const cp = event.nearestChokepointId
        ? CHOKEPOINTS.find((c) => c.id === event.nearestChokepointId)
        : null;
      const severityColor =
        event.severity === "alert" ? "#ef4444" :
        event.severity === "warning" ? "#f97316" : "#f59e0b";
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
        icon: DISASTER_ICONS[event.type] ?? "⚠️",
        accentColor: severityColor,
      });
    }

    // ACLED conflict events — near chokepoints only
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
        title: `${event.type} — ${event.country}`,
        detail: event.description,
        state,
        lat: event.lat,
        lng: event.lng,
      });
    }

    // GDELT article headlines from disrupted/stressed chokepoints
    if (cache) {
      for (const [id, cpState] of Object.entries(cache.chokepoints)) {
        if (cpState.state !== "disrupted" && cpState.state !== "stressed") continue;
        const cp = CHOKEPOINTS.find((c) => c.id === id);
        for (const article of cpState.articles.slice(0, 3)) {
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
          });
        }
      }
    }

    // Sort newest first
    items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return items.slice(0, 50);
  }, [conflictEvents, cache]);

  // Toggle button — always visible
  const toggleButton = (
    <button
      onClick={onToggle}
      style={{
        position: "fixed",
        right: open ? "376px" : "16px",
        bottom: "80px",
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
          background: feedItems.length > 0 ? "#ef4444" : "#22c55e",
          flexShrink: 0,
        }}
      />
      Feed
      {feedItems.length > 0 && (
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: "var(--color-text-muted)",
          }}
        >
          {feedItems.length}
        </span>
      )}
    </button>
  );

  return (
    <>
      {toggleButton}

      {/* Feed panel */}
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
            zIndex: 55,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
          role="feed"
          aria-label="Live geopolitical event feed"
        >
          {/* Panel header */}
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
              Live Events
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                color: "var(--color-text-muted)",
              }}
            >
              {feedItems.length} events
            </span>
          </div>

          {/* Feed items */}
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
              No active events.
              <br />
              <span style={{ fontSize: "11px", opacity: 0.7 }}>
                Events appear when chokepoints are stressed or disrupted.
              </span>
            </div>
          ) : (
            feedItems.map((item) => (
              <FeedItemRow
                key={item.id}
                item={item}
                onClick={() => {
                  if (item.lat !== null && item.lng !== null) {
                    onItemClick(item.lat, item.lng, item.chokepointId);
                  }
                }}
              />
            ))
          )}
        </div>
      )}
    </>
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
  const isDisaster = item.type === "disaster";

  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--color-border-subtle)",
        cursor: item.lat !== null ? "pointer" : "default",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background =
          "var(--color-surface-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
      role={item.lat !== null ? "button" : undefined}
      tabIndex={item.lat !== null ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      {/* Top row: state dot + chokepoint name + time */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "4px",
        }}
      >
        {isDisaster && item.icon ? (
          <span style={{ fontSize: "12px", flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
        ) : (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isConflict ? "#ef4444" : stateColor,
              flexShrink: 0,
            }}
          />
        )}
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
          {item.chokepointName ?? "Unknown"}
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

      {/* Title */}
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
        {item.title}
      </div>

      {/* Detail / source */}
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
        {item.detail}
      </div>
    </div>
  );
}

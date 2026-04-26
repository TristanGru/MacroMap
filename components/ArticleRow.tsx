/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import type { NewsArticle, ResourceType } from "@/lib/types";

interface ArticleRowProps {
  article: NewsArticle;
  resourceType?: ResourceType;
}

function formatRecency(publishedAt: string): string {
  const now = Date.now();
  const then = new Date(publishedAt).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function FallbackIcon({ resourceType }: { resourceType?: ResourceType }) {
  // Simple text-based fallback icons
  const icons: Record<string, string> = {
    oil: "🛢",
    gas: "⛽",
    lng: "🔵",
    container: "📦",
    copper: "🔶",
    grain: "🌾",
    coal: "⬛",
  };
  return (
    <div
      style={{
        width: "80px",
        height: "56px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        flexShrink: 0,
      }}
    >
      {resourceType ? icons[resourceType] ?? "📰" : "📰"}
    </div>
  );
}

export default function ArticleRow({ article, resourceType }: ArticleRowProps) {
  const [imgError, setImgError] = useState(false);
  const [visited, setVisited] = useState(false);

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setVisited(true)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        height: "56px",
        textDecoration: "none",
        borderBottom: "1px solid var(--color-border-subtle)",
        transition: "background 120ms ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background =
          "var(--color-surface-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
      }}
    >
      {/* Thumbnail */}
      {article.thumbnailUrl && !imgError ? (
        <img
          src={article.thumbnailUrl}
          alt=""
          onError={() => setImgError(true)}
          style={{
            width: "80px",
            height: "56px",
            objectFit: "cover",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        />
      ) : (
        <FallbackIcon resourceType={resourceType} />
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "0 12px",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Source + time row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "2px",
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "11px",
              color: "var(--color-text-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "120px",
            }}
          >
            {article.source}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "var(--color-text-dim)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {formatRecency(article.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "13px",
            color: visited ? "var(--color-text-dim)" : "var(--color-text)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </div>
      </div>
    </a>
  );
}

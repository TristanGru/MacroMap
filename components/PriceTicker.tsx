import React from "react";
import type { PriceData } from "@/lib/types";

interface PriceTickerProps {
  brent: PriceData | null;
  wti: PriceData | null;
}

function PriceItem({
  label,
  data,
}: {
  label: string;
  data: PriceData | null;
}) {
  const isStale =
    data != null &&
    (new Date().getTime() - new Date(data.fetchedAt).getTime() > 30 * 60 * 1000);

  const deltaColor =
    data && data.delta24h != null && data.delta24h > 0
      ? "var(--color-clean)"
      : data && data.delta24h != null && data.delta24h < 0
      ? "var(--color-disrupted)"
      : "var(--color-text-muted)";

  return (
    <span style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
      <span
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: "11px",
          color: "var(--color-text-muted)",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      {data ? (
        <>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "20px",
              fontWeight: 500,
              color: "var(--color-text-data)",
              lineHeight: 1,
            }}
          >
            ${data.current.toFixed(2)}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
              color: deltaColor,
            }}
          >
            {data.delta24h != null ? (data.delta24h > 0 ? "▲" : data.delta24h < 0 ? "▼" : "") : ""}
            {data.delta24h != null ? `${Math.abs(data.delta24h).toFixed(1)}%` : "—"}
          </span>
        </>
      ) : (
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "20px",
            color: "var(--color-text-muted)",
          }}
        >
          — —
        </span>
      )}
      {isStale && (
        <span
          title="Data may be stale (last updated >30 min ago)"
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--color-text-muted)",
            display: "inline-block",
            cursor: "help",
          }}
        />
      )}
    </span>
  );
}

export default function PriceTicker({ brent, wti }: PriceTickerProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        zIndex: 50,
      }}
      aria-label="Commodity prices"
      role="status"
    >
      <PriceItem label="Brent" data={brent} />
      <div
        style={{
          width: "1px",
          height: "20px",
          background: "var(--color-border)",
        }}
      />
      <PriceItem label="WTI" data={wti} />
    </div>
  );
}

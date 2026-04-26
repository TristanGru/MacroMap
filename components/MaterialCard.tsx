import React from "react";
import type { ResourceType } from "@/lib/types";
import { MATERIAL_INFO } from "@/data/material-info";

interface MaterialCardProps {
  resourceType: ResourceType;
  onClose: () => void;
}

export default function MaterialCard({ resourceType, onClose }: MaterialCardProps) {
  const info = MATERIAL_INFO[resourceType];
  if (!info) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={`${info.label} information`}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        width: "320px",
        background: "rgba(13, 31, 60, 0.97)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${info.color}44`,
        borderLeft: `3px solid ${info.color}`,
        borderRadius: "10px",
        zIndex: 70,
        overflow: "hidden",
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${info.color}22`,
        animation: "materialCardIn 180ms ease-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 14px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
            <span style={{ fontSize: "18px" }}>{info.emoji}</span>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              {info.label}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "11px",
              color: info.color,
              fontStyle: "italic",
            }}
          >
            {info.tagline}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close material info"
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            fontSize: "18px",
            cursor: "pointer",
            padding: "2px 4px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", maxHeight: "340px", overflowY: "auto" }}>
        {/* Geopolitics */}
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: "5px",
          }}
        >
          Why it matters
        </div>
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.6,
            margin: "0 0 12px 0",
          }}
        >
          {info.geopolitics}
        </p>

        {/* Consumer impact */}
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: "5px",
          }}
        >
          What it means for you
        </div>
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.6,
            margin: "0 0 12px 0",
          }}
        >
          {info.consumerImpact}
        </p>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {info.stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {stat.label}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  color: info.color,
                }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { readCache } from "@/lib/disruption-state";
import type { DisruptionState } from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";

interface SnapshotProps {
  disruptedCount: number;
  stressedCount: number;
  brentPrice: number | null;
  brentDelta: number | null;
  chokepointSummary: Array<{
    id: string;
    name: string;
    state: DisruptionState;
  }>;
  generatedAt: string;
}

const STATE_DOT_COLORS: Record<DisruptionState, string> = {
  clean: "#22c55e",
  elevated: "#06b6d4",
  stressed: "#f59e0b",
  disrupted: "#ef4444",
  unknown: "#6b7280",
};

const STATE_SYMBOLS: Record<DisruptionState, string> = {
  clean: "○",
  elevated: "◐",
  stressed: "◑",
  disrupted: "●",
  unknown: "○",
};

const SnapshotPage: NextPage<SnapshotProps> = ({
  disruptedCount,
  stressedCount,
  brentPrice,
  brentDelta,
  chokepointSummary,
  generatedAt,
}) => {
  const title =
    disruptedCount > 0
      ? `${disruptedCount} route${disruptedCount > 1 ? "s" : ""} disrupted — Macro Map`
      : stressedCount > 0
      ? `${stressedCount} route${stressedCount > 1 ? "s" : ""} stressed — Macro Map`
      : "All routes clear — Macro Map";

  const priceStr =
    brentPrice != null
      ? `Brent crude $${brentPrice.toFixed(2)}${brentDelta != null ? ` ${brentDelta > 0 ? "▲" : "▼"}${Math.abs(brentDelta).toFixed(1)}%` : ""}`
      : "";

  const disruptedNames = chokepointSummary
    .filter((c) => c.state === "disrupted")
    .map((c) => c.name)
    .join(" · ");

  const description = [
    priceStr,
    disruptedNames ? `${disruptedNames} disrupted` : "",
    "Live resource flow tracker.",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'IBM Plex Sans', sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            width: "100%",
            padding: "48px 40px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Macro Map
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "13px",
                color: "var(--color-text-muted)",
              }}
            >
              macromap.xyz
            </span>
          </div>

          {/* Disruption count */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 500,
              color: "#ffffff",
              marginBottom: "8px",
              lineHeight: 1.1,
            }}
          >
            {disruptedCount > 0
              ? `${disruptedCount} route${disruptedCount > 1 ? "s" : ""} disrupted`
              : stressedCount > 0
              ? `${stressedCount} route${stressedCount > 1 ? "s" : ""} stressed`
              : "All routes clear"}
          </div>

          {/* Price line */}
          {brentPrice != null && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "20px",
                color: "var(--color-text-muted)",
                marginBottom: "32px",
              }}
            >
              Brent crude ${brentPrice.toFixed(2)}
              {brentDelta != null && (
                <span
                  style={{
                    color:
                      brentDelta > 0
                        ? "var(--color-clean)"
                        : brentDelta < 0
                        ? "var(--color-disrupted)"
                        : "inherit",
                    marginLeft: "8px",
                  }}
                >
                  {brentDelta > 0 ? "▲" : "▼"} {Math.abs(brentDelta).toFixed(1)}%
                </span>
              )}
            </div>
          )}

          {/* Chokepoint list */}
          <div style={{ marginBottom: "32px" }}>
            {chokepointSummary.map((cp) => (
              <div
                key={cp.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--color-border-subtle)",
                }}
              >
                <span
                  style={{
                    color: STATE_DOT_COLORS[cp.state],
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  {STATE_SYMBOLS[cp.state]}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    color: STATE_DOT_COLORS[cp.state],
                    width: "80px",
                    flexShrink: 0,
                  }}
                >
                  {cp.state.toUpperCase()}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "14px",
                    color: "var(--color-text)",
                  }}
                >
                  {cp.name}
                </span>
              </div>
            ))}
          </div>

          {/* Generated at */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "var(--color-text-dim)",
              marginBottom: "20px",
            }}
          >
            Updated {new Date(generatedAt).toUTCString()}
          </div>

          {/* CTA button */}
          <Link
            href="/"
            style={{
              display: "inline-block",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              padding: "10px 20px",
              color: "#ffffff",
              textDecoration: "none",
              transition: "background 150ms ease",
            }}
          >
            View live globe →
          </Link>
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<SnapshotProps> = async () => {
  try {
    const cache = await readCache();

    const chokepointSummary = CHOKEPOINTS.sort(
      (a, b) => b.strategicImportance - a.strategicImportance
    ).map((cp) => ({
      id: cp.id,
      name: cp.name,
      state: cache.chokepoints[cp.id]?.state ?? ("unknown" as DisruptionState),
    }));

    const disrupted = chokepointSummary.filter((c) => c.state === "disrupted");
    const stressed = chokepointSummary.filter((c) => c.state === "stressed");

    return {
      props: {
        disruptedCount: disrupted.length,
        stressedCount: stressed.length,
        brentPrice: cache.prices.brent?.current ?? null,
        brentDelta: cache.prices.brent?.delta24h ?? null,
        chokepointSummary,
        generatedAt: cache.fetchedAt ?? new Date().toISOString(),
      },
    };
  } catch {
    return {
      props: {
        disruptedCount: 0,
        stressedCount: 0,
        brentPrice: null,
        brentDelta: null,
        chokepointSummary: CHOKEPOINTS.map((cp) => ({
          id: cp.id,
          name: cp.name,
          state: "unknown" as DisruptionState,
        })),
        generatedAt: new Date().toISOString(),
      },
    };
  }
};

export default SnapshotPage;

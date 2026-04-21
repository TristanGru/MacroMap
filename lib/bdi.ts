import type { BDIData } from "@/lib/types";

/** Trading Economics API — Baltic Dry Index (updates once per trading day) */

interface TradingEconomicsEntry {
  Symbol: string;
  Name: string;
  Close: number;
  CloseYesterday?: number;
  PercentChange1D?: number;
  Date?: string;
}

/**
 * Fetches the Baltic Dry Index from Trading Economics.
 * Returns null if TRADING_ECONOMICS_KEY is not set or request fails.
 */
export async function fetchBDI(): Promise<BDIData | null> {
  const key = process.env.TRADING_ECONOMICS_KEY;
  if (!key) {
    console.warn("[bdi] TRADING_ECONOMICS_KEY not set — skipping BDI fetch");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.tradingeconomics.com/markets/index/BDI?c=${encodeURIComponent(key)}&f=json`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) {
      console.warn(`[bdi] Non-200: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as TradingEconomicsEntry[];
    const entry = Array.isArray(data) ? data[0] : null;
    if (!entry || entry.Close == null) {
      console.warn("[bdi] No BDI data in response");
      return null;
    }

    const delta24h =
      entry.PercentChange1D != null
        ? entry.PercentChange1D
        : entry.CloseYesterday != null && entry.CloseYesterday !== 0
        ? ((entry.Close - entry.CloseYesterday) / entry.CloseYesterday) * 100
        : 0;

    return {
      current: entry.Close,
      delta24h,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("[bdi] Fetch error:", err);
    return null;
  }
}

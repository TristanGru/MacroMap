import type { PriceData, PricePoint } from "@/lib/types";

const EIA_V2_BASE = "https://api.eia.gov/v2";

// Brent crude: petroleum/pri/spt Brent series
// WTI: petroleum/pri/spt WTI series
const V2_ROUTES = {
  brent: `${EIA_V2_BASE}/petroleum/pri/spt/data/`,
  wti: `${EIA_V2_BASE}/petroleum/pri/spt/data/`,
};

// v2 series filter params (correct RBRTE / RWTC series IDs for /petroleum/pri/spt/data/)
const V2_PARAMS = {
  brent: "RBRTE",
  wti: "RWTC",
};

function apiKey(): string {
  return process.env.EIA_API_KEY ?? "";
}

interface EiaV2DataPoint {
  period: string;  // "2026-04-01"
  value: number | string;
}

interface EiaV2Response {
  response?: {
    data?: EiaV2DataPoint[];
  };
}

/**
 * Fetch EIA v2 price data for one series.
 * Falls back to v1 if v2 fails.
 */
async function fetchEiaV2(
  seriesParam: string
): Promise<{ current: number; history30d: PricePoint[] } | null> {
  const key = apiKey();
  if (!key) return null;

  const params = new URLSearchParams({
    api_key: key,
    frequency: "daily",
    "data[0]": "value",
    "facets[series][]": seriesParam,
    "sort[0][column]": "period",
    "sort[0][direction]": "desc",
    offset: "0",
    length: "31", // 30 days + 1 for delta calc
  });

  try {
    const res = await fetch(`${V2_ROUTES.brent}?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const json: EiaV2Response = await res.json();
    const data = json.response?.data;
    if (!data || data.length === 0) return null;

    const points: PricePoint[] = data
      .map((d) => ({
        date: d.period,
        price: typeof d.value === "number" ? d.value : parseFloat(String(d.value)),
      }))
      .filter((p) => !isNaN(p.price))
      .sort((a, b) => a.date.localeCompare(b.date)); // ascending

    if (points.length === 0) return null;

    const current = points[points.length - 1].price;
    const history30d = points.slice(-30);

    return { current, history30d };
  } catch {
    return null;
  }
}

/**
 * Fetch both Brent and WTI prices.
 * Returns PriceData with delta calculated from the last two available points.
 */
export async function fetchPriceData(
  ticker: "brent" | "wti"
): Promise<PriceData | null> {
  const seriesParam = V2_PARAMS[ticker];

  // EIA v1 API was retired Jan 2024 — v2 only
  const result = await fetchEiaV2(seriesParam);
  if (!result) {
    if (!apiKey()) {
      console.warn(`[eia] EIA_API_KEY not set — skipping ${ticker}`);
    } else {
      console.error(`[eia] v2 failed for ${ticker} (series: ${seriesParam})`);
    }
    return null;
  }

  const { current, history30d } = result;

  // Calculate 24h delta as percentage
  let delta24h = 0;
  if (history30d.length >= 2) {
    const prev = history30d[history30d.length - 2].price;
    if (prev > 0) {
      delta24h = parseFloat(((current - prev) / prev * 100).toFixed(1));
    }
  }

  return {
    current,
    delta24h,
    history30d,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch both Brent and WTI prices.
 */
export async function fetchAllPrices(): Promise<{
  brent: PriceData | null;
  wti: PriceData | null;
}> {
  const [brent, wti] = await Promise.allSettled([
    fetchPriceData("brent"),
    fetchPriceData("wti"),
  ]);

  return {
    brent: brent.status === "fulfilled" ? brent.value : null,
    wti: wti.status === "fulfilled" ? wti.value : null,
  };
}

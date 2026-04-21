import type { PriceData, PricePoint } from "@/lib/types";

const EIA_V2_BASE = "https://api.eia.gov/v2";
const EIA_V1_BASE = "https://api.eia.gov/series";

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

// v1 fallback series IDs
const V1_SERIES = {
  brent: "PET.RBRTE.D",
  wti: "PET.RWTC.D",
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

interface EiaV1Response {
  series?: Array<{
    data?: Array<[string, number]>; // ["20260401", 89.40]
  }>;
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
 * Fetch EIA v1 price data (fallback).
 */
async function fetchEiaV1(
  seriesId: string
): Promise<{ current: number; history30d: PricePoint[] } | null> {
  const key = apiKey();
  if (!key) return null;

  const params = new URLSearchParams({
    api_key: key,
    series_id: seriesId,
    num: "31",
    out: "json",
    sort: "desc",
  });

  try {
    const res = await fetch(`${EIA_V1_BASE}/?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const json: EiaV1Response = await res.json();
    const rawData = json.series?.[0]?.data;
    if (!rawData || rawData.length === 0) return null;

    const points: PricePoint[] = rawData
      .map(([dateStr, price]) => {
        // v1 format: "20260401" → "2026-04-01"
        const d = String(dateStr);
        const date = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
        return { date, price: typeof price === "number" ? price : 0 };
      })
      .sort((a, b) => a.date.localeCompare(b.date)); // ascending

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
  const v1Series = V1_SERIES[ticker];

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

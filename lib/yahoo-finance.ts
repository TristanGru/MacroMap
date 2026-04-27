import type { CommodityPrices, PriceData, PricePoint } from "@/lib/types";

const YAHOO_CHART_BASE = "https://query2.finance.yahoo.com/v8/finance/chart";

const SYMBOLS = {
  brent: "BZ=F",
  wti: "CL=F",
  natGas: "NG=F",
  wheat: "ZW=F",
  copper: "HG=F",
} as const;

type CommodityKey = keyof typeof SYMBOLS;

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        regularMarketTime?: number;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
  };
}

function unixDate(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

function unixIso(seconds: number | undefined): string {
  return seconds ? new Date(seconds * 1000).toISOString() : new Date().toISOString();
}

function priceFromYahoo(json: YahooChartResponse): PriceData | null {
  const result = json.chart?.result?.[0];
  if (!result) return null;

  const timestamps = result.timestamp ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const history30d: PricePoint[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (typeof close !== "number" || !Number.isFinite(close)) continue;
    history30d.push({
      date: unixDate(timestamps[i]),
      price: Number(close.toFixed(4)),
    });
  }

  const marketPrice = result.meta?.regularMarketPrice;
  const current =
    typeof marketPrice === "number" && Number.isFinite(marketPrice)
      ? marketPrice
      : history30d.at(-1)?.price;
  if (typeof current !== "number" || !Number.isFinite(current)) return null;

  const prev = history30d.length >= 2 ? history30d[history30d.length - 2].price : null;
  const delta24h = prev && prev > 0 ? Number((((current - prev) / prev) * 100).toFixed(1)) : 0;

  return {
    current: Number(current.toFixed(4)),
    delta24h,
    history30d: history30d.slice(-30),
    fetchedAt: unixIso(result.meta?.regularMarketTime),
  };
}

export async function fetchYahooCommodityPrice(key: CommodityKey): Promise<PriceData | null> {
  const symbol = encodeURIComponent(SYMBOLS[key]);
  try {
    const res = await fetch(`${YAHOO_CHART_BASE}/${symbol}?range=1mo&interval=1d`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 MacroMap/2.0",
      },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) {
      console.warn(`[yahoo-finance] ${SYMBOLS[key]} returned ${res.status}`);
      return null;
    }

    return priceFromYahoo((await res.json()) as YahooChartResponse);
  } catch (err) {
    console.warn(`[yahoo-finance] ${SYMBOLS[key]} fetch failed:`, err);
    return null;
  }
}

export async function fetchYahooCommodityPrices(): Promise<Omit<CommodityPrices, "bdi">> {
  const [brent, wti, natGas, wheat, copper] = await Promise.all([
    fetchYahooCommodityPrice("brent"),
    fetchYahooCommodityPrice("wti"),
    fetchYahooCommodityPrice("natGas"),
    fetchYahooCommodityPrice("wheat"),
    fetchYahooCommodityPrice("copper"),
  ]);

  return { brent, wti, natGas, wheat, copper };
}

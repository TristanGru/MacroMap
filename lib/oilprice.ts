import type { PriceData } from "@/lib/types";

/** Oil Price API free tier — covers Brent, WTI, Henry Hub, wheat, copper */

interface OilPriceApiResponse {
  status: string;
  data: {
    price: number;
    formatted: string;
    currency: string;
    code: string;
    created_at: string;
    type: string;
  };
}

const COMMODITY_CODES: Record<string, string> = {
  brent: "BRENT_CRUDE_USD",
  wti: "WTI_USD",
  natGas: "NATURAL_GAS_USD",
  wheat: "WHEAT_USD",
  copper: "COPPER_USD",
};

async function fetchOnePrice(code: string, key: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.oilpriceapi.com/v1/prices/latest?by_code=${code}`,
      {
        headers: {
          Authorization: `Token ${key}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) {
      console.warn(`[oilprice] Non-200 for ${code}: ${res.status}`);
      return null;
    }
    const json = (await res.json()) as OilPriceApiResponse;
    return json.data?.price ?? null;
  } catch (err) {
    console.warn(`[oilprice] Fetch error for ${code}:`, err);
    return null;
  }
}

/**
 * Fetches all commodity prices from Oil Price API.
 * Returns null for each commodity if the API key is not set or request fails.
 */
export async function fetchCommodityPrices(): Promise<
  Record<"brent" | "wti" | "natGas" | "wheat" | "copper", PriceData | null>
> {
  const key = process.env.OIL_PRICE_API_KEY;
  const now = new Date().toISOString();

  if (!key) {
    console.warn("[oilprice] OIL_PRICE_API_KEY not set — skipping fetch");
    return { brent: null, wti: null, natGas: null, wheat: null, copper: null };
  }

  const [brentRaw, wtiRaw, natGasRaw, wheatRaw, copperRaw] = await Promise.all([
    fetchOnePrice(COMMODITY_CODES.brent, key),
    fetchOnePrice(COMMODITY_CODES.wti, key),
    fetchOnePrice(COMMODITY_CODES.natGas, key),
    fetchOnePrice(COMMODITY_CODES.wheat, key),
    fetchOnePrice(COMMODITY_CODES.copper, key),
  ]);

  const makePriceData = (current: number | null): PriceData | null => {
    if (current === null) return null;
    return {
      current,
      delta24h: 0, // Oil Price API free tier doesn't provide historical — delta requires KV comparison
      history30d: [],
      fetchedAt: now,
    };
  };

  return {
    brent: makePriceData(brentRaw),
    wti: makePriceData(wtiRaw),
    natGas: makePriceData(natGasRaw),
    wheat: makePriceData(wheatRaw),
    copper: makePriceData(copperRaw),
  };
}

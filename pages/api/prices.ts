import type { NextApiRequest, NextApiResponse } from "next";
import { readCache } from "@/lib/disruption-state";
import { fetchAllPrices } from "@/lib/eia";
import { fetchCommodityPrices } from "@/lib/oilprice";
import { fetchBDI } from "@/lib/bdi";
import { fetchMacroSignals } from "@/lib/fred";
import { fetchYahooCommodityPrices } from "@/lib/yahoo-finance";
import { kvGet, kvSet, KV_KEYS } from "@/lib/kv";
import type { CommodityPrices, DisruptionStateCache, MacroSignal, PriceData } from "@/lib/types";

const COMMODITY_KV_KEY = "macro-map:commodity-prices";
const COMMODITY_MAX_AGE_MS = 60 * 60 * 1000; // 1h for oil/grain/copper
const BDI_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h for BDI

function hasAnyPrice(prices: CommodityPrices): boolean {
  return Boolean(
    prices.brent ||
      prices.wti ||
      prices.natGas ||
      prices.wheat ||
      prices.copper ||
      prices.bdi
  );
}

function signalToPriceData(signal: MacroSignal | undefined): PriceData | null {
  if (!signal) return null;
  return {
    current: signal.value,
    delta24h: signal.delta,
    history30d: [],
    fetchedAt: signal.date,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommodityPrices>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  try {
    // Try to return cached commodity prices
    const cached = await kvGet<CommodityPrices>(COMMODITY_KV_KEY);
    if (cached) {
      const brentAge = cached.brent
        ? Date.now() - new Date(cached.brent.fetchedAt).getTime()
        : Infinity;
      const bdiAge = cached.bdi
        ? Date.now() - new Date(cached.bdi.fetchedAt).getTime()
        : Infinity;

      if (brentAge < COMMODITY_MAX_AGE_MS && bdiAge < BDI_MAX_AGE_MS) {
        return res.status(200).json(cached);
      }
    }

    // Fetch fresh prices in parallel
    const [yahooResult, eiaResult, commodityResult, bdiResult, macroSignals] = await Promise.all([
      fetchYahooCommodityPrices().catch(() => ({
        brent: null, wti: null, natGas: null, wheat: null, copper: null,
      })),
      fetchAllPrices().catch(() => ({ brent: null, wti: null })),
      fetchCommodityPrices().catch(() => ({
        brent: null, wti: null, natGas: null, wheat: null, copper: null,
      })),
      fetchBDI().catch(() => null),
      fetchMacroSignals().catch(() => []),
    ]);
    const signalById = new Map(macroSignals.map((s) => [s.id, s]));

    const freshPrices: CommodityPrices = {
      // Prefer live futures for the visible "now" values. EIA/FRED remain
      // official fallbacks when the market endpoint is unavailable.
      brent: yahooResult.brent ?? eiaResult.brent ?? commodityResult.brent,
      wti: yahooResult.wti ?? eiaResult.wti ?? commodityResult.wti,
      natGas: yahooResult.natGas ?? commodityResult.natGas ?? signalToPriceData(signalById.get("DHHNGSP")),
      wheat: yahooResult.wheat ?? commodityResult.wheat ?? signalToPriceData(signalById.get("PWHEAMTUSDM")),
      copper: yahooResult.copper ?? commodityResult.copper ?? signalToPriceData(signalById.get("PCOPPUSDM")),
      bdi: bdiResult,
    };

    const stateCache = await readCache();
    const prices: CommodityPrices = {
      brent: freshPrices.brent ?? cached?.brent ?? stateCache.prices.brent,
      wti: freshPrices.wti ?? cached?.wti ?? stateCache.prices.wti,
      natGas: freshPrices.natGas ?? cached?.natGas ?? null,
      wheat: freshPrices.wheat ?? cached?.wheat ?? null,
      copper: freshPrices.copper ?? cached?.copper ?? null,
      bdi: freshPrices.bdi ?? cached?.bdi ?? null,
    };

    // Cache only known-good payloads. Missing prod env vars or provider outages
    // should not replace the last useful sidebar data with an all-null response.
    if (hasAnyPrice(prices)) {
      await kvSet(COMMODITY_KV_KEY, prices, { ex: 3600 });
    }

    // Also update the main disruption-state cache with fresh Brent/WTI
    if (freshPrices.brent || freshPrices.wti) {
      const updatedCache: DisruptionStateCache = {
        ...stateCache,
        prices: {
          brent: freshPrices.brent ?? stateCache.prices.brent,
          wti: freshPrices.wti ?? stateCache.prices.wti,
        },
        fetchedAt: new Date().toISOString(),
      };
      await kvSet(KV_KEYS.STATE, updatedCache);
    }

    return res.status(200).json(prices);
  } catch (err) {
    console.error("[prices] Error:", err);
    const fallback: CommodityPrices = {
      brent: null, wti: null, natGas: null, wheat: null, copper: null, bdi: null,
    };
    return res.status(200).json(fallback);
  }
}

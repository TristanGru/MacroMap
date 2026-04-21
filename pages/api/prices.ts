import type { NextApiRequest, NextApiResponse } from "next";
import { readCache } from "@/lib/disruption-state";
import { fetchAllPrices } from "@/lib/eia";
import { fetchCommodityPrices } from "@/lib/oilprice";
import { fetchBDI } from "@/lib/bdi";
import { kvGet, kvSet, KV_KEYS } from "@/lib/kv";
import type { CommodityPrices, DisruptionStateCache } from "@/lib/types";

const COMMODITY_KV_KEY = "macro-map:commodity-prices";
const COMMODITY_MAX_AGE_MS = 60 * 60 * 1000; // 1h for oil/grain/copper
const BDI_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h for BDI

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
    const [eiaResult, commodityResult, bdiResult] = await Promise.all([
      fetchAllPrices().catch(() => ({ brent: null, wti: null })),
      fetchCommodityPrices().catch(() => ({
        brent: null, wti: null, natGas: null, wheat: null, copper: null,
      })),
      fetchBDI().catch(() => null),
    ]);

    const prices: CommodityPrices = {
      // Prefer EIA for Brent/WTI (30-day history), fall back to Oil Price API
      brent: eiaResult.brent ?? commodityResult.brent,
      wti: eiaResult.wti ?? commodityResult.wti,
      natGas: commodityResult.natGas,
      wheat: commodityResult.wheat,
      copper: commodityResult.copper,
      bdi: bdiResult,
    };

    // Cache the result
    await kvSet(COMMODITY_KV_KEY, prices, { ex: 3600 });

    // Also update the main disruption-state cache with fresh Brent/WTI
    if (prices.brent || prices.wti) {
      const stateCache = await readCache();
      const updatedCache: DisruptionStateCache = {
        ...stateCache,
        prices: {
          brent: prices.brent ?? stateCache.prices.brent,
          wti: prices.wti ?? stateCache.prices.wti,
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

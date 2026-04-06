import type { NextApiRequest, NextApiResponse } from "next";
import { readCache } from "@/lib/disruption-state";
import { fetchAllPrices } from "@/lib/eia";
import { kvSet, KV_KEYS } from "@/lib/kv";
import type { DisruptionStateCache, PriceData } from "@/lib/types";

interface PricesResponse {
  brent: PriceData | null;
  wti: PriceData | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PricesResponse>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  try {
    const cache = await readCache();
    const priceAge = cache.prices.brent
      ? Date.now() - new Date(cache.prices.brent.fetchedAt).getTime()
      : Infinity;

    const PRICE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

    // Return cached prices if fresh
    if (priceAge < PRICE_MAX_AGE_MS && cache.prices.brent && cache.prices.wti) {
      return res.status(200).json({
        brent: cache.prices.brent,
        wti: cache.prices.wti,
      });
    }

    // Refresh prices
    const { brent, wti } = await fetchAllPrices();

    // Update KV with new prices (preserve chokepoint states)
    if (brent || wti) {
      const updatedCache: DisruptionStateCache = {
        ...cache,
        prices: {
          brent: brent ?? cache.prices.brent,
          wti: wti ?? cache.prices.wti,
        },
        fetchedAt: new Date().toISOString(),
      };
      await kvSet(KV_KEYS.STATE, updatedCache);
    }

    return res.status(200).json({
      brent: brent ?? cache.prices.brent,
      wti: wti ?? cache.prices.wti,
    });
  } catch (err) {
    console.error("[prices] Error:", err);
    return res.status(200).json({ brent: null, wti: null });
  }
}

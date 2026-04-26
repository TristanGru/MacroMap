import type { NextApiRequest, NextApiResponse } from "next";
import { readCache, isCacheStale, computeNewState, initialChokepointState } from "@/lib/disruption-state";
import type { DisruptionStateCache } from "@/lib/types";
import { emptyCache } from "@/lib/types";
import { kvSet, KV_KEYS } from "@/lib/kv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DisruptionStateCache>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  try {
    let cache = await readCache();

    // If KV is empty and fixtures are enabled, seed cache from fixtures immediately
    const useFixtures = process.env.NEXT_PUBLIC_USE_GDELT_FIXTURES === "true";
    const hasNoData = Object.keys(cache.chokepoints).length === 0;
    if (hasNoData && useFixtures) {
      const { GDELT_FIXTURES } = await import("@/lib/gdelt.fixtures");
      const { CHOKEPOINTS } = await import("@/data/chokepoints");
      const seeded = { ...cache };
      seeded.chokepoints = {};
      for (const cp of CHOKEPOINTS) {
        const fixture = GDELT_FIXTURES[cp.id];
        const articleCount = fixture?.articleCount ?? 0;
        const articles = fixture?.articles ?? [];
        const initial = initialChokepointState(cp.id);
        seeded.chokepoints[cp.id] = computeNewState(initial, articleCount, articles);
      }
      seeded.fetchedAt = new Date().toISOString();
      await kvSet(KV_KEYS.STATE, seeded);
      cache = seeded;
    }

    // Return cached data immediately
    res.status(200).json(cache);

    // If stale, trigger a background refresh of all chokepoints
    // Note: In Next.js Pages Router, we can't use after() — instead we fire
    // non-blocking parallel fetch calls to the per-chokepoint refresh route
    if (isCacheStale(cache)) {
      const baseUrl = getBaseUrl(req);
      const cronSecret = process.env.CRON_SECRET;

      if (cronSecret && baseUrl) {
        const { CHOKEPOINTS } = await import("@/data/chokepoints");

        // Fire and forget — don't await
        Promise.all(
          CHOKEPOINTS.map((cp) =>
            fetch(`${baseUrl}/api/refresh-chokepoint?id=${cp.id}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${cronSecret}` },
              signal: AbortSignal.timeout(15000),
            }).catch((err) =>
              console.warn(`[disruption-states] Background refresh failed for ${cp.id}:`, err)
            )
          )
        );
      }
    }
  } catch (err) {
    console.error("[disruption-states] Error:", err);
    return res.status(200).json(emptyCache());
  }
}

function getBaseUrl(req: NextApiRequest): string {
  const host = req.headers.host;
  const protocol =
    process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${host}`;
}

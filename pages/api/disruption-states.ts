import type { NextApiRequest, NextApiResponse } from "next";
import {
  computeNewState,
  applyManualChokepointStates,
  initialChokepointState,
  isCacheStale,
  readCache,
} from "@/lib/disruption-state";
import {
  getPortWatchFlowEvidence,
  getPortWatchSnapshot,
  PORTWATCH_ENABLED_CHOKEPOINT_IDS,
} from "@/lib/portwatch";
import type { DisruptionStateCache } from "@/lib/types";
import { emptyCache } from "@/lib/types";
import { kvSet, KV_KEYS } from "@/lib/kv";
import { CHOKEPOINTS } from "@/data/chokepoints";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureCompleteCache(cache: DisruptionStateCache): DisruptionStateCache {
  let changed = false;
  const chokepoints = { ...cache.chokepoints };

  for (const cp of CHOKEPOINTS) {
    const current = chokepoints[cp.id];
    if (!current) {
      changed = true;
      chokepoints[cp.id] = initialChokepointState(cp.id);
    }
  }

  return changed ? { ...cache, chokepoints } : cache;
}

async function hydratePriorityChokepoints(cache: DisruptionStateCache): Promise<DisruptionStateCache> {
  const priorityIds = PORTWATCH_ENABLED_CHOKEPOINT_IDS;
  let changed = false;
  const chokepoints = { ...cache.chokepoints };

  for (const id of priorityIds) {
    const current = chokepoints[id] ?? initialChokepointState(id);
    if (current.observedFlow && current.articleCount > 0 && current.state !== "unknown") continue;

    try {
      const observedFlow = await getPortWatchFlowEvidence(id);
      if (current.articleCount === 0 && current.articles.length === 0 && !observedFlow) continue;
      chokepoints[id] = computeNewState(
        current,
        current.articleCount,
        current.articles,
        observedFlow
      );
      changed = true;
    } catch (err) {
      console.warn(`[disruption-states] Priority hydrate failed for ${id}:`, err);
    }
  }

  return changed ? { ...cache, chokepoints, fetchedAt: new Date().toISOString() } : cache;
}

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

    const completedCache = ensureCompleteCache(cache);
    if (completedCache !== cache) {
      cache = { ...completedCache, fetchedAt: new Date().toISOString() };
      await kvSet(KV_KEYS.STATE, cache);
    }

    const hasPriorityGap = PORTWATCH_ENABLED_CHOKEPOINT_IDS.some((id) => {
      const state = cache.chokepoints[id];
      return !state || !state.observedFlow || state.articleCount === 0 || state.state === "unknown";
    });
    if (hasPriorityGap) {
      const hydratedCache = await hydratePriorityChokepoints(cache);
      if (hydratedCache !== cache) {
        cache = hydratedCache;
        await kvSet(KV_KEYS.STATE, cache);
      }
    }

    const normalizedCache = applyManualChokepointStates(cache);
    if (normalizedCache !== cache) {
      cache = normalizedCache;
      await kvSet(KV_KEYS.STATE, cache);
    }

    const snapshot = await getPortWatchSnapshot();
    if (snapshot.reroutes.length > 0) {
      cache = { ...cache, portWatchReroutes: snapshot.reroutes };
      await kvSet(KV_KEYS.STATE, cache);
    }

    res.status(200).json(cache);

    if (hasNoData || isCacheStale(cache)) {
      const baseUrl = getBaseUrl(req);
      const cronSecret = process.env.CRON_SECRET;

      if (cronSecret && baseUrl) {
        void (async () => {
          for (const cp of CHOKEPOINTS) {
            try {
              await fetch(`${baseUrl}/api/refresh-chokepoint?id=${cp.id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${cronSecret}` },
                signal: AbortSignal.timeout(15000),
              });
            } catch (err) {
              console.warn(`[disruption-states] Background refresh failed for ${cp.id}:`, err);
            }
            await delay(1200);
          }
        })();
      }
    }
  } catch (err) {
    console.error("[disruption-states] Error:", err);
    return res.status(200).json(emptyCache());
  }
}

function getBaseUrl(req: NextApiRequest): string {
  const host = req.headers.host;
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${host}`;
}

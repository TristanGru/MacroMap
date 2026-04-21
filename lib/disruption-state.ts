import type { ChokepointState, DisruptionState, DisruptionStateCache, RiskTimelineEntry } from "@/lib/types";
import { kvGet, kvSet, kvDel, KV_KEYS } from "@/lib/kv";
import { emptyCache } from "@/lib/types";

const DISRUPTION_THRESHOLD = parseInt(
  process.env.DISRUPTION_THRESHOLD ?? "10",
  10
);
const STRESSED_THRESHOLD = 3;
const HYSTERESIS_COUNT = 3; // N-of-3 consecutive polls required to change state

/**
 * Compute new state based on article count + current hysteresis counters.
 * Returns updated ChokepointState (does not write to KV).
 */
export function computeNewState(
  current: ChokepointState,
  articleCount: number,
  articles: import("@/lib/types").NewsArticle[]
): ChokepointState {
  const currentState = current.state;
  let { consecutivePollsAboveThreshold, consecutivePollsBelowClean } = current;

  // Determine target state based on article count
  let targetState: DisruptionState;
  if (articleCount >= DISRUPTION_THRESHOLD) {
    targetState = "disrupted";
  } else if (articleCount >= STRESSED_THRESHOLD) {
    targetState = "stressed";
  } else {
    targetState = "clean";
  }

  // Hysteresis: consecutivePollsAboveThreshold counts polls with articleCount >= STRESSED_THRESHOLD.
  // consecutivePollsBelowClean counts polls with articleCount < STRESSED_THRESHOLD.
  // Require N-of-3 consecutive polls before transitioning in either direction.
  let newState = currentState;

  // If state is unknown, skip hysteresis and transition immediately
  if (currentState === "unknown") {
    return {
      chokepointId: current.chokepointId,
      state: targetState,
      articleCount,
      articles: articles.slice(0, 5),
      lastUpdatedAt: new Date().toISOString(),
      consecutivePollsAboveThreshold: targetState !== "clean" ? 1 : 0,
      consecutivePollsBelowClean: targetState === "clean" ? 1 : 0,
    };
  }

  if (targetState === "disrupted" || targetState === "stressed") {
    consecutivePollsAboveThreshold += 1;
    consecutivePollsBelowClean = 0;
    if (consecutivePollsAboveThreshold >= HYSTERESIS_COUNT) {
      // Use the most recent article count to distinguish disrupted vs stressed
      newState = targetState;
    }
  } else {
    // targetState === "clean"
    consecutivePollsAboveThreshold = 0;
    consecutivePollsBelowClean += 1;
    if (consecutivePollsBelowClean >= HYSTERESIS_COUNT) {
      newState = "clean";
    }
  }

  return {
    chokepointId: current.chokepointId,
    state: newState,
    articleCount,
    articles: articles.slice(0, 5),
    lastUpdatedAt: new Date().toISOString(),
    consecutivePollsAboveThreshold,
    consecutivePollsBelowClean,
  };
}

/** Initial state for a chokepoint not yet in KV */
export function initialChokepointState(id: string): ChokepointState {
  return {
    chokepointId: id,
    state: "unknown",
    articleCount: 0,
    articles: [],
    lastUpdatedAt: new Date().toISOString(),
    consecutivePollsAboveThreshold: 0,
    consecutivePollsBelowClean: 0,
  };
}

/**
 * Read the full cache from KV. Returns empty cache on failure.
 */
export async function readCache(): Promise<DisruptionStateCache> {
  try {
    const cache = await kvGet<DisruptionStateCache>(KV_KEYS.STATE);
    return cache ?? emptyCache();
  } catch (err) {
    console.error("[disruption-state] KV read error:", err);
    return emptyCache();
  }
}

/**
 * Update a single chokepoint in KV under a write lock.
 * Fetches full cache, updates the chokepoint, writes back.
 *
 * @param chokepointId - The chokepoint to update
 * @param articleCount - GDELT article count from this poll
 * @param articles - Article list from this poll
 * @returns { success, newState }
 */
export async function updateChokepointInKV(
  chokepointId: string,
  articleCount: number,
  articles: import("@/lib/types").NewsArticle[]
): Promise<{ success: boolean; newState: DisruptionState; error?: string }> {
  // Acquire write lock (SET NX with 30s TTL)
  const locked = await kvSet(KV_KEYS.LOCK, "1", { ex: 30, nx: true });
  if (!locked) {
    console.warn(`[disruption-state] Lock held — skipping update for ${chokepointId}`);
    return { success: false, newState: "unknown", error: "Lock held" };
  }

  try {
    const cache = await readCache();
    const current =
      cache.chokepoints[chokepointId] ?? initialChokepointState(chokepointId);

    const prevState = current.state;
    const updated = computeNewState(current, articleCount, articles);

    // Update previousStates for toast diff
    const previousStates = { ...cache.previousStates };
    if (updated.state !== prevState) {
      previousStates[chokepointId] = prevState;
    }

    // BL-008: store brentAtLastClean when transitioning into disrupted
    const brentAtLastClean = { ...(cache.brentAtLastClean ?? {}) };
    const isNewlyDisrupted =
      updated.state === "disrupted" &&
      prevState !== "disrupted" &&
      !brentAtLastClean[chokepointId];
    if (isNewlyDisrupted && cache.prices.brent?.current != null) {
      brentAtLastClean[chokepointId] = {
        price: cache.prices.brent.current,
        date: new Date().toISOString(),
      };
    }
    // Reset when chokepoint returns to clean
    if (updated.state === "clean" && prevState === "disrupted") {
      brentAtLastClean[chokepointId] = null;
    }

    const newCache: DisruptionStateCache = {
      ...cache,
      chokepoints: {
        ...cache.chokepoints,
        [chokepointId]: updated,
      },
      previousStates,
      brentAtLastClean,
      fetchedAt: new Date().toISOString(),
    };

    await kvSet(KV_KEYS.STATE, newCache);

    console.log(
      `[disruption-state] ${chokepointId}: ${prevState} → ${updated.state} (articles: ${articleCount})`
    );

    return { success: true, newState: updated.state };
  } catch (err) {
    console.error(`[disruption-state] KV write error for ${chokepointId}:`, err);
    return { success: false, newState: "unknown", error: String(err) };
  } finally {
    await kvDel(KV_KEYS.LOCK);
  }
}

/**
 * Append a risk timeline entry for a chokepoint (BL-009).
 * One entry per day — overwrites if same day, trims to last 30.
 */
export async function appendRiskTimeline(
  chokepointId: string,
  state: DisruptionState
): Promise<void> {
  const key = `risk-timeline:${chokepointId}`;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    const existing = (await kvGet<RiskTimelineEntry[]>(key)) ?? [];
    const filtered = existing.filter((e) => e.date !== today);
    const updated = [...filtered, { date: today, state }]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
    await kvSet(key, updated);
  } catch (err) {
    console.warn(`[disruption-state] appendRiskTimeline failed for ${chokepointId}:`, err);
  }
}

/**
 * Check if the cache is stale (older than maxAgeMs).
 */
export function isCacheStale(
  cache: DisruptionStateCache,
  maxAgeMs = 15 * 60 * 1000 // 15 minutes
): boolean {
  if (!cache.fetchedAt) return true;
  return Date.now() - new Date(cache.fetchedAt).getTime() > maxAgeMs;
}

import type {
  ChokepointState,
  DisruptionConfidence,
  DisruptionState,
  DisruptionStateCache,
  NewsArticle,
  PortWatchFlowEvidence,
  RiskTimelineEntry,
} from "@/lib/types";
import { kvGet, kvSet, kvDel, KV_KEYS } from "@/lib/kv";
import { emptyCache } from "@/lib/types";

const DISRUPTION_THRESHOLD = parseInt(
  process.env.DISRUPTION_THRESHOLD ?? "10",
  10
);
const STRESSED_THRESHOLD = 3;
const HYSTERESIS_COUNT = 3; // N-of-3 consecutive polls required to change state

const STRONG_OPERATIONAL_PATTERNS = [
  /\b(blocked|closed|closure|shut(?:\s|-)?down|halted|stopped|suspended)\b/i,
  /\b(practically closed|virtually closed|commercially closed|effectively closed|near(?:ly)? shut)\b/i,
  /\b(rerout(?:e|ed|ing)|divert(?:ed|ing|sion)|bypass(?:ed|ing)?|avoid(?:ed|ing)? (?:route|waterway|area|strait|red sea))\b/i,
  /\b(transit restrictions?|restricted transit|capacity cuts?|draft restrictions?|daily transits? (?:cut|reduced)|near-zero (?:traffic|transits?))\b/i,
  /\b(seized|hijacked|grounded|ran aground|collision|struck by|hit by)\b/i,
  /\b(port closed|canal closed|strait closed|waterway closed|shipping lane closed)\b/i,
  /\b(attacks? (?:force|forced|halt|halted|stop|stopped|rerout|rerouted|divert|diverted))\b/i,
  /\b(carriers? (?:suspend|suspended|pause|paused)|service suspensions?|naval blockade|blockade)\b/i,
];

const WEAK_RISK_PATTERNS = [
  /\b(attack|missile|drone|explosion|mine|piracy|pirate|strike|war|conflict|fighting)\b/i,
  /\b(threat(?:en|ens|ened)?|tension|sanction|naval warning|security alert)\b/i,
  /\b(backlog|queue|congestion|delay|disruption|disrupted|restricted|unsafe|warning)\b/i,
];

function articleEvidence(articles: NewsArticle[]): {
  strongOperationalCount: number;
  weakRiskCount: number;
} {
  let strongOperationalCount = 0;
  let weakRiskCount = 0;

  for (const article of articles) {
    const text = `${article.title} ${article.source}`;
    if (STRONG_OPERATIONAL_PATTERNS.some((pattern) => pattern.test(text))) {
      strongOperationalCount += 1;
    }
    if (WEAK_RISK_PATTERNS.some((pattern) => pattern.test(text))) {
      weakRiskCount += 1;
    }
  }

  return { strongOperationalCount, weakRiskCount };
}

function targetStateFromEvidence(
  articleCount: number,
  articles: NewsArticle[],
  observedFlow?: PortWatchFlowEvidence | null
): DisruptionState {
  const { strongOperationalCount, weakRiskCount } = articleEvidence(articles);

  if (observedFlow?.state === "disrupted") return "disrupted";
  if (strongOperationalCount >= 1) return "disrupted";
  if (observedFlow?.state === "stressed") return "stressed";
  if (weakRiskCount >= 1 || articleCount >= STRESSED_THRESHOLD) return "stressed";
  return "clean";
}

function confidenceFromEvidence(
  articleCount: number,
  articles: NewsArticle[],
  observedFlow?: PortWatchFlowEvidence | null
): DisruptionConfidence {
  const { strongOperationalCount, weakRiskCount } = articleEvidence(articles);
  const drivers: string[] = [];

  if (observedFlow) {
    drivers.push(observedFlow.summary);
  }
  if (strongOperationalCount > 0) {
    drivers.push(`${strongOperationalCount} headline(s) with operational disruption language`);
  } else if (weakRiskCount > 0) {
    drivers.push(`${weakRiskCount} headline(s) with risk language`);
  } else if (articleCount > 0) {
    drivers.push(`${articleCount} current headline(s) monitored`);
  }

  if (observedFlow?.state === "disrupted") {
    return { level: "high", drivers };
  }
  if (strongOperationalCount > 0 && observedFlow?.state === "stressed") {
    return { level: "high", drivers };
  }
  if (observedFlow?.state === "stressed" || strongOperationalCount > 0) {
    return { level: "medium", drivers };
  }
  if (weakRiskCount > 0 || articleCount >= STRESSED_THRESHOLD) {
    return { level: "low", drivers };
  }
  if (observedFlow?.state === "clean") {
    return { level: "medium", drivers };
  }
  return { level: "low", drivers };
}

/**
 * Compute new state based on article count + current hysteresis counters.
 * Returns updated ChokepointState (does not write to KV).
 */
export function computeNewState(
  current: ChokepointState,
  articleCount: number,
  articles: NewsArticle[],
  observedFlow?: PortWatchFlowEvidence | null
): ChokepointState {
  const currentState = current.state;
  let { consecutivePollsAboveThreshold, consecutivePollsBelowClean } = current;

  // Determine target state based on operational evidence, not volume alone.
  // A high volume of negative headlines can make a chokepoint stressed; actual
  // disrupted status needs an operational signal such as closure, rerouting,
  // attack-driven avoidance, seizure, or transit restrictions.
  let targetState = targetStateFromEvidence(articleCount, articles, observedFlow);
  const confidence = confidenceFromEvidence(articleCount, articles, observedFlow);

  if (articleCount >= DISRUPTION_THRESHOLD && targetState === "clean") {
    targetState = "stressed";
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
      observedFlow: observedFlow ?? null,
      confidence,
      lastUpdatedAt: new Date().toISOString(),
      consecutivePollsAboveThreshold: targetState !== "clean" ? 1 : 0,
      consecutivePollsBelowClean: targetState === "clean" ? 1 : 0,
    };
  }

  if (targetState === "disrupted") {
    consecutivePollsAboveThreshold += 1;
    consecutivePollsBelowClean = 0;
    newState = "disrupted";
  } else if (targetState === "stressed") {
    consecutivePollsAboveThreshold += 1;
    consecutivePollsBelowClean = 0;
    if (observedFlow?.state === "stressed" || consecutivePollsAboveThreshold >= HYSTERESIS_COUNT) {
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
    observedFlow: observedFlow ?? null,
    confidence,
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
    observedFlow: null,
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
  articles: NewsArticle[],
  observedFlow?: PortWatchFlowEvidence | null
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
    const updated = computeNewState(current, articleCount, articles, observedFlow);

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

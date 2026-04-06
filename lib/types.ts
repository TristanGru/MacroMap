export type ResourceType =
  | "oil"
  | "gas"
  | "lng"
  | "container"
  | "copper"
  | "grain"
  | "coal";

export type DisruptionState = "clean" | "stressed" | "disrupted" | "unknown";

export interface Chokepoint {
  id: string;
  name: string;
  /** [lon, lat] — for globe marker placement only, not GDELT filtering */
  coordinates: [number, number];
  resourceTypes: ResourceType[];
  /** Default 10 if unknown */
  dailyFlowMbpd: number;
  /** 3 = critical (Hormuz, Suez, Malacca) */
  strategicImportance: 1 | 2 | 3;
  /** GDELT keyword query string */
  gdeltQuery: string;
  /** 2-3 sentence "why this matters" context card */
  summary: string;
  /** e.g. "/chokepoints/strait-hormuz.jpg" */
  photoPath: string;
}

export interface ShippingRoute {
  id: string;
  name: string;
  resourceType: ResourceType;
  /** [lon, lat] coordinate pairs along the route */
  waypoints: [number, number][];
  chokepointIds: string[];
  /** Default 10 if unknown */
  flowMbpd: number;
}

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO 8601
  relevanceScore: number;
  thumbnailUrl?: string; // og:image, fetched server-side
}

export interface ChokepointState {
  chokepointId: string;
  state: DisruptionState;
  articleCount: number;
  /** Top 5, most recent first */
  articles: NewsArticle[];
  lastUpdatedAt: string; // ISO 8601
  consecutivePollsAboveThreshold: number;
  consecutivePollsBelowClean: number;
}

export interface PricePoint {
  date: string; // ISO 8601 date "YYYY-MM-DD"
  price: number;
}

export interface PriceData {
  current: number;
  delta24h: number;
  history30d: PricePoint[];
  fetchedAt: string; // ISO 8601 — for 24h TTL check
}

export interface DisruptionStateCache {
  chokepoints: Record<string, ChokepointState>;
  prices: {
    brent: PriceData | null;
    wti: PriceData | null;
  };
  fetchedAt: string; // ISO 8601
  /** Previous states for toast diff on next page load */
  previousStates: Record<string, DisruptionState>;
}

/** Empty cache returned on KV error */
export function emptyCache(): DisruptionStateCache {
  return {
    chokepoints: {},
    prices: { brent: null, wti: null },
    fetchedAt: new Date().toISOString(),
    previousStates: {},
  };
}

/** Get state color CSS variable name */
export function stateColorVar(state: DisruptionState): string {
  return `var(--color-${state})`;
}

/** Get resource type color CSS variable name */
export function resourceColorVar(type: ResourceType): string {
  return `var(--color-${type})`;
}

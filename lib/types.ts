export type ResourceType =
  | "oil"
  | "gas"
  | "lng"
  | "container"
  | "copper"
  | "grain"
  | "coal"
  | "lithium"
  | "cobalt"
  | "rare-earth"
  | "strategic-metals"
  | "iron-ore"
  | "uranium"
  | "fertilizer";

export type DisruptionState = "clean" | "stressed" | "disrupted" | "unknown";
export type TransportMode = "sea" | "pipeline" | "rail" | "road" | "multimodal";
export type RouteStatus = "primary" | "diversion" | "planned" | "historical";
export type RouteAccuracy = "observed" | "approximate";
export type RouteFocusKind = "port" | "chokepoint";

export interface RouteFocusTarget {
  kind: RouteFocusKind;
  id: string;
  name: string;
}

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
  /** Plain-English consumer impact if this chokepoint is disrupted */
  consumerImpact: string;
}

// ── Historical Disruptions ────────────────────────────────────────────────────

export interface HistoricalDisruption {
  id: string;
  chokepointId: string;
  chokepointName: string;
  title: string;
  dateStart: string; // YYYY-MM-DD
  dateEnd?: string;  // YYYY-MM-DD, if resolved
  description: string;
  oilImpact?: string; // e.g. "Brent +18% in 3 weeks"
  resourceTypes: ResourceType[];
}

export interface Port {
  id: string;
  name: string;
  /** [lon, lat] */
  coordinates: [number, number];
  portType: "origin" | "destination" | "hub";
  resourceTypes: ResourceType[];
  description: string;
}

export interface ShippingRoute {
  id: string;
  name: string;
  resourceType: ResourceType;
  /** Defaults to "primary" */
  routeStatus?: RouteStatus;
  /** Defaults to "approximate". Use "observed" only for sourced corridors or observed disruption reroutes. */
  routeAccuracy?: RouteAccuracy;
  /** Defaults to "sea" for non-gas routes and "pipeline" for gas routes */
  transportMode?: TransportMode;
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
  /** Brent price at last clean state, per chokepoint — for causality annotation */
  brentAtLastClean: Record<string, { price: number; date: string } | null>;
}

/** Empty cache returned on KV error */
export function emptyCache(): DisruptionStateCache {
  return {
    chokepoints: {},
    prices: { brent: null, wti: null },
    fetchedAt: new Date().toISOString(),
    previousStates: {},
    brentAtLastClean: {},
  };
}

// ── v2: Conflict Events (ACLED) ──────────────────────────────────────────────

export interface ConflictEvent {
  id: string;
  lat: number;
  lng: number;
  type: string;
  date: string; // ISO 8601
  description: string; // truncated to 200 chars
  country: string;
  fatalities: number;
  nearestChokepointId: string | null;
  distanceKm: number | null;
}

export interface ConflictEventsCache {
  events: ConflictEvent[];
  fetchedAt: string; // ISO 8601
}

// ── v2: Extended Prices ───────────────────────────────────────────────────────

export interface BDIData {
  current: number;
  delta24h: number;
  fetchedAt: string; // ISO 8601
}

export interface CommodityPrices {
  brent: PriceData | null;
  wti: PriceData | null;
  natGas: PriceData | null;
  wheat: PriceData | null;
  copper: PriceData | null;
  bdi: BDIData | null;
}

// ── v2: Risk Timeline ─────────────────────────────────────────────────────────

export interface RiskTimelineEntry {
  date: string; // YYYY-MM-DD
  state: DisruptionState;
}

// ── v3: Disaster Events ───────────────────────────────────────────────────────

export type DisasterType = "earthquake" | "storm" | "wildfire" | "flood" | "volcano" | "drought";
export type DisasterSeverity = "watch" | "warning" | "alert";

export interface DisasterEvent {
  id: string;
  type: DisasterType;
  severity: DisasterSeverity;
  lat: number;
  lng: number;
  title: string;
  description: string;
  date: string; // ISO 8601
  magnitude?: number; // earthquakes only
  nearestChokepointId: string | null;
  distanceKm: number | null;
  source: "usgs" | "gdacs" | "firms";
}

export interface DisasterEventsCache {
  events: DisasterEvent[];
  fetchedAt: string; // ISO 8601
}

// ── v3: Macro Signals (FRED) ──────────────────────────────────────────────────

export interface MacroSignal {
  id: string;         // FRED series ID e.g. "CPIAUCSL"
  label: string;      // display name e.g. "US CPI"
  value: number;
  delta: number;      // % change from previous period
  unit: string;       // "%", "$/t", "idx"
  direction: "up" | "down" | "flat";
  date: string;       // YYYY-MM-DD of most recent observation
  isAlert: boolean;   // true if |delta| >= alert threshold
  category?: "macro" | "agriculture" | "energy"; // for grouping in UI
}

/** Get state color CSS variable name */
export function stateColorVar(state: DisruptionState): string {
  return `var(--color-${state})`;
}

/** Get resource type color CSS variable name */
export function resourceColorVar(type: ResourceType): string {
  return `var(--color-${type})`;
}

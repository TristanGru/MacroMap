import type { DisasterEvent, DisasterSeverity } from "@/lib/types";
import { nearestChokepoint } from "@/lib/acled";

const CLUSTER_CELL_DEGREES = 4;
const MAX_WILDFIRE_EVENTS = 12;
const MAX_US_WILDFIRE_EVENTS = 4;
const MAJOR_FIRE_MIN_MAX_FRP = 300;
const MAJOR_FIRE_MIN_TOTAL_FRP = 2000;
const MAJOR_FIRE_MIN_DETECTIONS = 80;
const MAJOR_FIRE_MIN_HIGH_CONFIDENCE_DETECTIONS = 25;
const US_FIRE_MIN_MAX_FRP = 125;
const US_FIRE_MIN_TOTAL_FRP = 500;
const US_FIRE_MIN_DETECTIONS = 24;
const US_FIRE_MIN_HIGH_CONFIDENCE_DETECTIONS = 8;

interface FIRMSPoint {
  latitude: string;
  longitude: string;
  acq_date: string;
  confidence: string; // "l" | "n" | "h"
  frp: string;        // Fire Radiative Power (MW)
}

interface FireMetrics {
  maxFrp: number;
  totalFrp: number;
  highConfidenceCount: number;
  score: number;
}

function regionFor(lat: number, lng: number): string {
  if (lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66) return "United States";
  if (lat >= 15 && lng >= -170 && lng <= -50) return "North America";
  if (lat < 15 && lat >= -60 && lng >= -90 && lng <= -30) return "South America";
  if (lat >= 35 && lng >= -15 && lng <= 45) return "Europe / Mediterranean";
  if (lat >= 5 && lat < 35 && lng >= -20 && lng <= 55) return "North Africa / Middle East";
  if (lat < 5 && lat >= -35 && lng >= -20 && lng <= 55) return "Sub-Saharan Africa";
  if (lat >= 35 && lng > 45 && lng <= 180) return "Northern Asia";
  if (lat >= -10 && lat < 35 && lng > 55 && lng <= 150) return "South / Southeast Asia";
  if (lat < -10 && lng >= 110 && lng <= 180) return "Australia / Oceania";
  return "Global";
}

function fireMetrics(pts: FIRMSPoint[]): FireMetrics {
  const frps = pts.map((p) => parseFloat(p.frp) || 0);
  const maxFrp = Math.max(...frps);
  const totalFrp = frps.reduce((sum, frp) => sum + frp, 0);
  const highConfidenceCount = pts.filter((p) => p.confidence === "h").length;

  return {
    maxFrp,
    totalFrp,
    highConfidenceCount,
    score: maxFrp * 4 + totalFrp + pts.length * 20 + highConfidenceCount * 80,
  };
}

function isMaterialFireCluster(pts: FIRMSPoint[], region: string, metrics: FireMetrics): boolean {
  if (region === "United States" || region === "North America") {
    return (
      metrics.maxFrp >= US_FIRE_MIN_MAX_FRP ||
      (metrics.totalFrp >= US_FIRE_MIN_TOTAL_FRP && pts.length >= 20) ||
      (pts.length >= US_FIRE_MIN_DETECTIONS && metrics.highConfidenceCount >= US_FIRE_MIN_HIGH_CONFIDENCE_DETECTIONS)
    );
  }

  return (
    metrics.maxFrp >= MAJOR_FIRE_MIN_MAX_FRP ||
    (metrics.totalFrp >= MAJOR_FIRE_MIN_TOTAL_FRP && pts.length >= 25) ||
    (pts.length >= MAJOR_FIRE_MIN_DETECTIONS && metrics.highConfidenceCount >= MAJOR_FIRE_MIN_HIGH_CONFIDENCE_DETECTIONS)
  );
}

function severityForCluster(pts: FIRMSPoint[], metrics: FireMetrics): DisasterSeverity {
  if (metrics.maxFrp >= 750 || (metrics.totalFrp >= 4000 && pts.length >= 40)) return "alert";
  return "warning";
}

function isUnitedStatesEvent(event: DisasterEvent): boolean {
  return event.lat >= 24 && event.lat <= 50 && event.lng >= -125 && event.lng <= -66;
}

function selectWildfireEvents(events: Array<DisasterEvent & { fireScore: number }>): DisasterEvent[] {
  const sorted = [...events].sort((a, b) => b.fireScore - a.fireScore);
  const selected = [
    ...sorted
      .filter((event) => isUnitedStatesEvent(event))
      .slice(0, MAX_US_WILDFIRE_EVENTS),
  ];
  const selectedIds = new Set(selected.map((event) => event.id));

  for (const event of sorted) {
    if (selected.length >= MAX_WILDFIRE_EVENTS) break;
    if (selectedIds.has(event.id)) continue;
    selected.push(event);
    selectedIds.add(event.id);
  }

  return selected
    .sort((a, b) => b.fireScore - a.fireScore)
    .map((event) => {
      const { fireScore, ...disasterEvent } = event;
      void fireScore;
      return disasterEvent;
    });
}

/**
 * Query FIRMS for one hemisphere.
 * FIRMS rejects bounding boxes where both W and E are negative, so the caller
 * queries the western and eastern hemispheres separately.
 */
async function fetchHemisphere(
  west: number,
  east: number,
  mapKey: string,
): Promise<FIRMSPoint[]> {
  const area = `${west},-70,${east},80`;
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/${area}/2`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    // CSV header: latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,
    // satellite,instrument,confidence,version,bright_ti5,frp,daynight
    return lines.slice(1).map((line) => {
      const cols = line.split(",");
      return {
        latitude: cols[0] ?? "",
        longitude: cols[1] ?? "",
        acq_date: cols[5] ?? "",
        confidence: cols[9] ?? "n",
        frp: cols[12] ?? "0",
      };
    });
  } catch {
    return [];
  }
}

/**
 * Fetches major active wildfire clusters from NASA FIRMS (VIIRS SNPP NRT, last 2 days).
 * The app accepts all regions in the FIRMS world query, clusters detections into
 * 4-degree cells, then returns only the highest-impact material clusters.
 */
export async function fetchWildfires(): Promise<DisasterEvent[]> {
  const mapKey = process.env.FIRMS_MAP_KEY;
  if (!mapKey) {
    console.warn("[firms] FIRMS_MAP_KEY not set - skipping wildfire fetch");
    return [];
  }

  const [west, east] = await Promise.all([
    fetchHemisphere(-180, 0, mapKey),
    fetchHemisphere(0, 180, mapKey),
  ]);
  const all = [...west, ...east];

  const validPoints = all.filter((p) => {
    if (p.confidence === "l") return false;
    const lat = parseFloat(p.latitude);
    const lng = parseFloat(p.longitude);
    return !isNaN(lat) && !isNaN(lng);
  });

  if (validPoints.length === 0) return [];

  const clusters = new Map<string, { pts: FIRMSPoint[]; region: string }>();
  for (const p of validPoints) {
    const lat = parseFloat(p.latitude);
    const lng = parseFloat(p.longitude);
    const cell = `${Math.round(lat / CLUSTER_CELL_DEGREES) * CLUSTER_CELL_DEGREES},${Math.round(lng / CLUSTER_CELL_DEGREES) * CLUSTER_CELL_DEGREES}`;
    if (!clusters.has(cell)) clusters.set(cell, { pts: [], region: regionFor(lat, lng) });
    clusters.get(cell)!.pts.push(p);
  }

  const events: Array<DisasterEvent & { fireScore: number }> = [];
  for (const [cell, { pts, region }] of clusters) {
    const metrics = fireMetrics(pts);
    if (!isMaterialFireCluster(pts, region, metrics)) continue;

    const avgLat = pts.reduce((s, p) => s + parseFloat(p.latitude), 0) / pts.length;
    const avgLng = pts.reduce((s, p) => s + parseFloat(p.longitude), 0) / pts.length;
    const nearest = nearestChokepoint(avgLat, avgLng);

    events.push({
      id: `firms-${cell}-${pts[0].acq_date}`,
      type: "wildfire",
      severity: severityForCluster(pts, metrics),
      lat: avgLat,
      lng: avgLng,
      title: `Wildfire cluster - ${region}`,
      description: `${pts.length} active detections - max FRP ${metrics.maxFrp.toFixed(0)} MW - total FRP ${metrics.totalFrp.toFixed(0)} MW`,
      date: new Date(pts[0].acq_date).toISOString(),
      nearestChokepointId: nearest?.id ?? null,
      distanceKm: nearest?.distanceKm ?? null,
      source: "firms" as const,
      fireScore: metrics.score,
    });
  }

  return selectWildfireEvents(events);
}

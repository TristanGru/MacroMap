import type { DisasterEvent, DisasterSeverity } from "@/lib/types";
import { nearestChokepoint } from "@/lib/acled";

// Agricultural + pipeline regions to monitor for wildfires (client-side filter)
const REGIONS = [
  { name: "US Great Plains",      latMin: 30, latMax: 50, lngMin: -105, lngMax: -85 },
  { name: "Ukraine / Black Sea",  latMin: 44, latMax: 52, lngMin:   22, lngMax:  42 },
  { name: "Australia Wheat Belt", latMin: -40, latMax: -20, lngMin: 110, lngMax: 155 },
  { name: "Argentina Pampas",     latMin: -40, latMax: -25, lngMin: -70, lngMax: -55 },
  { name: "Brazil Cerrado",       latMin: -25, latMax:  -5, lngMin: -60, lngMax: -40 },
  { name: "Siberia / W. Russia",  latMin:  50, latMax:  70, lngMin:  50, lngMax:  90 },
];

function regionFor(lat: number, lng: number): string | null {
  for (const r of REGIONS) {
    if (lat >= r.latMin && lat <= r.latMax && lng >= r.lngMin && lng <= r.lngMax) {
      return r.name;
    }
  }
  return null;
}

interface FIRMSPoint {
  latitude: string;
  longitude: string;
  acq_date: string;
  confidence: string; // "l" | "n" | "h"
  frp: string;        // Fire Radiative Power (MW)
}

/**
 * Query FIRMS for one hemisphere.
 * FIRMS rejects bounding boxes where both W and E are negative —
 * work around this by querying in two halves (W hemi: -180→0, E hemi: 0→180).
 */
async function fetchHemisphere(
  west: number,
  east: number,
  mapKey: string,
): Promise<FIRMSPoint[]> {
  // Use CSV endpoint — more reliable; parse manually
  const area = `${west},-70,${east},80`;
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/${area}/2`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return []; // header only = no fires

    // CSV header: latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,
    //             satellite,instrument,confidence,version,bright_ti5,frp,daynight
    return lines.slice(1).map((line) => {
      const cols = line.split(",");
      return {
        latitude:   cols[0] ?? "",
        longitude:  cols[1] ?? "",
        acq_date:   cols[5] ?? "",
        confidence: cols[9] ?? "n",
        frp:        cols[12] ?? "0",
      };
    });
  } catch {
    return [];
  }
}

/**
 * Fetches active wildfire clusters from NASA FIRMS (VIIRS SNPP NRT, last 2 days).
 * Queries in two hemisphere halves to avoid the FIRMS API bug with all-negative
 * longitude bounding boxes. Clusters into 1-degree grid cells.
 * Requires free FIRMS_MAP_KEY from https://firms.modaps.eosdis.nasa.gov/api/map_key/
 * Returns [] if FIRMS_MAP_KEY not set.
 */
export async function fetchWildfires(): Promise<DisasterEvent[]> {
  const mapKey = process.env.FIRMS_MAP_KEY;
  if (!mapKey) {
    console.warn("[firms] FIRMS_MAP_KEY not set — skipping wildfire fetch");
    return [];
  }

  // Two hemisphere queries run in parallel
  const [west, east] = await Promise.all([
    fetchHemisphere(-180, 0, mapKey),
    fetchHemisphere(0, 180, mapKey),
  ]);
  const all = [...west, ...east];

  // Filter to monitored regions; skip low confidence
  const inRegion = all.filter((p) => {
    if (p.confidence === "l") return false;
    const lat = parseFloat(p.latitude);
    const lng = parseFloat(p.longitude);
    if (isNaN(lat) || isNaN(lng)) return false;
    return regionFor(lat, lng) !== null;
  });

  if (inRegion.length === 0) return [];

  // Cluster into 2-degree grid cells to keep marker count manageable
  const clusters = new Map<string, { pts: FIRMSPoint[]; region: string }>();
  for (const p of inRegion) {
    const lat = parseFloat(p.latitude);
    const lng = parseFloat(p.longitude);
    const region = regionFor(lat, lng)!;
    const cell = `${Math.round(lat / 2) * 2},${Math.round(lng / 2) * 2}`;
    if (!clusters.has(cell)) clusters.set(cell, { pts: [], region });
    clusters.get(cell)!.pts.push(p);
  }

  const events: DisasterEvent[] = [];
  for (const [cell, { pts, region }] of clusters) {
    const avgLat = pts.reduce((s, p) => s + parseFloat(p.latitude), 0) / pts.length;
    const avgLng = pts.reduce((s, p) => s + parseFloat(p.longitude), 0) / pts.length;
    const maxFrp = Math.max(...pts.map((p) => parseFloat(p.frp) || 0));
    const nearest = nearestChokepoint(avgLat, avgLng);
    const severity: DisasterSeverity =
      maxFrp > 500 ? "alert" : maxFrp > 100 ? "warning" : "watch";

    // Only surface warning+ clusters to avoid globe clutter
    if (severity === "watch" && pts.length < 5) continue;

    events.push({
      id: `firms-${cell}-${pts[0].acq_date}`,
      type: "wildfire",
      severity,
      lat: avgLat,
      lng: avgLng,
      title: `Wildfire cluster — ${region}`,
      description: `${pts.length} active detections · max FRP ${maxFrp.toFixed(0)} MW`,
      date: new Date(pts[0].acq_date).toISOString(),
      nearestChokepointId: nearest?.id ?? null,
      distanceKm: nearest?.distanceKm ?? null,
      source: "firms" as const,
    });
  }

  return events;
}

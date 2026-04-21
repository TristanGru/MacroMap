import type { DisasterEvent, DisasterSeverity } from "@/lib/types";
import { nearestChokepoint } from "@/lib/acled";

interface USGSFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number; // ms since epoch
    title: string;
  };
  geometry: {
    coordinates: [number, number, number]; // [lng, lat, depth]
  };
}

interface USGSResponse {
  features: USGSFeature[];
}

/**
 * Fetches M4.5+ earthquakes from the past 7 days via USGS GeoJSON feed.
 * No API key required.
 */
export async function fetchEarthquakes(): Promise<DisasterEvent[]> {
  try {
    const res = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson",
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as USGSResponse;

    // Filter to M5.0+ to reduce clutter (4.5_week is the only available feed)
    return data.features
      .filter((f) => (f.properties.mag ?? 0) >= 5.0)
      .map((f) => {
        const [lng, lat] = f.geometry.coordinates;
        const mag = f.properties.mag ?? 0;
        const severity: DisasterSeverity =
          mag >= 7 ? "alert" : mag >= 6 ? "warning" : "watch";
        const nearest = nearestChokepoint(lat, lng);

        return {
          id: `usgs-${f.id}`,
          type: "earthquake" as const,
          severity,
          lat,
          lng,
          title: f.properties.title,
          description: `M${mag.toFixed(1)} — ${f.properties.place}`,
          date: new Date(f.properties.time).toISOString(),
          magnitude: mag,
          nearestChokepointId: nearest?.id ?? null,
          distanceKm: nearest?.distanceKm ?? null,
          source: "usgs" as const,
        };
      });
  } catch (err) {
    console.warn("[usgs] Fetch error:", err);
    return [];
  }
}

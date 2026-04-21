import type { DisasterEvent, DisasterType, DisasterSeverity } from "@/lib/types";
import { nearestChokepoint } from "@/lib/acled";

interface GDACSFeature {
  properties: {
    eventid: number;
    eventtype: string;   // EQ, TC, FL, VO, DR, WF
    alertlevel: string;  // Green, Orange, Red
    name: string;
    description: string;
    fromdate: string;    // ISO date string
    latitude: number;
    longitude: number;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface GDACSResponse {
  features?: GDACSFeature[];
}

const TYPE_MAP: Record<string, DisasterType> = {
  EQ: "earthquake",
  TC: "storm",
  FL: "flood",
  VO: "volcano",
  DR: "drought",
  WF: "wildfire",
};

const SEVERITY_MAP: Record<string, DisasterSeverity> = {
  Green: "watch",
  Orange: "warning",
  Red: "alert",
};

/**
 * Fetches Orange + Red disaster alerts from GDACS (UN disaster coordination system).
 * Covers: cyclones, floods, earthquakes, volcanoes, droughts, wildfires.
 * No API key required.
 */
export async function fetchGDACSEvents(): Promise<DisasterEvent[]> {
  try {
    const params = new URLSearchParams({
      alertlevel: "Orange,Red",
      eventlist: "EQ,TC,FL,VO,DR,WF",
      pagesize: "50",
    });

    const res = await fetch(
      `https://www.gdacs.org/gdacsapi/api/events/geteventlist/EVENTS?${params}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as GDACSResponse;
    if (!data.features) return [];

    return data.features.map((f) => {
      const props = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      const nearest = nearestChokepoint(lat, lng);
      const type: DisasterType = TYPE_MAP[props.eventtype] ?? "flood";
      const severity: DisasterSeverity = SEVERITY_MAP[props.alertlevel] ?? "watch";

      return {
        id: `gdacs-${props.eventid}`,
        type,
        severity,
        lat,
        lng,
        title: props.name,
        description: (props.description ?? "").slice(0, 200),
        date: props.fromdate,
        nearestChokepointId: nearest?.id ?? null,
        distanceKm: nearest?.distanceKm ?? null,
        source: "gdacs" as const,
      };
    });
  } catch (err) {
    console.warn("[gdacs] Fetch error:", err);
    return [];
  }
}

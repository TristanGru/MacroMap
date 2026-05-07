import type { DisasterEvent } from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";

interface OpenMeteoForecastCurrent {
  time: string;
  wind_speed_10m?: number;
  wind_gusts_10m?: number;
}

interface OpenMeteMarineCurrent {
  time: string;
  wave_height?: number;
}

interface OpenMeteoForecastResponse {
  current?: OpenMeteoForecastCurrent;
}

interface OpenMeteoMarineResponse {
  current?: OpenMeteMarineCurrent;
}

async function fetchWind(lat: number, lng: number): Promise<{ knots: number; gustKnots: number; time: string } | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
      current: "wind_speed_10m,wind_gusts_10m",
      wind_speed_unit: "kn",
      timezone: "UTC",
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json() as OpenMeteoForecastResponse;
    const c = json.current;
    if (!c) return null;
    return { knots: c.wind_speed_10m ?? 0, gustKnots: c.wind_gusts_10m ?? 0, time: c.time };
  } catch {
    return null;
  }
}

async function fetchWave(lat: number, lng: number): Promise<{ meters: number; time: string } | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
      current: "wave_height",
      timezone: "UTC",
    });
    const res = await fetch(`https://marine-api.open-meteo.com/v1/marine?${params}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json() as OpenMeteoMarineResponse;
    const c = json.current;
    if (!c || c.wave_height === undefined) return null;
    return { meters: c.wave_height, time: c.time };
  } catch {
    return null;
  }
}

function windSeverity(knots: number): DisasterEvent["severity"] | null {
  if (knots >= 64) return "alert";    // hurricane force (Beaufort 12)
  if (knots >= 48) return "warning";  // storm force (Beaufort 10-11)
  if (knots >= 34) return "watch";    // gale force (Beaufort 8-9)
  return null;
}

function waveSeverity(meters: number): DisasterEvent["severity"] | null {
  if (meters >= 9) return "alert";
  if (meters >= 6) return "warning";
  if (meters >= 4) return "watch";
  return null;
}

/**
 * Fetches current wind speed and wave height at all chokepoint coordinates
 * from Open-Meteo (free, no key, global coverage).
 * Returns DisasterEvent[] only for chokepoints with gale-force or worse conditions.
 */
export async function fetchChokepointWeather(): Promise<DisasterEvent[]> {
  const results = await Promise.allSettled(
    CHOKEPOINTS.map(async (cp) => {
      const [lng, lat] = cp.coordinates;
      const [wind, wave] = await Promise.all([
        fetchWind(lat, lng),
        fetchWave(lat, lng),
      ]);
      return { cp, wind, wave };
    })
  );

  const events: DisasterEvent[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { cp, wind, wave } = result.value;

    const windSev = wind ? windSeverity(wind.knots) : null;
    const waveSev = wave ? waveSeverity(wave.meters) : null;

    // Use the worse of the two severities
    const severityRank = { alert: 3, warning: 2, watch: 1 };
    const windRank = windSev ? severityRank[windSev] : 0;
    const waveRank = waveSev ? severityRank[waveSev] : 0;

    if (windRank === 0 && waveRank === 0) continue;

    const severity: DisasterEvent["severity"] =
      windRank >= waveRank ? windSev! : waveSev!;

    const windDesc = wind ? `${Math.round(wind.knots)} kt winds (gusts ${Math.round(wind.gustKnots)} kt)` : null;
    const waveDesc = wave ? `${wave.meters.toFixed(1)} m waves` : null;
    const conditionParts = [windDesc, waveDesc].filter(Boolean).join(", ");

    const severityLabel = severity === "alert" ? "Hurricane-force" : severity === "warning" ? "Storm-force" : "Gale-force";

    events.push({
      id: `weather-${cp.id}-${wind?.time ?? wave?.time ?? Date.now()}`,
      type: "storm",
      severity,
      lat: cp.coordinates[1],
      lng: cp.coordinates[0],
      title: `${severityLabel} conditions at ${cp.name}`,
      description: `${conditionParts}. Severe weather may affect transit times and vessel safety at this chokepoint.`,
      date: new Date().toISOString(),
      nearestChokepointId: cp.id,
      distanceKm: 0,
      source: "openmeteo",
    });
  }

  return events;
}

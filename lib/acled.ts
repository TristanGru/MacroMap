import type { ConflictEvent } from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";

const EARTH_RADIUS_KM = 6371;

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function nearestChokepoint(
  lat: number,
  lng: number
): { id: string; distanceKm: number } | null {
  let best: { id: string; distanceKm: number } | null = null;
  for (const cp of CHOKEPOINTS) {
    const cpLat = cp.coordinates[1];
    const cpLng = cp.coordinates[0];
    const dist = haversineKm(lat, lng, cpLat, cpLng);
    if (dist <= 500 && (!best || dist < best.distanceKm)) {
      best = { id: cp.id, distanceKm: dist };
    }
  }
  return best;
}

interface AcledRow {
  event_id_cnty: string;
  event_date: string;
  event_type: string;
  sub_event_type: string;
  country: string;
  latitude: string;
  longitude: string;
  notes: string;
  fatalities: string;
}

interface AcledResponse {
  status: number;
  success: boolean;
  count: number;
  data: AcledRow[];
  message?: string;
}

interface AcledTokenResponse {
  access_token?: string;
  token_type?: string;
}

async function getAcledAccessToken(email: string, password: string): Promise<string | null> {
  try {
    const res = await fetch("https://acleddata.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: email,
        password,
        grant_type: "password",
        client_id: "acled",
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.warn(`[acled] OAuth failed: ${res.status}`);
      return null;
    }
    const json = (await res.json()) as AcledTokenResponse;
    return json.access_token ?? null;
  } catch (err) {
    console.warn("[acled] OAuth error:", err);
    return null;
  }
}

export async function fetchAcledEvents(): Promise<ConflictEvent[]> {
  const email = process.env.ACLED_EMAIL;
  const password = process.env.ACLED_PASSWORD;
  if (!email || !password) {
    console.warn("[acled] ACLED_EMAIL or ACLED_PASSWORD not set - skipping fetch");
    return [];
  }

  const accessToken = await getAcledAccessToken(email, password);
  if (!accessToken) {
    console.warn("[acled] Could not obtain access token - skipping fetch");
    return [];
  }

  const seen = new Set<string>();
  const events: ConflictEvent[] = [];

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const dateFrom = since.toISOString().slice(0, 10);

  for (const cp of CHOKEPOINTS) {
    const cpLat = cp.coordinates[1];
    const cpLng = cp.coordinates[0];

    const params = new URLSearchParams({
      _format: "json",
      latitude: String(cpLat),
      longitude: String(cpLng),
      radius: "500",
      limit: "50",
      event_date: dateFrom,
      event_date_where: ">=",
      fields:
        "event_id_cnty|event_date|event_type|sub_event_type|country|latitude|longitude|notes|fatalities",
    });

    let resp: AcledResponse;
    try {
      const res = await fetch(`https://acleddata.com/api/acled/read?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "MacroMap/2.0 (geopolitical risk monitoring)",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.warn(`[acled] Non-200 for CP ${cp.id}: ${res.status}`, body?.message ?? "");
        continue;
      }
      resp = (await res.json()) as AcledResponse;
    } catch (err) {
      console.warn(`[acled] Fetch error for CP ${cp.id}:`, err);
      continue;
    }

    for (const row of resp.data ?? []) {
      if (seen.has(row.event_id_cnty)) continue;
      seen.add(row.event_id_cnty);

      const lat = parseFloat(row.latitude);
      const lng = parseFloat(row.longitude);
      if (isNaN(lat) || isNaN(lng)) continue;

      const nearest = nearestChokepoint(lat, lng);

      events.push({
        id: row.event_id_cnty,
        lat,
        lng,
        type: row.event_type,
        date: row.event_date,
        description: (row.notes ?? "").slice(0, 200),
        country: row.country,
        fatalities: parseInt(row.fatalities, 10) || 0,
        nearestChokepointId: nearest?.id ?? null,
        distanceKm: nearest?.distanceKm ?? null,
      });
    }
  }

  events.sort((a, b) => b.date.localeCompare(a.date));
  return events;
}

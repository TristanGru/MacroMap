import type { ConflictEvent } from "@/lib/types";
import { CHOKEPOINTS } from "@/data/chokepoints";

// ── Haversine distance ────────────────────────────────────────────────────────

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

/** Returns the nearest chokepoint within 500km, or null if none. */
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

// ── ACLED API response types ──────────────────────────────────────────────────

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
}

// ── ACLED cookie-based auth ───────────────────────────────────────────────────

interface AcledLoginResponse {
  csrf_token: string;
  current_user: { uid: string; name: string };
}

/**
 * Logs in to ACLED with email/password, returns session cookie string.
 * ACLED uses Drupal cookie auth: POST /user/login?_format=json → Set-Cookie header.
 */
async function getAcledSessionCookie(email: string, password: string): Promise<string | null> {
  try {
    const res = await fetch("https://acleddata.com/user/login?_format=json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: email, pass: password }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.warn(`[acled] Login failed: ${res.status}`);
      return null;
    }
    await res.json() as AcledLoginResponse;
    // Extract session cookie from Set-Cookie header
    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) return null;
    // Pull the SESS... or similar cookie value
    const cookiePart = setCookie.split(";")[0];
    return cookiePart ?? null;
  } catch (err) {
    console.warn("[acled] Login error:", err);
    return null;
  }
}

// ── Fetch ACLED events near all 10 chokepoints ────────────────────────────────

/**
 * Fetches ACLED conflict events within 500km of any chokepoint.
 * Returns [] if ACLED_EMAIL or ACLED_PASSWORD is not set.
 * Deduplicates by event_id_cnty.
 */
export async function fetchAcledEvents(): Promise<ConflictEvent[]> {
  const email = process.env.ACLED_EMAIL;
  const password = process.env.ACLED_PASSWORD;
  if (!email || !password) {
    console.warn("[acled] ACLED_EMAIL or ACLED_PASSWORD not set — skipping fetch");
    return [];
  }

  const sessionCookie = await getAcledSessionCookie(email, password);
  if (!sessionCookie) {
    console.warn("[acled] Could not obtain session cookie — skipping fetch");
    return [];
  }

  const seen = new Set<string>();
  const events: ConflictEvent[] = [];

  // 30 days ago
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const dateFrom = since.toISOString().slice(0, 10);

  for (const cp of CHOKEPOINTS) {
    const cpLat = cp.coordinates[1];
    const cpLng = cp.coordinates[0];

    const params = new URLSearchParams({
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
          "Accept": "application/json",
          "Cookie": sessionCookie,
          "User-Agent": "MacroMap/2.0 (geopolitical risk monitoring)",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        console.warn(`[acled] Non-200 for CP ${cp.id}: ${res.status}`);
        continue;
      }
      resp = await res.json() as AcledResponse;
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

  // Sort newest first
  events.sort((a, b) => b.date.localeCompare(a.date));
  return events;
}

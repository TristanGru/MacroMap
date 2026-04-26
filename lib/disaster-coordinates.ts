import type { DisasterEvent } from "@/lib/types";

function inLatRange(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function inLngRange(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

/**
 * Normalize disaster coordinates before rendering.
 * Sources should provide lat/lng already, but this catches malformed rows and
 * cached legacy entries where the values were accidentally swapped.
 */
export function normalizeDisasterCoordinates<T extends Pick<DisasterEvent, "lat" | "lng">>(
  event: T
): T | null {
  const lat = Number(event.lat);
  const lng = Number(event.lng);
  if (inLatRange(lat) && inLngRange(lng)) {
    return { ...event, lat, lng };
  }
  if (inLatRange(lng) && inLngRange(lat)) {
    return { ...event, lat: lng, lng: lat };
  }
  return null;
}

export function normalizeDisasterEvents(events: DisasterEvent[]): DisasterEvent[] {
  const normalized: DisasterEvent[] = [];
  for (const event of events) {
    const next = normalizeDisasterCoordinates(event);
    if (next) normalized.push(next);
  }
  return normalized;
}

import type { DisasterEvent } from "@/lib/types";

export const US_AGRI_REGIONS = [
  { name: "Great Plains", latMin: 30, latMax: 49, lngMin: -105, lngMax: -90 },
  { name: "Midwest Corn Belt", latMin: 36, latMax: 47, lngMin: -97, lngMax: -80 },
  { name: "California Central Valley", latMin: 35, latMax: 40, lngMin: -123, lngMax: -118 },
  { name: "Pacific Northwest", latMin: 44, latMax: 49, lngMin: -124, lngMax: -116 },
];

export function usAgriRegionFor(lat: number, lng: number): string | null {
  for (const region of US_AGRI_REGIONS) {
    if (
      lat >= region.latMin &&
      lat <= region.latMax &&
      lng >= region.lngMin &&
      lng <= region.lngMax
    ) {
      return region.name;
    }
  }
  return null;
}

export function isMacroRelevantWildfire(event: DisasterEvent): boolean {
  return event.type === "wildfire" && usAgriRegionFor(event.lat, event.lng) !== null;
}

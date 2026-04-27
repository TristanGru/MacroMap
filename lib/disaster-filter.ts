import type { DisasterEvent } from "@/lib/types";

const MAX_WILDFIRE_EVENTS = 12;
const MAX_US_WILDFIRE_EVENTS = 4;
const MIN_US_WILDFIRE_SCORE = 1200;

function parseNumber(pattern: RegExp, text: string): number {
  const match = text.match(pattern);
  return match ? Number(match[1]) || 0 : 0;
}

function wildfireScore(event: DisasterEvent): number {
  const detections = parseNumber(/(\d+)\s+active detections/i, event.description);
  const maxFrp = parseNumber(/max FRP\s+(\d+(?:\.\d+)?)/i, event.description);
  const totalFrp = parseNumber(/total FRP\s+(\d+(?:\.\d+)?)/i, event.description);
  const severityBoost = event.severity === "alert" ? 2000 : event.severity === "warning" ? 500 : 0;
  return severityBoost + maxFrp * 4 + totalFrp + detections * 20;
}

function isUnitedStatesEvent(event: DisasterEvent): boolean {
  return event.lat >= 24 && event.lat <= 50 && event.lng >= -125 && event.lng <= -66;
}

export function clampWildfireEvents(events: DisasterEvent[]): DisasterEvent[] {
  const sortedWildfires = events
    .filter((event) => event.type === "wildfire")
    .sort((a, b) => wildfireScore(b) - wildfireScore(a));
  const selectedWildfires = [
    ...sortedWildfires
      .filter((event) => isUnitedStatesEvent(event) && wildfireScore(event) >= MIN_US_WILDFIRE_SCORE)
      .slice(0, MAX_US_WILDFIRE_EVENTS),
  ];
  const selectedIds = new Set(selectedWildfires.map((event) => event.id));

  for (const event of sortedWildfires) {
    if (selectedWildfires.length >= MAX_WILDFIRE_EVENTS) break;
    if (selectedIds.has(event.id)) continue;
    selectedWildfires.push(event);
    selectedIds.add(event.id);
  }

  const wildfires = selectedWildfires.sort((a, b) => wildfireScore(b) - wildfireScore(a));
  const wildfireIds = new Set(wildfires.map((event) => event.id));

  return events.filter((event) => event.type !== "wildfire" || wildfireIds.has(event.id));
}

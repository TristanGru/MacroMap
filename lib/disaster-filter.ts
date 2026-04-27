import type { DisasterEvent } from "@/lib/types";

const MAX_WILDFIRE_EVENTS = 12;

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

export function clampWildfireEvents(events: DisasterEvent[]): DisasterEvent[] {
  const wildfires = events
    .filter((event) => event.type === "wildfire")
    .sort((a, b) => wildfireScore(b) - wildfireScore(a))
    .slice(0, MAX_WILDFIRE_EVENTS);
  const wildfireIds = new Set(wildfires.map((event) => event.id));

  return events.filter((event) => event.type !== "wildfire" || wildfireIds.has(event.id));
}

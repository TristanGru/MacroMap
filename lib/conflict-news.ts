import { CHOKEPOINTS } from "@/data/chokepoints";
import { fetchGoogleNews } from "@/lib/google-news";
import type { ConflictEvent } from "@/lib/types";

const CONFLICT_TERMS = "(attack OR missile OR drone OR strike OR explosion OR blockade OR piracy OR conflict OR fighting OR protest)";

function cleanDescription(title: string, source: string): string {
  return `${title} (${source})`.slice(0, 200);
}

export async function fetchConflictNewsEvents(): Promise<ConflictEvent[]> {
  const seen = new Set<string>();
  const events: ConflictEvent[] = [];
  const priorityChokepoints = CHOKEPOINTS
    .slice()
    .sort((a, b) => b.strategicImportance - a.strategicImportance)
    .slice(0, 10);

  const results = await Promise.all(
    priorityChokepoints.map(async (cp) => ({
      cp,
      articles: await fetchGoogleNews(`"${cp.name}" ${CONFLICT_TERMS} when:7d`, 4),
    }))
  );

  for (const { cp, articles } of results) {
    for (const article of articles) {
      if (seen.has(article.url)) continue;
      seen.add(article.url);
      events.push({
        id: `news-${Buffer.from(article.url).toString("base64url").slice(0, 24)}`,
        lat: cp.coordinates[1],
        lng: cp.coordinates[0],
        type: "Conflict news",
        date: article.publishedAt,
        description: cleanDescription(article.title, article.source),
        country: cp.name,
        fatalities: 0,
        nearestChokepointId: cp.id,
        distanceKm: 0,
      });
    }
  }

  return events
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 40);
}

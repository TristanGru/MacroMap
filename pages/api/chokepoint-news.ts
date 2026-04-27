import type { NextApiRequest, NextApiResponse } from "next";
import { CHOKEPOINT_MAP } from "@/data/chokepoints";
import { fetchGoogleNews } from "@/lib/google-news";
import { readCache } from "@/lib/disruption-state";
import type { NewsArticle } from "@/lib/types";

interface ChokepointNewsResponse {
  articles: NewsArticle[];
  source: "cache" | "google-news";
}

function isFreshEnough(publishedAt: string): boolean {
  return Date.now() - new Date(publishedAt).getTime() < 7 * 24 * 60 * 60 * 1000;
}

function newsQuery(name: string): string {
  return `"${name}" shipping OR tanker OR vessel OR transit OR port OR canal OR strait OR disruption when:7d`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChokepointNewsResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const id = req.query.id;
  if (typeof id !== "string" || !id) {
    return res.status(400).json({ error: "Missing id" });
  }

  const cp = CHOKEPOINT_MAP[id];
  if (!cp) {
    return res.status(404).json({ error: "Unknown chokepoint" });
  }

  const cache = await readCache();
  const cachedArticles = cache.chokepoints[id]?.articles ?? [];
  const freshCachedArticles = cachedArticles.filter((article) =>
    isFreshEnough(article.publishedAt)
  );

  if (freshCachedArticles.length > 0) {
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
    return res.status(200).json({
      articles: freshCachedArticles.slice(0, 5),
      source: "cache",
    });
  }

  const articles = await fetchGoogleNews(newsQuery(cp.name), 5);
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
  return res.status(200).json({ articles, source: "google-news" });
}

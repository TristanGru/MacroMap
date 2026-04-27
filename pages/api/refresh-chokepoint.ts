import type { NextApiRequest, NextApiResponse } from "next";
import { queryGdelt } from "@/lib/gdelt";
import { updateChokepointInKV, appendRiskTimeline } from "@/lib/disruption-state";
import { getPortWatchFlowEvidence } from "@/lib/portwatch";
import { CHOKEPOINT_MAP } from "@/data/chokepoints";

interface RefreshResponse {
  success: boolean;
  chokepointId?: string;
  state?: string;
  articleCount?: number;
  observedFlow?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RefreshResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  // Auth: Bearer CRON_SECRET
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    console.warn("[refresh-chokepoint] Unauthorized request");
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const id = req.query.id as string | undefined;
  if (!id) {
    return res.status(400).json({ success: false, error: "Missing ?id= parameter" });
  }

  const cp = CHOKEPOINT_MAP[id];
  if (!cp) {
    return res
      .status(400)
      .json({ success: false, error: `Unknown chokepoint: ${id}` });
  }

  const startTime = Date.now();
  const baseUrl = getBaseUrl(req);

  try {
    // Query GDELT for this chokepoint
    const { articles, articleCount } = await queryGdelt(id);
    const observedFlow = await getPortWatchFlowEvidence(id);

    // Fetch og:image thumbnails for articles (only if chokepoint likely stressed/disrupted)
    let articlesWithThumbs = articles;
    if (articleCount >= 3) {
      articlesWithThumbs = await Promise.all(
        articles.map(async (article) => {
          try {
            const thumbRes = await fetch(
              `${baseUrl}/api/article-meta?url=${encodeURIComponent(article.url)}`,
              { signal: AbortSignal.timeout(2500) }
            ).catch(() => null);

            if (thumbRes?.ok) {
              const data = await thumbRes.json().catch(() => null);
              if (data?.thumbnailUrl) {
                return { ...article, thumbnailUrl: data.thumbnailUrl as string };
              }
            }
          } catch {
            // Thumbnail fetch failed — use fallback
          }
          return article;
        })
      );
    }

    // Update KV + append risk timeline
    const result = await updateChokepointInKV(
      id,
      articleCount,
      articlesWithThumbs,
      observedFlow
    );
    // Fire-and-forget (non-blocking)
    appendRiskTimeline(id, result.newState).catch(() => {});

    const duration = Date.now() - startTime;
    console.log(
      `[refresh-chokepoint] id=${id} articleCount=${articleCount} state=${result.newState} duration_ms=${duration}`
    );

    return res.status(200).json({
      success: result.success,
      chokepointId: id,
      state: result.newState,
      articleCount,
      observedFlow: observedFlow?.summary,
      error: result.error,
    });
  } catch (err) {
    console.error(`[refresh-chokepoint] Error for ${id}:`, err);
    return res.status(500).json({ success: false, error: String(err) });
  }
}

function getBaseUrl(req: NextApiRequest): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto || (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${protocol}://${req.headers.host}`;
}

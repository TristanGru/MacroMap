import type { NextApiRequest, NextApiResponse } from "next";

interface ArticleMetaResponse {
  thumbnailUrl: string | null;
}

/**
 * Private IP ranges to block for SSRF protection.
 * Applies to both initial URL and all redirect destinations.
 */
const PRIVATE_IP_PATTERNS = [
  /^127\./,                         // loopback
  /^10\./,                          // RFC 1918
  /^172\.(1[6-9]|2\d|3[01])\./,   // RFC 1918
  /^192\.168\./,                    // RFC 1918
  /^169\.254\./,                    // link-local (AWS metadata)
  /^::1$/,                          // IPv6 loopback
  /^fc00:/i,                        // IPv6 unique local
  /^fe80:/i,                        // IPv6 link-local
  /^0\./,                           // non-routable
];

const BLOCKED_HOSTNAMES = ["localhost", "0.0.0.0", "metadata.google.internal"];

function isPrivateIp(hostname: string): boolean {
  if (BLOCKED_HOSTNAMES.includes(hostname.toLowerCase())) return true;
  return PRIVATE_IP_PATTERNS.some((p) => p.test(hostname));
}

function validateUrl(urlStr: string): { valid: boolean; error?: string } {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { valid: false, error: "Invalid URL" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { valid: false, error: "Only http/https URLs allowed" };
  }

  const hostname = parsed.hostname;
  if (isPrivateIp(hostname)) {
    console.warn(`[article-meta] SSRF attempt blocked: ${hostname}`);
    return { valid: false, error: "Private IP blocked" };
  }

  return { valid: true };
}

async function fetchWithRedirectValidation(
  url: string,
  maxRedirects = 3
): Promise<Response | null> {
  let currentUrl = url;
  let redirectCount = 0;

  while (redirectCount <= maxRedirects) {
    const validation = validateUrl(currentUrl);
    if (!validation.valid) {
      console.warn(`[article-meta] Blocked redirect to ${currentUrl}: ${validation.error}`);
      return null;
    }

    const res = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual", // handle redirects manually so we can validate
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MacroMap/1.0)",
      },
      signal: AbortSignal.timeout(2000),
    });

    // Follow redirect manually
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return null;

      // Resolve relative redirect
      try {
        currentUrl = new URL(location, currentUrl).toString();
      } catch {
        return null;
      }
      redirectCount++;
      continue;
    }

    return res;
  }

  return null; // too many redirects
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ArticleMetaResponse>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const urlParam = req.query.url as string | undefined;
  if (!urlParam) {
    return res.status(400).json({ thumbnailUrl: null });
  }

  // Validate the initial URL
  const validation = validateUrl(urlParam);
  if (!validation.valid) {
    return res.status(400).json({ thumbnailUrl: null });
  }

  // Attempt to fetch with redirect-chain SSRF validation, with 1 retry
  let response: Response | null = null;
  let html = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await fetchWithRedirectValidation(urlParam);
      if (response?.ok) {
        html = await response.text();
        break;
      }
    } catch {
      if (attempt === 0) continue; // retry once
    }
  }

  if (!html) {
    return res.status(200).json({ thumbnailUrl: null });
  }

  // Extract og:image from HTML
  const ogImageMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  ) || html.match(
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
  );

  const rawUrl = ogImageMatch?.[1] ?? null;
  if (!rawUrl) {
    return res.status(200).json({ thumbnailUrl: null });
  }

  // Validate the og:image URL before returning it
  const imgValidation = validateUrl(rawUrl);
  if (!imgValidation.valid) {
    return res.status(200).json({ thumbnailUrl: null });
  }

  return res.status(200).json({ thumbnailUrl: rawUrl });
}

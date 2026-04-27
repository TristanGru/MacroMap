import type { NextApiRequest, NextApiResponse } from "next";
import {
  getPortWatchFlowEvidence,
  getPortWatchSnapshot,
  PORTWATCH_ENABLED_CHOKEPOINT_IDS,
} from "@/lib/portwatch";
import type { PortWatchFlowEvidence, PortWatchRerouteSignal } from "@/lib/types";

interface PortWatchFlowResponse {
  evidence: Record<string, PortWatchFlowEvidence | null>;
  reroutes: PortWatchRerouteSignal[];
  fetchedAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PortWatchFlowResponse>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res
      .status(405)
      .json({ evidence: {}, reroutes: [], fetchedAt: new Date().toISOString() });
  }

  const requestedId = typeof req.query.id === "string" ? req.query.id : null;
  const snapshot = await getPortWatchSnapshot();
  const ids = requestedId ? [requestedId] : PORTWATCH_ENABLED_CHOKEPOINT_IDS;
  const evidence: Record<string, PortWatchFlowEvidence | null> = {};

  for (const id of ids) {
    evidence[id] = snapshot.evidence[id] ?? (await getPortWatchFlowEvidence(id));
  }

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
  return res.status(200).json({
    evidence,
    reroutes: snapshot.reroutes,
    fetchedAt: new Date().toISOString(),
  });
}

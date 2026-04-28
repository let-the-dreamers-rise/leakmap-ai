/**
 * Pub/Sub adapter for async scan job dispatch.
 * In cloud mode: publishes messages via Pub/Sub REST API.
 * In demo mode: logs and returns immediately.
 */

import { cloudConfig, isDemoMode } from "./config";

export type ScanJob = {
  caseId: string;
  assetId: string;
  sha256: string;
  platforms: string[];
  priority: "critical" | "standard";
  requestedAt: string;
};

const demoJobs: ScanJob[] = [];

export async function publishScanJob(job: ScanJob): Promise<string> {
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (isDemoMode()) {
    demoJobs.push(job);
    console.log(`[demo] Pub/Sub: published scan job ${messageId} for case ${job.caseId}`);
    return messageId;
  }

  const url = `https://pubsub.googleapis.com/v1/projects/${cloudConfig.projectId}/topics/${cloudConfig.pubsubTopicScans}:publish`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            data: Buffer.from(JSON.stringify(job)).toString("base64"),
            attributes: { caseId: job.caseId, priority: job.priority },
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Pub/Sub publish failed: ${res.status}`);
    const data = (await res.json()) as { messageIds?: string[] };
    return data.messageIds?.[0] ?? messageId;
  } catch (err) {
    console.error("[cloud] Pub/Sub publish error:", err);
    return messageId;
  }
}

export function getDemoJobs(): ScanJob[] {
  return [...demoJobs];
}

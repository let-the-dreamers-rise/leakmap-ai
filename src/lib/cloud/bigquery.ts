/**
 * BigQuery adapter for propagation analytics.
 * In cloud mode: inserts rows via BigQuery streaming API.
 * In demo mode: accumulates events in-memory.
 */

import { cloudConfig, isDemoMode } from "./config";

export type PropagationEvent = {
  caseId: string;
  suspectId: string;
  platform: string;
  region: string;
  compositeScore: number;
  velocity: number;
  detectedAt: string;
};

const demoEvents: PropagationEvent[] = [];

export async function logPropagationEvent(event: PropagationEvent): Promise<void> {
  if (isDemoMode()) {
    demoEvents.push(event);
    console.log(`[demo] BigQuery: logged propagation event for ${event.caseId}/${event.suspectId}`);
    return;
  }

  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${cloudConfig.projectId}/datasets/${cloudConfig.bigqueryDataset}/tables/propagation_events/insertAll`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows: [{ insertId: `${event.caseId}-${event.suspectId}-${Date.now()}`, json: event }],
      }),
    });
  } catch (err) {
    console.error("[cloud] BigQuery insert error:", err);
  }
}

export async function getRiskTrends(): Promise<{ platform: string; count: number; avgScore: number }[]> {
  if (isDemoMode()) {
    // Return credible demo data
    return [
      { platform: "YouTube", count: 142, avgScore: 0.74 },
      { platform: "Telegram", count: 89, avgScore: 0.81 },
      { platform: "TikTok", count: 217, avgScore: 0.62 },
      { platform: "Reddit", count: 56, avgScore: 0.58 },
      { platform: "Twitter/X", count: 103, avgScore: 0.69 },
    ];
  }

  const query = `SELECT platform, COUNT(*) as count, AVG(compositeScore) as avgScore FROM \`${cloudConfig.projectId}.${cloudConfig.bigqueryDataset}.propagation_events\` WHERE detectedAt >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY) GROUP BY platform ORDER BY count DESC LIMIT 10`;
  try {
    const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${cloudConfig.projectId}/queries`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, useLegacySql: false }),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { rows?: { f: { v: string }[] }[] };
    return (data.rows ?? []).map((r) => ({
      platform: r.f[0].v,
      count: Number(r.f[1].v),
      avgScore: Number(r.f[2].v),
    }));
  } catch {
    return [];
  }
}

export function getDemoEvents(): PropagationEvent[] {
  return [...demoEvents];
}

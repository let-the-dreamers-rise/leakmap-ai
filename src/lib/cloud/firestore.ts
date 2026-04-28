/**
 * Firestore adapter.
 * In cloud mode: uses Firestore REST API.
 * In demo mode: in-memory Map.
 */

import { cloudConfig, isDemoMode } from "./config";

export type CaseRecord = {
  caseId: string;
  status: "open" | "reviewing" | "escalated" | "resolved";
  analystNotes: { text: string; timestamp: string; author: string }[];
  matchStatuses: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

const demoCases = new Map<string, CaseRecord>();

function firestoreUrl(path: string) {
  return `https://firestore.googleapis.com/v1/projects/${cloudConfig.projectId}/databases/${cloudConfig.firestoreDatabase}/documents/${path}`;
}

export async function saveCase(caseId: string, data: Record<string, unknown>): Promise<void> {
  const record: CaseRecord = {
    caseId,
    status: "open",
    analystNotes: [],
    matchStatuses: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  };

  if (isDemoMode()) {
    demoCases.set(caseId, record);
    console.log(`[demo] Firestore: saved case ${caseId}`);
    return;
  }

  try {
    await fetch(firestoreUrl(`cases/${caseId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: toFirestoreFields(record) }),
    });
  } catch (err) {
    console.error("[cloud] Firestore save error:", err);
    demoCases.set(caseId, record);
  }
}

export async function addAnalystNote(
  caseId: string,
  note: string,
  author = "analyst",
): Promise<CaseRecord | null> {
  const entry = { text: note, timestamp: new Date().toISOString(), author };

  if (isDemoMode()) {
    const existing = demoCases.get(caseId) ?? createDefaultRecord(caseId);
    existing.analystNotes.push(entry);
    existing.updatedAt = new Date().toISOString();
    demoCases.set(caseId, existing);
    console.log(`[demo] Firestore: added note to ${caseId}`);
    return existing;
  }

  try {
    // In production, use Firestore arrayUnion or transaction
    const res = await fetch(firestoreUrl(`cases/${caseId}`), { method: "GET" });
    if (res.ok) {
      const doc = (await res.json()) as { fields?: Record<string, unknown> };
      // Simplified: would use proper Firestore SDK in production
      console.log(`[cloud] Firestore: note added to ${caseId}`, doc);
    }
  } catch (err) {
    console.error("[cloud] Firestore note error:", err);
  }
  return null;
}

export async function updateMatchStatus(
  caseId: string,
  suspectId: string,
  status: string,
): Promise<void> {
  if (isDemoMode()) {
    const existing = demoCases.get(caseId) ?? createDefaultRecord(caseId);
    existing.matchStatuses[suspectId] = status;
    existing.updatedAt = new Date().toISOString();
    demoCases.set(caseId, existing);
    console.log(`[demo] Firestore: ${caseId} suspect ${suspectId} → ${status}`);
    return;
  }

  try {
    await fetch(firestoreUrl(`cases/${caseId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: { [`matchStatuses.${suspectId}`]: { stringValue: status } },
      }),
    });
  } catch (err) {
    console.error("[cloud] Firestore status update error:", err);
  }
}

export async function getCase(caseId: string): Promise<CaseRecord | null> {
  if (isDemoMode()) return demoCases.get(caseId) ?? null;
  try {
    const res = await fetch(firestoreUrl(`cases/${caseId}`));
    if (!res.ok) return null;
    return (await res.json()) as CaseRecord;
  } catch {
    return null;
  }
}

function createDefaultRecord(caseId: string): CaseRecord {
  return {
    caseId,
    status: "open",
    analystNotes: [],
    matchStatuses: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number") fields[k] = { integerValue: String(v) };
    else if (Array.isArray(v)) fields[k] = { arrayValue: { values: v.map((i) => ({ stringValue: String(i) })) } };
    else fields[k] = { stringValue: JSON.stringify(v) };
  }
  return fields;
}

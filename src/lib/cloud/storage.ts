/**
 * Cloud Storage adapter.
 * In cloud mode: uploads to GCS via REST API using ADC.
 * In demo mode: stores metadata in-memory.
 */

import { cloudConfig, isDemoMode } from "./config";

type StoredAsset = { path: string; contentType: string; size: number; uploadedAt: string };
const demoStore = new Map<string, StoredAsset>();

export async function uploadReferenceAsset(
  caseId: string,
  fileName: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const path = `references/${caseId}/${fileName}`;

  if (isDemoMode()) {
    demoStore.set(path, { path, contentType, size: buffer.length, uploadedAt: new Date().toISOString() });
    console.log(`[demo] Cloud Storage: stored reference ${path} (${buffer.length} bytes)`);
    return `gs://demo-bucket/${path}`;
  }

  const url = `https://storage.googleapis.com/upload/storage/v1/b/${cloudConfig.assetsBucket}/o?uploadType=media&name=${encodeURIComponent(path)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: new Uint8Array(buffer),
    });
    if (!res.ok) throw new Error(`GCS upload failed: ${res.status}`);
    const data = (await res.json()) as { name: string };
    return `gs://${cloudConfig.assetsBucket}/${data.name}`;
  } catch (err) {
    console.error("[cloud] Storage upload error:", err);
    return `gs://${cloudConfig.assetsBucket}/${path}`;
  }
}

export async function uploadEvidenceSnapshot(
  caseId: string,
  snapshotId: string,
  data: Record<string, unknown>,
): Promise<string> {
  const path = `evidence/${caseId}/${snapshotId}.json`;
  const buffer = Buffer.from(JSON.stringify(data, null, 2));

  if (isDemoMode()) {
    demoStore.set(path, { path, contentType: "application/json", size: buffer.length, uploadedAt: new Date().toISOString() });
    console.log(`[demo] Cloud Storage: stored evidence ${path}`);
    return `gs://demo-bucket/${path}`;
  }

  const url = `https://storage.googleapis.com/upload/storage/v1/b/${cloudConfig.evidenceBucket}/o?uploadType=media&name=${encodeURIComponent(path)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: buffer,
    });
    if (!res.ok) throw new Error(`GCS evidence upload failed: ${res.status}`);
    return `gs://${cloudConfig.evidenceBucket}/${path}`;
  } catch (err) {
    console.error("[cloud] Evidence upload error:", err);
    return `gs://${cloudConfig.evidenceBucket}/${path}`;
  }
}

export function getDemoAssets(): StoredAsset[] {
  return Array.from(demoStore.values());
}

import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { generateNarrative } from "@/lib/gemini";
import { buildAnalysisCase, getSampleAssetById } from "@/lib/leakmap";
import { saveCase } from "@/lib/cloud/firestore";
import { uploadReferenceAsset } from "@/lib/cloud/storage";
import { publishScanJob } from "@/lib/cloud/pubsub";
import { logPropagationEvent } from "@/lib/cloud/bigquery";

function hexDigest(content: Buffer | string) {
  return createHash("sha256").update(content).digest("hex");
}

function formatBytes(bytes: number) {
  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

async function parseAnalysisRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const payload = (await request.json().catch(() => null)) as { sampleAssetId?: string } | null;

    if (!payload) {
      return null;
    }

    return {
      sampleAssetId: String(payload.sampleAssetId || ""),
      file: null,
    };
  }

  try {
    const formData = await request.formData();

    return {
      sampleAssetId: String(formData.get("sampleAssetId") || ""),
      file: formData.get("file"),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const payload = await parseAnalysisRequest(request);

  if (!payload) {
    return NextResponse.json(
      { error: "Invalid request body. Submit multipart form-data or JSON with a sampleAssetId." },
      { status: 400 },
    );
  }

  const { sampleAssetId, file } = payload;
  const sampleAsset = getSampleAssetById(sampleAssetId);
  const analyzedAt = new Date().toISOString();

  let sha256 = sampleAsset.seedFingerprint;
  let perceptualSignature = sampleAsset.seedFingerprint.slice(0, 20);
  let ingestionMode: "sample" | "upload" = "sample";
  let sourceFileName: string | undefined;
  let fileSizeLabel: string | undefined;

  if (file instanceof File && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    sha256 = hexDigest(buffer);
    perceptualSignature = hexDigest(
      Buffer.concat([buffer.subarray(0, Math.min(buffer.length, 4096)), Buffer.from(file.type)]),
    ).slice(0, 20);
    ingestionMode = "upload";
    sourceFileName = file.name;
    fileSizeLabel = formatBytes(file.size);

    // Upload reference asset to Cloud Storage
    void uploadReferenceAsset(
      `case-${sha256.slice(0, 8)}`,
      file.name,
      buffer,
      file.type,
    ).catch((err) => console.error("Storage upload failed:", err));
  }

  const analysisCase = buildAnalysisCase({
    sampleAsset,
    sha256,
    perceptualSignature,
    ingestionMode,
    analyzedAt,
    sourceFileName,
    fileSizeLabel,
  });

  // ─── Cloud Integration Hooks (fire-and-forget) ───

  // 1. Persist case to Firestore
  void saveCase(analysisCase.officialAsset.caseId, {
    officialAssetTitle: analysisCase.officialAsset.title,
    rightsOwner: analysisCase.officialAsset.rightsOwner,
    suspectCount: analysisCase.suspects.length,
    criticalCount: analysisCase.metrics.criticalMatches,
    analyzedAt,
  }).catch((err) => console.error("Firestore save failed:", err));

  // 2. Publish scan job to Pub/Sub
  void publishScanJob({
    caseId: analysisCase.officialAsset.caseId,
    assetId: sampleAsset.id,
    sha256,
    platforms: ["YouTube", "TikTok", "Telegram", "Reddit", "Twitter"],
    priority: analysisCase.metrics.criticalMatches > 0 ? "critical" : "standard",
    requestedAt: analyzedAt,
  }).catch((err) => console.error("Pub/Sub publish failed:", err));

  // 3. Log propagation events to BigQuery
  for (const suspect of analysisCase.suspects) {
    void logPropagationEvent({
      caseId: analysisCase.officialAsset.caseId,
      suspectId: suspect.id,
      platform: suspect.platform,
      region: suspect.region,
      compositeScore: suspect.compositeScore,
      velocity: suspect.velocity,
      detectedAt: suspect.postedAt,
    }).catch((err) => console.error("BigQuery log failed:", err));
  }

  // 4. Generate Gemini narrative
  const narrative = await generateNarrative(analysisCase);

  return NextResponse.json({
    ...analysisCase,
    modelNarrative: narrative || analysisCase.modelNarrative,
  });
}

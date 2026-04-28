import { GoogleGenAI } from "@google/genai";

import type { AnalysisCase, SuspectAsset } from "@/lib/leakmap";

function createClient() {
  const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI === "true";

  if (useVertex && process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION) {
    return new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION,
      apiVersion: "v1",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

const MODEL = "gemini-2.5-flash";

export async function generateNarrative(analysisCase: AnalysisCase) {
  const client = createClient();
  if (!client) {
    return null;
  }

  const topSuspect = analysisCase.suspects[0];
  const prompt = [
    "You are writing a rights-protection operator brief for a sports media trust and safety team.",
    "Write 3 short sentences with decisive language and no bullets.",
    `Official asset: ${analysisCase.officialAsset.title} for ${analysisCase.officialAsset.rightsOwner}.`,
    `Leak thesis: ${analysisCase.leakThesis}`,
    `Top suspect: ${topSuspect.account} on ${topSuspect.platform} with ${Math.round(topSuspect.compositeScore * 100)}% composite confidence.`,
    `Watermark trace: ${analysisCase.officialAsset.watermarkSignals.join("; ")}.`,
    `Recommended action: ${analysisCase.enforcementPlan[0]}`,
    "Mention if human review is still required before takedown.",
  ].join(" ");

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return response.text?.trim() || null;
  } catch {
    return null;
  }
}

export async function generateTakedownDraft(
  analysisCase: AnalysisCase,
  suspect: SuspectAsset,
) {
  const client = createClient();
  if (!client) {
    return null;
  }

  const prompt = [
    "Draft a formal DMCA/copyright takedown notice for a digital platform.",
    "Keep it under 150 words. Use professional legal language.",
    `Rights holder: ${analysisCase.officialAsset.rightsOwner}.`,
    `Original work: ${analysisCase.officialAsset.title} from ${analysisCase.officialAsset.event}.`,
    `Infringing content: "${suspect.title}" posted by ${suspect.account} on ${suspect.platform}.`,
    `Evidence: ${Math.round(suspect.fingerprintScore * 100)}% fingerprint match, ${Math.round(suspect.watermarkScore * 100)}% watermark recovery.`,
    `Modifications detected: ${suspect.modifications.join(", ")}.`,
    `URL: ${suspect.url}`,
    "Include a good-faith statement and request for immediate removal.",
  ].join(" ");

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    return response.text?.trim() || null;
  } catch {
    return null;
  }
}

export async function explainAnomaly(suspect: SuspectAsset) {
  const client = createClient();
  if (!client) {
    return null;
  }

  const prompt = [
    "You are a media forensics analyst explaining an anomaly to a trust & safety operator.",
    "Write 2 concise sentences explaining why this content is suspicious.",
    `Content: "${suspect.title}" by ${suspect.account} on ${suspect.platform}.`,
    `Fingerprint overlap: ${Math.round(suspect.fingerprintScore * 100)}%.`,
    `Watermark recovery: ${Math.round(suspect.watermarkScore * 100)}%.`,
    `AI alteration risk: ${Math.round(suspect.aiAlterationRisk * 100)}%.`,
    `Modifications: ${suspect.modifications.join(", ")}.`,
    `Velocity: ${suspect.velocity} shares/hour.`,
  ].join(" ");

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    return response.text?.trim() || null;
  } catch {
    return null;
  }
}

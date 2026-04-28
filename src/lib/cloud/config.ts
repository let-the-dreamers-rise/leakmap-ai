/** Cloud configuration — env-driven with automatic demo-mode fallback. */

export const cloudConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT || "",
  location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",

  // Storage
  assetsBucket: process.env.GCS_BUCKET_ASSETS || "",
  evidenceBucket: process.env.GCS_BUCKET_EVIDENCE || "",

  // Firestore
  firestoreDatabase: process.env.FIRESTORE_DATABASE || "(default)",

  // BigQuery
  bigqueryDataset: process.env.BIGQUERY_DATASET || "leakmap_analytics",

  // Pub/Sub
  pubsubTopicScans: process.env.PUBSUB_TOPIC_SCANS || "leakmap-scan-jobs",

  // Gemini
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
  useVertexAI: process.env.GOOGLE_GENAI_USE_VERTEXAI === "true",
} as const;

export function isCloudMode(): boolean {
  return Boolean(cloudConfig.projectId);
}

export function isDemoMode(): boolean {
  return !isCloudMode();
}

export function getServiceStatus() {
  const has = (v: string) => Boolean(v);
  return {
    cloudRun: true, // always true when running
    cloudStorage: has(cloudConfig.assetsBucket),
    firestore: has(cloudConfig.projectId),
    bigquery: has(cloudConfig.projectId) && has(cloudConfig.bigqueryDataset),
    pubsub: has(cloudConfig.projectId) && has(cloudConfig.pubsubTopicScans),
    gemini: has(cloudConfig.geminiApiKey) || cloudConfig.useVertexAI,
    mode: isCloudMode() ? ("cloud" as const) : ("demo" as const),
  };
}

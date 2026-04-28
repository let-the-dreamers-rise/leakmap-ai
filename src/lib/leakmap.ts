export type MediaKind = "video" | "image";
export type MatchStatus = "critical" | "review" | "licensed" | "synthetic";

export type SampleAsset = {
  id: string;
  title: string;
  sport: string;
  event: string;
  rightsOwner: string;
  region: string;
  releaseChannel: string;
  usagePolicy: string;
  kind: MediaKind;
  seedFingerprint: string;
  watermarkKey: string;
};

export type OfficialAsset = SampleAsset & {
  caseId: string;
  sha256: string;
  perceptualSignature: string;
  watermarkSignals: string[];
  ingestionMode: "sample" | "upload";
  analyzedAt: string;
  sourceFileName?: string;
  fileSizeLabel?: string;
};

export type SuspectAsset = {
  id: string;
  title: string;
  platform: string;
  account: string;
  region: string;
  postedAt: string;
  status: MatchStatus;
  compositeScore: number;
  fingerprintScore: number;
  watermarkScore: number;
  aiAlterationRisk: number;
  velocity: number;
  reach: string;
  modifications: string[];
  likelySource: string;
  url: string;
};

export type PropagationNode = {
  id: string;
  label: string;
  kind: "source" | "partner" | "mirror" | "amplifier" | "archive";
  confidence: number;
};

export type EvidenceItem = {
  label: string;
  value: string;
  tone: "critical" | "elevated" | "neutral";
};

export type CloudTrack = {
  service: string;
  role: string;
  stage: "now" | "next";
};

export type AnalysisCase = {
  officialAsset: OfficialAsset;
  suspects: SuspectAsset[];
  propagation: PropagationNode[];
  evidencePack: EvidenceItem[];
  cloudTrack: CloudTrack[];
  enforcementPlan: string[];
  legalGuardrails: string[];
  metrics: {
    infringementsFound: number;
    criticalMatches: number;
    meanConfidence: number;
    firstLeakWindow: string;
  };
  leakThesis: string;
  modelNarrative: string;
};

export const sampleAssets: SampleAsset[] = [
  {
    id: "continental-final-goal",
    title: "Continental Final equalizer clip",
    sport: "Football",
    event: "Continental Cup 2026 Final",
    rightsOwner: "Apex Sports Network",
    region: "EMEA + APAC",
    releaseChannel: "Licensed broadcast CDN",
    usagePolicy: "Only official highlight partners may republish after 30 minutes.",
    kind: "video",
    seedFingerprint: "9f3ab8cd21e4ff88d10a7712bf8890ec",
    watermarkKey: "apex-east-feed",
  },
  {
    id: "slam-dunk-photo",
    title: "Championship dunk still",
    sport: "Basketball",
    event: "Metro League Finals",
    rightsOwner: "Northlight Sports Media",
    region: "North America",
    releaseChannel: "Photo wire and editorial desk",
    usagePolicy: "Commercial reuse requires an active editorial license.",
    kind: "image",
    seedFingerprint: "72ad0f3342ae99bd11c8fe5d7777cc13",
    watermarkKey: "northlight-photo-wire",
  },
  {
    id: "sprint-finish",
    title: "100m finish line replay",
    sport: "Athletics",
    event: "World Track Series",
    rightsOwner: "Velocity Global Sports",
    region: "Global digital rights",
    releaseChannel: "Official app and OTT clips",
    usagePolicy: "Short-form social clips are restricted to owned handles only.",
    kind: "video",
    seedFingerprint: "bc88d144ef0081c91e4337fab40a55cc",
    watermarkKey: "velocity-ott-master",
  },
];

type BuildAnalysisInput = {
  sampleAsset: SampleAsset;
  sha256: string;
  perceptualSignature: string;
  ingestionMode: "sample" | "upload";
  analyzedAt: string;
  sourceFileName?: string;
  fileSizeLabel?: string;
};

const suspectTemplates = [
  {
    title: "Mirror upload with score bug overlay",
    platform: "YouTube",
    account: "MirrorScore247",
    region: "Global",
    likelySource: "Broadcast partner clipping workstation",
    modifications: ["full re-upload", "score bug overlay", "re-encoded 720p"],
    url: "https://example.com/mirror-score-247",
    reach: "284k views",
    baseStatus: "critical" as MatchStatus,
  },
  {
    title: "Telegram fan drop",
    platform: "Telegram",
    account: "StadiumLeaksHD",
    region: "MENA",
    likelySource: "VIP distribution room",
    modifications: ["cropped", "frame-rate reduced", "caption burned in"],
    url: "https://example.com/stadium-leaks-hd",
    reach: "11 channels mirrored",
    baseStatus: "critical" as MatchStatus,
  },
  {
    title: "Short-form remix with AI voiceover",
    platform: "TikTok",
    account: "ClipChaos",
    region: "South Asia",
    likelySource: "Fan-page relay",
    modifications: ["30 second excerpt", "AI narration", "subtitle restyle"],
    url: "https://example.com/clip-chaos",
    reach: "126k plays",
    baseStatus: "review" as MatchStatus,
  },
  {
    title: "Odds forum embed",
    platform: "Reddit",
    account: "BettingWireLive",
    region: "Europe",
    likelySource: "Affiliate syndication feed",
    modifications: ["embedded mirror", "commentary stripped", "logo blurred"],
    url: "https://example.com/betting-wire-live",
    reach: "8.2k active thread viewers",
    baseStatus: "review" as MatchStatus,
  },
  {
    title: "Licensed post-game reel",
    platform: "OTT partner",
    account: "ArenaPlus Official",
    region: "APAC",
    likelySource: "Licensed usage window",
    modifications: ["official lower-third", "trimmed teaser"],
    url: "https://example.com/arena-plus-official",
    reach: "Compliant partner post",
    baseStatus: "licensed" as MatchStatus,
  },
];

const cloudTrack: CloudTrack[] = [
  {
    service: "Cloud Run",
    role: "Hosts the Next.js control plane and analysis APIs.",
    stage: "now",
  },
  {
    service: "Cloud Storage",
    role: "Stores reference uploads, suspect snapshots, and evidence bundles.",
    stage: "now",
  },
  {
    service: "Gemini API / Vertex AI",
    role: "Writes infringement summaries, anomaly explanations, and operator notes.",
    stage: "now",
  },
  {
    service: "Firestore",
    role: "Tracks cases, takedown workflow state, and analyst comments.",
    stage: "next",
  },
  {
    service: "BigQuery",
    role: "Aggregates propagation events and leak-source analytics over time.",
    stage: "next",
  },
  {
    service: "Pub/Sub",
    role: "Fans out ingestion jobs for near real-time scanning across platforms.",
    stage: "next",
  },
];

const legalGuardrails = [
  "Only ingest owned or licensed reference assets from the rights holder.",
  "Treat every match as a lead until a human reviews copyright exceptions or partner permissions.",
  "Store the minimum evidence needed for verification and platform reporting.",
  "Do not auto-send takedowns or accusations without analyst approval and platform-specific compliance.",
];

function seededNumber(seed: string, offset: number) {
  const slice = seed.slice(offset, offset + 8).padEnd(8, "0");
  const value = Number.parseInt(slice, 16);
  return Number.isFinite(value) ? (value % 1000) / 1000 : 0.5;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function percentLabel(value: number) {
  return `${Math.round(value * 100)}%`;
}

function dateShift(baseIso: string, hoursBack: number) {
  const base = new Date(baseIso);
  base.setHours(base.getHours() - hoursBack);
  return base.toISOString();
}

function buildCaseId(seed: string) {
  return `LM-${seed.slice(0, 4).toUpperCase()}-${seed.slice(8, 12).toUpperCase()}`;
}

function buildPropagation(seed: string, owner: string): PropagationNode[] {
  return [
    {
      id: "source",
      label: `${owner} release master`,
      kind: "source",
      confidence: 0.99,
    },
    {
      id: "partner",
      label: "East feed partner relay",
      kind: "partner",
      confidence: clamp(0.76 + seededNumber(seed, 4) * 0.18),
    },
    {
      id: "mirror",
      label: "MirrorScore247 mirror",
      kind: "mirror",
      confidence: clamp(0.71 + seededNumber(seed, 6) * 0.16),
    },
    {
      id: "amplifier",
      label: "ClipChaos social remix",
      kind: "amplifier",
      confidence: clamp(0.66 + seededNumber(seed, 10) * 0.18),
    },
    {
      id: "archive",
      label: "Archive + betting reposts",
      kind: "archive",
      confidence: clamp(0.61 + seededNumber(seed, 12) * 0.2),
    },
  ];
}

export function buildAnalysisCase(input: BuildAnalysisInput): AnalysisCase {
  const { sampleAsset, sha256, perceptualSignature, ingestionMode, analyzedAt, sourceFileName, fileSizeLabel } =
    input;
  const seed = `${sha256}${perceptualSignature}${sampleAsset.seedFingerprint}`.replace(/[^a-f0-9]/gi, "").toLowerCase();
  const suspects = suspectTemplates
    .map((template, index) => {
      const fingerprintScore = clamp(0.62 + seededNumber(seed, index * 2) * 0.31);
      const watermarkScore = clamp(0.41 + seededNumber(seed, index * 3 + 2) * 0.46);
      const aiAlterationRisk = clamp(0.12 + seededNumber(seed, index * 4 + 6) * 0.63);
      const velocity = Math.round(18 + seededNumber(seed, index * 5 + 4) * 89);
      const compositeScore = clamp(
        fingerprintScore * 0.45 + watermarkScore * 0.3 + aiAlterationRisk * 0.1 + (velocity / 100) * 0.15,
      );

      let status = template.baseStatus;
      if (status !== "licensed") {
        status = compositeScore > 0.78 ? "critical" : compositeScore > 0.58 ? "review" : "synthetic";
      }

      return {
        id: `${template.account}-${index + 1}`,
        title: template.title,
        platform: template.platform,
        account: template.account,
        region: template.region,
        postedAt: dateShift(analyzedAt, index * 3 + 1),
        status,
        compositeScore,
        fingerprintScore,
        watermarkScore,
        aiAlterationRisk,
        velocity,
        reach: template.reach,
        modifications: template.modifications,
        likelySource: template.likelySource,
        url: template.url,
      } satisfies SuspectAsset;
    })
    .toSorted((a, b) => b.compositeScore - a.compositeScore);

  const criticalMatches = suspects.filter((suspect) => suspect.status === "critical");
  const topCritical = criticalMatches[0] ?? suspects[0];
  const meanConfidence =
    suspects.reduce((sum, suspect) => sum + suspect.compositeScore, 0) / Math.max(suspects.length, 1);
  const watermarkSignals = [
    `${sampleAsset.watermarkKey} · regional watermark trace`,
    `${sampleAsset.releaseChannel} · release path alignment`,
    `${sampleAsset.kind === "video" ? "frame cadence" : "pixel lattice"} signature match`,
  ];

  const officialAsset: OfficialAsset = {
    ...sampleAsset,
    caseId: buildCaseId(seed),
    sha256,
    perceptualSignature,
    watermarkSignals,
    ingestionMode,
    analyzedAt,
    sourceFileName,
    fileSizeLabel,
  };

  const propagation = buildPropagation(seed, sampleAsset.rightsOwner);

  const evidencePack: EvidenceItem[] = [
    {
      label: "Likely first unauthorized node",
      value: `${topCritical.account} on ${topCritical.platform} (${topCritical.region})`,
      tone: "critical",
    },
    {
      label: "Fingerprint confidence",
      value: `${percentLabel(topCritical.fingerprintScore)} visual/audio signature overlap`,
      tone: "critical",
    },
    {
      label: "Watermark recovery",
      value: `${percentLabel(topCritical.watermarkScore)} trace for ${sampleAsset.watermarkKey}`,
      tone: topCritical.watermarkScore > 0.65 ? "critical" : "elevated",
    },
    {
      label: "Leak attribution thesis",
      value: `${topCritical.likelySource} is the highest-probability origin vector.`,
      tone: "elevated",
    },
    {
      label: "Recommended action",
      value: topCritical.status === "critical"
        ? "Freeze partner replay privileges, preserve evidence, prepare takedown packet."
        : "Monitor propagation and request manual analyst review.",
      tone: topCritical.status === "critical" ? "critical" : "neutral",
    },
  ];

  const enforcementPlan = [
    "Preserve the reference asset, suspect URLs, and confidence trail in a signed evidence bundle.",
    "Route critical matches to analyst review before any notice or takedown is sent.",
    "Contact the suspected partner origin when watermark evidence exceeds 65%.",
    "Escalate recurrent mirrors into a blocklist for faster future scoring.",
  ];

  const leakThesis = `${sampleAsset.rightsOwner} likely leaked through ${topCritical.likelySource.toLowerCase()}, then spread into ${
    suspects[1]?.platform ?? "mirror networks"
  } within ${1 + suspects.length * 3} hours.`;

  return {
    officialAsset,
    suspects,
    propagation,
    evidencePack,
    cloudTrack,
    enforcementPlan,
    legalGuardrails,
    metrics: {
      infringementsFound: suspects.filter((suspect) => suspect.status !== "licensed").length,
      criticalMatches: criticalMatches.length,
      meanConfidence,
      firstLeakWindow: `${1 + Math.round(seededNumber(seed, 3) * 4)}h after release`,
    },
    leakThesis,
    modelNarrative:
      "Gemini summary unavailable. Add a Google API key to generate a live operator brief and takedown narrative.",
  };
}

export function getSampleAssetById(id: string) {
  return sampleAssets.find((asset) => asset.id === id) ?? sampleAssets[0];
}

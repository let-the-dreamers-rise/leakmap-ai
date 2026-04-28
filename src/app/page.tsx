import { LeakMapWorkbench } from "@/components/leakmap-workbench";
import { buildAnalysisCase, sampleAssets } from "@/lib/leakmap";

export default function Home() {
  const initialCase = buildAnalysisCase({
    sampleAsset: sampleAssets[0],
    sha256: sampleAssets[0].seedFingerprint,
    perceptualSignature: sampleAssets[0].seedFingerprint.slice(0, 20),
    ingestionMode: "sample",
    analyzedAt: new Date().toISOString(),
  });

  return <LeakMapWorkbench assets={sampleAssets} initialCase={initialCase} />;
}

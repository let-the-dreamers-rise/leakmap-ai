"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";

import { CommandHeader } from "./command-header";
import { LeftRail } from "./left-rail";
import { CenterWorkspace } from "./center-workspace";
import { RightInspector } from "./right-inspector";

import type { AnalysisCase, SampleAsset } from "@/lib/leakmap";

type Props = {
  assets: SampleAsset[];
  initialCase: AnalysisCase;
};

const MOBILE_TABS = ["overview", "threats", "evidence", "inspector", "intake"] as const;
type MobileTab = (typeof MOBILE_TABS)[number];

const MOBILE_TAB_LABELS: Record<MobileTab, string> = {
  overview: "Overview",
  threats: "Threats",
  evidence: "Evidence",
  inspector: "Inspector",
  intake: "Intake",
};

export function LeakMapWorkbench({ assets, initialCase }: Props) {
  /* ─── Core State ─── */
  const [analysis, setAnalysis] = useState(initialCase);
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSuspectId, setSelectedSuspectId] = useState(initialCase.suspects[0]?.id ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [takedownDraft, setTakedownDraft] = useState("");
  const [showTakedownModal, setShowTakedownModal] = useState(false);
  const [isGeneratingTakedown, setIsGeneratingTakedown] = useState(false);

  /* ─── Filters ─── */
  const [platformFilter, setPlatformFilter] = useState("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  /* ─── Tabs ─── */
  const [centerTab, setCenterTab] = useState("overview");
  const [mobileTab, setMobileTab] = useState<MobileTab>("overview");

  /* ─── Analyst ─── */
  const [analystNotes, setAnalystNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState("");

  /* ─── Derived ─── */
  const platformOptions = useMemo(
    () => ["all", ...new Set(analysis.suspects.map((s) => s.platform))],
    [analysis.suspects],
  );

  const visibleSuspects = useMemo(() => {
    return analysis.suspects.filter((s) => {
      const matchesPlatform = platformFilter === "all" || s.platform === platformFilter;
      const needle = deferredQuery.trim().toLowerCase();
      const matchesQuery =
        !needle ||
        s.account.toLowerCase().includes(needle) ||
        s.title.toLowerCase().includes(needle) ||
        s.region.toLowerCase().includes(needle) ||
        s.likelySource.toLowerCase().includes(needle);
      return matchesPlatform && matchesQuery;
    });
  }, [analysis.suspects, deferredQuery, platformFilter]);

  const selectedSuspect =
    visibleSuspects.find((s) => s.id === selectedSuspectId) ??
    visibleSuspects[0] ??
    analysis.suspects[0];

  /* ─── Handlers ─── */
  function submitAnalysis(mode: "sample" | "upload") {
    setErrorMessage("");
    startTransition(() => {
      void (async () => {
        try {
          const formData = new FormData();
          formData.set("sampleAssetId", selectedAssetId);

          if (mode === "upload") {
            if (!selectedFile) {
              setErrorMessage("Choose owned media before upload analysis.");
              return;
            }
            formData.set("file", selectedFile);
          }

          const res = await fetch("/api/analyze", { method: "POST", body: formData });
          if (!res.ok) {
            setErrorMessage("Analysis failed. Retry or use seeded case.");
            return;
          }

          const next = (await res.json()) as AnalysisCase;
          setAnalysis(next);
          setSelectedSuspectId(next.suspects[0]?.id ?? "");
          setAnalystNotes([]);
          setErrorMessage("");
        } catch (err) {
          setErrorMessage("Network error. Check connection and retry.");
        }
      })();
    });
  }

  function handleAddNote() {
    const text = noteInput.trim();
    if (!text) return;
    setAnalystNotes((prev) => [...prev, text]);
    setNoteInput("");
    void fetch(`/api/cases/${analysis.officialAsset.caseId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: text }),
    }).catch(() => {});
  }

  function handleDraftTakedown() {
    setIsGeneratingTakedown(true);
    setShowTakedownModal(true);
    setTakedownDraft("Generating takedown notice with Gemini AI...");

    void (async () => {
      try {
        const res = await fetch("/api/takedown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caseId: analysis.officialAsset.caseId,
            suspect: {
              account: selectedSuspect.account,
              platform: selectedSuspect.platform,
              url: selectedSuspect.url,
              compositeScore: selectedSuspect.compositeScore,
              modifications: selectedSuspect.modifications,
            },
            rightsOwner: analysis.officialAsset.rightsOwner,
            event: analysis.officialAsset.event,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setTakedownDraft(data.draft);
        } else {
          // Fallback: generate a static takedown notice
          setTakedownDraft(generateStaticTakedown());
        }
      } catch {
        setTakedownDraft(generateStaticTakedown());
      } finally {
        setIsGeneratingTakedown(false);
      }
    })();
  }

  function generateStaticTakedown() {
    return `DMCA TAKEDOWN NOTICE — AUTOMATED DRAFT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Case ID: ${analysis.officialAsset.caseId}
Generated: ${new Date().toISOString()}

TO: Content Moderation Team
RE: Unauthorized redistribution of copyrighted sports media

Dear Sir/Madam,

I am writing on behalf of ${analysis.officialAsset.rightsOwner}, the exclusive rights holder for "${analysis.officialAsset.title}" from ${analysis.officialAsset.event}.

INFRINGING CONTENT:
• Account: ${selectedSuspect.account}
• Platform: ${selectedSuspect.platform}
• URL: ${selectedSuspect.url}
• Region: ${selectedSuspect.region}
• Confidence Score: ${Math.round(selectedSuspect.compositeScore * 100)}%

EVIDENCE:
• Fingerprint Match: ${Math.round(selectedSuspect.fingerprintScore * 100)}%
• Watermark Recovery: ${Math.round(selectedSuspect.watermarkScore * 100)}%
• Modifications detected: ${selectedSuspect.modifications.join(", ")}
• Likely source: ${selectedSuspect.likelySource}
• Velocity: ${selectedSuspect.velocity} reshares/hr

The above content was posted without authorization and violates our exclusive broadcast rights under the usage policy: "${analysis.officialAsset.usagePolicy}".

We request immediate removal of the infringing content and preservation of associated account data for potential legal proceedings.

This notice is submitted under the Digital Millennium Copyright Act (DMCA), 17 U.S.C. § 512(c).

Sincerely,
Trust & Safety Operations
${analysis.officialAsset.rightsOwner}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by LeakMap AI · Digital Media Protection Platform`;
  }

  function handleExport() {
    const report = {
      exportedAt: new Date().toISOString(),
      caseId: analysis.officialAsset.caseId,
      officialAsset: analysis.officialAsset,
      metrics: analysis.metrics,
      leakThesis: analysis.leakThesis,
      suspects: analysis.suspects.map((s) => ({
        account: s.account,
        platform: s.platform,
        region: s.region,
        compositeScore: s.compositeScore,
        fingerprintScore: s.fingerprintScore,
        watermarkScore: s.watermarkScore,
        status: s.status,
        velocity: s.velocity,
        reach: s.reach,
        modifications: s.modifications,
        url: s.url,
      })),
      propagation: analysis.propagation,
      evidencePack: analysis.evidencePack,
      enforcementPlan: analysis.enforcementPlan,
      legalGuardrails: analysis.legalGuardrails,
      modelNarrative: analysis.modelNarrative,
      analystNotes,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leakmap-${analysis.officialAsset.caseId}-report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ─── Mobile content router ─── */
  function renderMobileContent() {
    switch (mobileTab) {
      case "overview":
        return (
          <CenterWorkspace
            analysis={analysis} suspects={visibleSuspects}
            selectedSuspectId={selectedSuspectId} onSelectSuspect={(id) => { setSelectedSuspectId(id); setMobileTab("inspector"); }}
            platformFilter={platformFilter} onPlatformFilter={setPlatformFilter}
            query={query} onQueryChange={setQuery} platformOptions={platformOptions}
            activeTab="overview" onTabChange={() => {}} hideTabs
          />
        );
      case "threats":
        return (
          <CenterWorkspace
            analysis={analysis} suspects={visibleSuspects}
            selectedSuspectId={selectedSuspectId} onSelectSuspect={(id) => { setSelectedSuspectId(id); setMobileTab("inspector"); }}
            platformFilter={platformFilter} onPlatformFilter={setPlatformFilter}
            query={query} onQueryChange={setQuery} platformOptions={platformOptions}
            activeTab="threats" onTabChange={() => {}} hideTabs
          />
        );
      case "evidence":
        return (
          <CenterWorkspace
            analysis={analysis} suspects={visibleSuspects}
            selectedSuspectId={selectedSuspectId} onSelectSuspect={setSelectedSuspectId}
            platformFilter={platformFilter} onPlatformFilter={setPlatformFilter}
            query={query} onQueryChange={setQuery} platformOptions={platformOptions}
            activeTab="evidence" onTabChange={() => {}} hideTabs
          />
        );
      case "inspector":
        return (
          <RightInspector
            analysis={analysis} selectedSuspect={selectedSuspect}
            analystNotes={analystNotes} noteInput={noteInput}
            onNoteInputChange={setNoteInput} onAddNote={handleAddNote} onDraftTakedown={handleDraftTakedown}
          />
        );
      case "intake":
        return (
          <div style={{ padding: 16 }}>
            <LeftRail
              assets={assets} selectedAssetId={selectedAssetId} onAssetChange={setSelectedAssetId}
              selectedFile={selectedFile} onFileChange={setSelectedFile}
              analysis={analysis} isPending={isPending} errorMessage={errorMessage}
              onSubmitSample={() => submitAnalysis("sample")} onSubmitUpload={() => submitAnalysis("upload")}
            />
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      maxHeight: "100vh",
      overflow: "hidden",
      background: "#0b0f13",
      color: "#e8e4dd",
    }}>
      <CommandHeader
        analysis={analysis}
        isPending={isPending}
        onRunScan={() => submitAnalysis("sample")}
        onDraftTakedown={handleDraftTakedown}
        onExport={handleExport}
      />

      {/* ─── Desktop 3-column layout ─── */}
      <div
        className="desktop-body"
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <aside style={{
          width: 280, minWidth: 280, maxWidth: 280,
          borderRight: "1px solid rgba(255,255,255,0.05)",
          overflowY: "auto",
          background: "#10151a",
          flexShrink: 0,
        }}>
          <LeftRail
            assets={assets} selectedAssetId={selectedAssetId} onAssetChange={setSelectedAssetId}
            selectedFile={selectedFile} onFileChange={setSelectedFile}
            analysis={analysis} isPending={isPending} errorMessage={errorMessage}
            onSubmitSample={() => submitAnalysis("sample")} onSubmitUpload={() => submitAnalysis("upload")}
          />
        </aside>

        <main style={{ flex: 1, minWidth: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <CenterWorkspace
            analysis={analysis} suspects={visibleSuspects}
            selectedSuspectId={selectedSuspectId} onSelectSuspect={setSelectedSuspectId}
            platformFilter={platformFilter} onPlatformFilter={setPlatformFilter}
            query={query} onQueryChange={setQuery} platformOptions={platformOptions}
            activeTab={centerTab} onTabChange={setCenterTab}
          />
        </main>

        <aside style={{
          width: 350, minWidth: 350, maxWidth: 350,
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          overflowY: "auto",
          background: "#10151a",
          flexShrink: 0,
        }}>
          <RightInspector
            analysis={analysis} selectedSuspect={selectedSuspect}
            analystNotes={analystNotes} noteInput={noteInput}
            onNoteInputChange={setNoteInput} onAddNote={handleAddNote} onDraftTakedown={handleDraftTakedown}
          />
        </aside>
      </div>

      {/* ─── Mobile layout ─── */}
      <div className="mobile-body" style={{ display: "none", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{
          display: "flex",
          background: "#10151a",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          position: "sticky", top: 0, zIndex: 20,
          overflowX: "auto",
        }}>
          {MOBILE_TABS.map((t) => (
            <button key={t} onClick={() => setMobileTab(t)}
              style={{
                flex: 1, padding: "10px 8px", fontSize: 11, fontWeight: 500,
                color: mobileTab === t ? "#e8e4dd" : "#5e5a55",
                background: "none", border: "none",
                borderBottom: mobileTab === t ? "2px solid #c45a35" : "2px solid transparent",
                cursor: "pointer", whiteSpace: "nowrap", minWidth: 80,
              }}
            >{MOBILE_TAB_LABELS[t]}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {renderMobileContent()}
        </div>
      </div>

      {/* ─── Takedown Modal ─── */}
      {showTakedownModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }} onClick={() => setShowTakedownModal(false)}>
          <div style={{
            background: "#181c20", borderRadius: 3, padding: 0,
            width: "100%", maxWidth: 700, maxHeight: "80vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px", background: "#1c2024",
            }}>
              <span className="lm-label" style={{ fontSize: 10 }}>
                {isGeneratingTakedown ? "⏳ GENERATING TAKEDOWN NOTICE…" : "✓ TAKEDOWN NOTICE DRAFT"}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="lm-btn-primary" style={{ fontSize: 10, height: 24 }}
                  onClick={() => {
                    navigator.clipboard.writeText(takedownDraft);
                  }}
                >Copy</button>
                <button className="lm-btn-ghost" style={{ fontSize: 10, height: 24 }}
                  onClick={() => setShowTakedownModal(false)}
                >Close</button>
              </div>
            </div>
            <pre style={{
              padding: 16, margin: 0, flex: 1, overflow: "auto",
              fontSize: 11, lineHeight: 1.6, color: "#e0e3e8",
              fontFamily: "var(--font-plex-mono), monospace",
              whiteSpace: "pre-wrap", wordBreak: "break-word" as const,
            }}>
              {takedownDraft}
            </pre>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1279px) {
          .desktop-body { display: none !important; }
          .mobile-body { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

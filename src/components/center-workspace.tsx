"use client";

import { Globe, Search, Siren } from "lucide-react";
import type { AnalysisCase, SuspectAsset } from "@/lib/leakmap";

const TABS = ["overview", "threats", "propagation", "evidence"] as const;

function pct(v: number) { return `${Math.round(v * 100)}%`; }
function ts(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC",
  }).format(new Date(iso));
}

const statusBadge: Record<string, string> = {
  critical: "lm-badge lm-badge-critical",
  review: "lm-badge lm-badge-review",
  licensed: "lm-badge lm-badge-licensed",
  synthetic: "lm-badge lm-badge-synthetic",
};

/* ─── Overview Tab ─── */
function OverviewTab({ analysis }: { analysis: AnalysisCase }) {
  const top = analysis.suspects[0];
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }} className="lm-fade-in">
      {/* Incident card — tonal plate, no border */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 260px", gap: 0,
        background: "#1c2024", borderRadius: 3, overflow: "hidden",
        boxShadow: "0px 8px 24px rgba(11,15,19,0.40)",
      }}>
        <div style={{ padding: "18px 20px" }}>
          <span className="lm-label" style={{ fontSize: 9 }}>OFFICIAL ASSET</span>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#e0e3e8", letterSpacing: "-0.02em", margin: "6px 0 0" }}>
            {analysis.officialAsset.title}
          </h2>
          <p style={{ fontSize: 11, color: "#9a9590", marginTop: 5 }}>
            {analysis.officialAsset.event} · {analysis.officialAsset.region}
          </p>
          <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
            <span className="lm-badge lm-badge-critical">{analysis.metrics.criticalMatches} CRITICAL</span>
            <span className="lm-badge lm-badge-review">{analysis.metrics.infringementsFound - analysis.metrics.criticalMatches} REVIEW</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <span className="lm-label" style={{ fontSize: 9 }}>FINGERPRINT</span>
            <span className="lm-mono" style={{ display: "block", marginTop: 3, color: "#625e59", wordBreak: "break-all" as const, fontSize: 10 }}>
              {analysis.officialAsset.sha256}
            </span>
          </div>
        </div>
        {/* Top threat inset — darker plate */}
        <div style={{ background: "#181c20", padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span className="lm-label" style={{ fontSize: 9 }}>TOP THREAT</span>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#ffb5a0", margin: "4px 0 0" }}>{top.account}</p>
            <p style={{ fontSize: 10, color: "#9a9590", marginTop: 3 }}>{top.platform} · {top.region}</p>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span className="lm-label" style={{ fontSize: 9 }}>COMPOSITE</span>
              <span className="lm-mono" style={{ fontSize: 11, color: "#ffb5a0", fontWeight: 600 }}>{pct(top.compositeScore)}</span>
            </div>
            <div className="lm-meter" style={{ height: 4 }}>
              <div className="lm-meter-fill lm-meter-critical" style={{ width: pct(top.compositeScore) }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span className="lm-label" style={{ fontSize: 9 }}>VELOCITY</span>
              <span className="lm-mono" style={{ fontSize: 11, color: "#e0e3e8" }}>{top.velocity}/hr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics — recessed plates */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {[
          { label: "SUSPECTS", value: String(analysis.metrics.infringementsFound), accent: false },
          { label: "CRITICAL", value: String(analysis.metrics.criticalMatches), accent: true },
          { label: "CONFIDENCE", value: pct(analysis.metrics.meanConfidence), accent: false },
          { label: "LEAK WINDOW", value: analysis.metrics.firstLeakWindow, accent: false },
        ].map((m) => (
          <div key={m.label} style={{
            background: "#0e1216", borderRadius: 3, padding: "10px 12px",
            boxShadow: "inset 0 0 0 1px rgba(86,66,60,0.10)",
          }}>
            <span className="lm-label" style={{ fontSize: 9 }}>{m.label}</span>
            <div className="lm-mono" style={{
              fontSize: 18, fontWeight: 700, marginTop: 4, letterSpacing: "-0.02em",
              color: m.accent ? "#ffb5a0" : "#e0e3e8",
            }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Leak thesis + response queue */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: "#181c20", borderRadius: 3, padding: 16 }}>
          <span className="lm-label" style={{ fontSize: 9 }}>LEAK THESIS</span>
          <p style={{ fontSize: 12, color: "#e0e3e8", lineHeight: 1.7, margin: "8px 0 0" }}>{analysis.leakThesis}</p>
        </div>
        <div style={{ background: "#181c20", borderRadius: 3, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
            <Siren style={{ width: 11, height: 11, color: "#e85a3a" }} />
            <span className="lm-label" style={{ fontSize: 9 }}>RESPONSE QUEUE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {analysis.enforcementPlan.map((step, i) => (
              <div key={step} style={{
                fontSize: 11, color: "#9a9590", lineHeight: 1.5,
                paddingLeft: 10,
                boxShadow: `inset 3px 0 0 ${i === 0 ? "#e85a3a" : "rgba(86,66,60,0.28)"}`,
              }}>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Threats Tab ─── */
function ThreatsTab({
  suspects, selectedSuspectId, onSelectSuspect, platformFilter, onPlatformFilter, query, onQueryChange, platformOptions,
}: {
  suspects: SuspectAsset[]; selectedSuspectId: string; onSelectSuspect: (id: string) => void;
  platformFilter: string; onPlatformFilter: (p: string) => void;
  query: string; onQueryChange: (q: string) => void; platformOptions: string[];
}) {
  return (
    <div className="lm-fade-in" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        display: "flex", gap: 8, alignItems: "center", padding: "8px 16px",
        background: "#10151a", flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, flex: 1,
          background: "#0b0f13", borderRadius: "3px 3px 0 0",
          borderBottom: "1px solid rgba(86,66,60,0.15)", padding: "0 10px",
        }}>
          <Search style={{ width: 11, height: 11, color: "#3d3a37", flexShrink: 0 }} />
          <input className="lm-input" value={query} onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search handle, region, source…"
            style={{ border: "none", background: "transparent", padding: "6px 0", borderRadius: 0 }}
          />
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {platformOptions.map((p) => (
            <button key={p}
              className={platformFilter === p ? "lm-btn-primary" : "lm-btn-ghost"}
              style={{ fontSize: 9, height: 24, padding: "0 7px" }}
              onClick={() => onPlatformFilter(p)}
            >{p}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <table className="lm-table">
          <thead>
            <tr>
              <th style={{ width: "22%" }}>Source</th>
              <th>Platform</th>
              <th>Composite</th>
              <th>FP</th>
              <th>WM</th>
              <th>Vel</th>
              <th>Reach</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {suspects.map((s) => (
              <tr key={s.id} data-selected={s.id === selectedSuspectId ? "true" : undefined}
                onClick={() => onSelectSuspect(s.id)}
              >
                <td>
                  <div style={{ fontWeight: 500, color: "#e0e3e8", fontSize: 11 }}>{s.account}</div>
                  <div style={{ fontSize: 10, color: "#3d3a37", marginTop: 1 }}>{s.title}</div>
                </td>
                <td>
                  <span className="lm-mono" style={{ fontSize: 10 }}>{s.platform}</span>
                  <div style={{ fontSize: 9, color: "#3d3a37" }}>{s.region}</div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="lm-meter" style={{ width: 36, height: 3 }}>
                      <div className="lm-meter-fill lm-meter-critical" style={{ width: pct(s.compositeScore) }} />
                    </div>
                    <span className="lm-mono" style={{
                      fontSize: 11, fontWeight: 600,
                      color: s.compositeScore > 0.78 ? "#ffb5a0" : "#e0e3e8",
                    }}>{pct(s.compositeScore)}</span>
                  </div>
                </td>
                <td><span className="lm-mono" style={{ fontSize: 10 }}>{pct(s.fingerprintScore)}</span></td>
                <td><span className="lm-mono" style={{ fontSize: 10 }}>{pct(s.watermarkScore)}</span></td>
                <td><span className="lm-mono" style={{ fontSize: 10 }}>{s.velocity}</span></td>
                <td><span style={{ fontSize: 10 }}>{s.reach}</span></td>
                <td><span className={statusBadge[s.status] ?? "lm-badge"}>{s.status}</span></td>
              </tr>
            ))}
            {suspects.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: "center" as const, padding: 20, color: "#625e59" }}>No matches.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Propagation Tab ─── */
function PropagationTab({ analysis }: { analysis: AnalysisCase }) {
  return (
    <div style={{ padding: 20 }} className="lm-fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
        <Globe style={{ width: 10, height: 10, color: "#3d3a37" }} />
        <span className="lm-label">ATTRIBUTION CHAIN</span>
      </div>
      <div className="lm-chain">
        {analysis.propagation.map((node, i) => (
          <div key={node.id} style={{ display: "contents" }}>
            <div className="lm-chain-node">
              <span className="lm-label" style={{ fontSize: 9 }}>{node.kind}</span>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#e0e3e8", marginTop: 5, marginBottom: 8 }}>{node.label}</div>
              <div className="lm-meter" style={{ marginBottom: 4 }}>
                <div className="lm-meter-fill lm-meter-accent" style={{ width: pct(node.confidence) }} />
              </div>
              <span className="lm-mono" style={{ fontSize: 9, color: "#625e59" }}>{pct(node.confidence)}</span>
            </div>
            {i < analysis.propagation.length - 1 && <div className="lm-chain-edge" />}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <span className="lm-label" style={{ display: "block", marginBottom: 8 }}>WATERMARK SIGNALS</span>
        {analysis.officialAsset.watermarkSignals.map((sig) => (
          <div key={sig} style={{
            fontSize: 10, color: "#9a9590", padding: "6px 10px", marginBottom: 4,
            background: "#181c20", borderRadius: 3,
            fontFamily: "var(--font-plex-mono), monospace",
          }}>
            {sig}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Evidence Tab ─── */
function EvidenceTab({ analysis }: { analysis: AnalysisCase }) {
  const toneCls: Record<string, string> = {
    critical: "lm-evidence-critical", elevated: "lm-evidence-elevated", neutral: "lm-evidence-neutral",
  };
  return (
    <div style={{ padding: 20 }} className="lm-fade-in">
      <span className="lm-label" style={{ display: "block", marginBottom: 10 }}>EVIDENCE BUNDLE</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {analysis.evidencePack.map((item) => (
          <div key={item.label} className={toneCls[item.tone] ?? ""} style={{
            padding: "8px 12px", borderRadius: 3,
          }}>
            <span className="lm-label" style={{ fontSize: 9 }}>{item.label}</span>
            <div style={{ fontSize: 11, color: "#e0e3e8", lineHeight: 1.6, marginTop: 3 }}>{item.value}</div>
          </div>
        ))}
      </div>
      <span className="lm-label" style={{ display: "block", marginBottom: 8 }}>OPERATOR BRIEF · GEMINI</span>
      <div style={{
        padding: 14, background: "#181c20", borderRadius: 3,
        fontSize: 12, color: "#e0e3e8", lineHeight: 1.8,
      }}>
        {analysis.modelNarrative}
      </div>
      <div style={{ marginTop: 20 }}>
        <span className="lm-label" style={{ display: "block", marginBottom: 8 }}>LEGAL GUARDRAILS</span>
        {analysis.legalGuardrails.map((g) => (
          <div key={g} style={{
            fontSize: 10, color: "#625e59", lineHeight: 1.6, padding: "3px 0 3px 10px",
            boxShadow: "inset 2px 0 0 rgba(86,66,60,0.28)", marginBottom: 3,
          }}>
            {g}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Export ─── */
export function CenterWorkspace({
  analysis, suspects, selectedSuspectId, onSelectSuspect,
  platformFilter, onPlatformFilter, query, onQueryChange, platformOptions,
  activeTab, onTabChange, hideTabs = false,
}: {
  analysis: AnalysisCase; suspects: SuspectAsset[];
  selectedSuspectId: string; onSelectSuspect: (id: string) => void;
  platformFilter: string; onPlatformFilter: (p: string) => void;
  query: string; onQueryChange: (q: string) => void; platformOptions: string[];
  activeTab: string; onTabChange: (tab: string) => void;
  hideTabs?: boolean;
}) {
  const selectedSuspect = suspects.find((s) => s.id === selectedSuspectId) ?? suspects[0] ?? analysis.suspects[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {!hideTabs && (
        <div className="lm-tabs" style={{ background: "#10151a" }}>
          {TABS.map((t) => (
            <button key={t} className="lm-tab" data-active={activeTab === t ? "true" : undefined}
              onClick={() => onTabChange(t)}
            >
              {t === "overview" ? "Overview" : t === "threats" ? `Threats (${suspects.length})` : t === "propagation" ? "Propagation" : "Evidence"}
            </button>
          ))}
        </div>
      )}
      <div style={{ flex: 1, overflow: "auto", background: "#0b0f13" }}>
        {activeTab === "overview" && <OverviewTab analysis={analysis} />}
        {activeTab === "threats" && (
          <ThreatsTab suspects={suspects} selectedSuspectId={selectedSuspectId} onSelectSuspect={onSelectSuspect}
            platformFilter={platformFilter} onPlatformFilter={onPlatformFilter}
            query={query} onQueryChange={onQueryChange} platformOptions={platformOptions}
          />
        )}
        {activeTab === "propagation" && <PropagationTab analysis={analysis} />}
        {activeTab === "evidence" && <EvidenceTab analysis={analysis} />}
      </div>
    </div>
  );
}

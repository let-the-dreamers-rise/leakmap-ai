"use client";

import { FileOutput, Play, Shield, WandSparkles } from "lucide-react";
import type { AnalysisCase } from "@/lib/leakmap";

function pct(v: number) { return `${Math.round(v * 100)}%`; }

export function CommandHeader({
  analysis,
  isPending,
  onRunScan,
  onDraftTakedown,
  onExport,
}: {
  analysis: AnalysisCase;
  isPending: boolean;
  onRunScan: () => void;
  onDraftTakedown: () => void;
  onExport: () => void;
}) {
  const top = analysis.suspects[0];
  return (
    <header style={{
      background: "#10151a",
      flexShrink: 0,
    }}>
      {/* Top row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 44, gap: 16, padding: "0 16px",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 3,
            background: "linear-gradient(135deg, #e17049, #c45a35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(196,90,53,0.25), 0 2px 8px rgba(0,0,0,0.4)",
          }}>
            <Shield style={{ width: 13, height: 13, color: "#fff" }} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{
              fontSize: 13, fontWeight: 800, letterSpacing: "0.06em", color: "#e0e3e8",
              fontFamily: "var(--font-plex-mono), monospace",
            }}>
              LEAKMAP
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, color: "#ffb59d",
              letterSpacing: "0.06em",
              fontFamily: "var(--font-plex-mono), monospace",
            }}>
              AI
            </span>
          </div>
          <div style={{
            height: 16, width: 1, background: "rgba(86,66,60,0.28)", margin: "0 2px",
          }} />
          <span style={{
            fontSize: 9, color: "#3d3a37", letterSpacing: "0.10em",
            textTransform: "uppercase" as const,
            fontFamily: "var(--font-plex-mono), monospace",
            fontWeight: 600,
          }}>
            DIGITAL MEDIA PROTECTION
          </span>
        </div>

        {/* Case identity */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14, flex: 1,
          justifyContent: "center", overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="lm-dot lm-dot-live" />
            <span className="lm-mono" style={{ color: "#ffb59d", fontWeight: 600, fontSize: 11 }}>
              {analysis.officialAsset.caseId}
            </span>
          </div>
          <div style={{ height: 12, width: 1, background: "rgba(86,66,60,0.28)" }} />
          <span style={{
            fontSize: 11, color: "#9a9590",
            whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {analysis.officialAsset.rightsOwner} — {analysis.officialAsset.event}
          </span>
          <div style={{ height: 12, width: 1, background: "rgba(86,66,60,0.28)" }} />
          <span className="lm-mono" style={{ color: "#625e59", fontSize: 10 }}>
            {analysis.metrics.infringementsFound} suspects
          </span>
          <span className="lm-mono" style={{ color: "#ffb5a0", fontSize: 10 }}>
            {analysis.metrics.criticalMatches} critical
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <button className="lm-btn-primary" onClick={onRunScan} disabled={isPending}>
            <Play style={{ width: 11, height: 11 }} />
            {isPending ? "Scanning…" : "Run scan"}
          </button>
          <button className="lm-btn-secondary" onClick={onExport}>
            <FileOutput style={{ width: 11, height: 11 }} />
            Export
          </button>
          <button className="lm-btn-ghost" onClick={onDraftTakedown}>
            <WandSparkles style={{ width: 11, height: 11 }} />
            Takedown
          </button>
        </div>
      </div>

      {/* Metric strip — tonal transition, no border */}
      <div style={{
        display: "flex", gap: 0, background: "#0e1216",
        height: 32, alignItems: "center", overflow: "hidden",
      }}>
        {[
          { label: "LEAK WINDOW", value: analysis.metrics.firstLeakWindow },
          { label: "CONFIDENCE", value: pct(analysis.metrics.meanConfidence) },
          { label: "TOP SIGNAL", value: `${top.account} · ${pct(top.compositeScore)}` },
          { label: "MODE", value: "DEMO" },
        ].map((m, i) => (
          <div key={m.label} style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            padding: "0 14px", height: "100%",
            borderRight: i < 3 ? "1px solid rgba(86,66,60,0.10)" : "none",
          }}>
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.08em",
              color: "#3d3a37", fontFamily: "var(--font-plex-mono), monospace",
            }}>
              {m.label}
            </span>
            <span className="lm-mono" style={{ fontSize: 10, color: "#9a9590", fontWeight: 500 }}>
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}

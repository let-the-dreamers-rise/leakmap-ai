"use client";

import { ArrowUpRight, CheckCircle2, Circle, History, MessageSquare, ShieldAlert, WandSparkles } from "lucide-react";
import type { AnalysisCase, SuspectAsset } from "@/lib/leakmap";

function pct(v: number) { return `${Math.round(v * 100)}%`; }
function ts(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC",
  }).format(new Date(iso));
}

const statusBadge: Record<string, string> = {
  critical: "lm-badge lm-badge-critical", review: "lm-badge lm-badge-review",
  licensed: "lm-badge lm-badge-licensed", synthetic: "lm-badge lm-badge-synthetic",
};

export function RightInspector({
  analysis, selectedSuspect, analystNotes, noteInput, onNoteInputChange, onAddNote, onDraftTakedown,
}: {
  analysis: AnalysisCase; selectedSuspect: SuspectAsset;
  analystNotes: string[]; noteInput: string;
  onNoteInputChange: (v: string) => void; onAddNote: () => void; onDraftTakedown: () => void;
}) {
  const escalationChecks = [
    { label: "Rights scope confirmed", done: true },
    { label: `${pct(selectedSuspect.watermarkScore)} watermark recovery`, done: selectedSuspect.watermarkScore > 0.5 },
    { label: "Human review before takedown", done: false },
    { label: "Evidence vault ready for export", done: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header — elevated plate */}
      <div style={{
        padding: "14px 16px", background: "#1c2024",
        boxShadow: "0px 4px 16px rgba(11,15,19,0.30)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
          <ShieldAlert style={{ width: 10, height: 10, color: "#e85a3a" }} />
          <span className="lm-label" style={{ fontSize: 9 }}>SELECTED MATCH</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e0e3e8", margin: 0 }}>{selectedSuspect.account}</h3>
            <p style={{ fontSize: 10, color: "#9a9590", marginTop: 3 }}>{selectedSuspect.title}</p>
          </div>
          <span className={statusBadge[selectedSuspect.status]}>{selectedSuspect.status}</span>
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span className="lm-label" style={{ fontSize: 9 }}>COMPOSITE RISK</span>
            <span className="lm-mono" style={{ fontSize: 12, fontWeight: 700, color: "#ffb5a0" }}>{pct(selectedSuspect.compositeScore)}</span>
          </div>
          <div className="lm-meter" style={{ height: 5 }}>
            <div className="lm-meter-fill lm-meter-critical" style={{ width: pct(selectedSuspect.compositeScore) }} />
          </div>
        </div>
      </div>

      {/* Scrollable */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Signal breakdown — tonal */}
        <div style={{ padding: "14px 16px", background: "#10151a" }}>
          <span className="lm-label" style={{ fontSize: 9, display: "block", marginBottom: 10 }}>SIGNAL BREAKDOWN</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[
              { label: "Fingerprint", value: selectedSuspect.fingerprintScore, cls: "lm-meter-accent" },
              { label: "Watermark", value: selectedSuspect.watermarkScore, cls: "lm-meter-success" },
              { label: "AI alteration", value: selectedSuspect.aiAlterationRisk, cls: "lm-meter-warning" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: "#9a9590" }}>{s.label}</span>
                  <span className="lm-mono" style={{ fontSize: 11, fontWeight: 600, color: "#e0e3e8" }}>{pct(s.value)}</span>
                </div>
                <div className="lm-meter" style={{ height: 3 }}>
                  <div className={`lm-meter-fill ${s.cls}`} style={{ width: pct(s.value) }} />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 2 }}>
              <span style={{ fontSize: 10, color: "#9a9590" }}>Velocity</span>
              <span className="lm-mono" style={{ fontSize: 12, fontWeight: 700, color: "#e0e3e8" }}>{selectedSuspect.velocity}/hr</span>
            </div>
          </div>
        </div>

        {/* Match details — tonal shift */}
        <div style={{ padding: "14px 16px", background: "#0e1216" }}>
          <span className="lm-label" style={{ fontSize: 9, display: "block", marginBottom: 6 }}>MATCH DETAILS</span>
          {[
            { l: "Platform", v: `${selectedSuspect.platform} · ${selectedSuspect.region}` },
            { l: "Reach", v: selectedSuspect.reach },
            { l: "Posted", v: ts(selectedSuspect.postedAt) },
            { l: "Likely source", v: selectedSuspect.likelySource },
            { l: "Modifications", v: selectedSuspect.modifications.join(", ") },
          ].map((r) => (
            <div className="lm-kv" key={r.l} style={{ padding: "3px 0" }}>
              <span className="lm-kv-label" style={{ fontSize: 10 }}>{r.l}</span>
              <span className="lm-kv-value" style={{ fontSize: 11 }}>{r.v}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: "14px 16px", background: "#10151a" }}>
          <span className="lm-label" style={{ fontSize: 9, display: "block", marginBottom: 8 }}>ANALYST ACTIONS</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button className="lm-btn-primary" style={{ width: "100%", justifyContent: "center", height: 30 }} onClick={onDraftTakedown}>
              <WandSparkles style={{ width: 11, height: 11 }} /> Draft takedown notice
            </button>
            <button className="lm-btn-secondary" style={{ width: "100%", justifyContent: "center", height: 30 }}
              onClick={() => window.open(selectedSuspect.url, "_blank")}
            >
              <ArrowUpRight style={{ width: 11, height: 11 }} /> Open source link
            </button>
          </div>
        </div>

        {/* Escalation */}
        <div style={{ padding: "14px 16px", background: "#0e1216" }}>
          <span className="lm-label" style={{ fontSize: 9, display: "block", marginBottom: 8 }}>ESCALATION READINESS</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {escalationChecks.map((c) => (
              <div key={c.label} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "3px 0" }}>
                {c.done
                  ? <CheckCircle2 style={{ width: 13, height: 13, color: "#37a98a", flexShrink: 0, marginTop: 1 }} />
                  : <Circle style={{ width: 13, height: 13, color: "#c49538", flexShrink: 0, marginTop: 1 }} />
                }
                <span style={{ fontSize: 10, color: "#9a9590", lineHeight: 1.5 }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ padding: "14px 16px", background: "#10151a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <MessageSquare style={{ width: 9, height: 9, color: "#3d3a37" }} />
            <span className="lm-label" style={{ fontSize: 9 }}>ANALYST NOTES</span>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            <textarea className="lm-textarea" value={noteInput} onChange={(e) => onNoteInputChange(e.target.value)}
              placeholder="Add investigation note…" style={{ minHeight: 40, flex: 1 }}
            />
            <button className="lm-btn-secondary" style={{ alignSelf: "flex-end", height: 26, fontSize: 10 }} onClick={onAddNote}>Add</button>
          </div>
          {analystNotes.map((n, i) => (
            <div key={`note-${i}`} style={{
              fontSize: 10, color: "#9a9590", lineHeight: 1.5, padding: "5px 8px",
              background: "#0b0f13", borderRadius: 3, marginBottom: 3,
            }}>{n}</div>
          ))}
        </div>

        {/* Case log */}
        <div style={{ padding: "14px 16px", background: "#0e1216" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <History style={{ width: 9, height: 9, color: "#3d3a37" }} />
            <span className="lm-label" style={{ fontSize: 9 }}>CASE LOG</span>
          </div>
          {[
            `${ts(analysis.officialAsset.analyzedAt)} · Fingerprint refreshed`,
            `${ts(selectedSuspect.postedAt)} · ${selectedSuspect.account} selected`,
            `${analysis.metrics.firstLeakWindow} · First redistribution window`,
            `${analysis.metrics.infringementsFound} suspects · Evidence staged`,
          ].map((entry) => (
            <div key={entry} style={{
              fontSize: 9, color: "#3d3a37", lineHeight: 1.5,
              fontFamily: "var(--font-plex-mono), monospace", padding: "2px 0",
            }}>{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

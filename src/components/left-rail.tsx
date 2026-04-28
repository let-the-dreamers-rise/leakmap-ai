"use client";

import type { ChangeEvent } from "react";
import { Cloud, Fingerprint, Radio, Upload } from "lucide-react";
import type { AnalysisCase, SampleAsset } from "@/lib/leakmap";

const channelFeeds = [
  { label: "Broadcast relay", state: "Live", dot: "lm-dot-live" as const, detail: "East feed watermark heartbeat" },
  { label: "Social search", state: "Queued", dot: "lm-dot-queued" as const, detail: "TikTok, Telegram, Reddit · 5m" },
  { label: "Evidence vault", state: "Synced", dot: "lm-dot-synced" as const, detail: "6 snapshots preserved" },
];

const cloudServices = [
  { name: "Cloud Run", active: true },
  { name: "Gemini API", active: true },
  { name: "Cloud Storage", active: false },
  { name: "Firestore", active: false },
  { name: "BigQuery", active: false },
  { name: "Pub/Sub", active: false },
];

export function LeftRail({
  assets, selectedAssetId, onAssetChange, selectedFile, onFileChange,
  analysis, isPending, errorMessage, onSubmitSample, onSubmitUpload,
}: {
  assets: SampleAsset[];
  selectedAssetId: string;
  onAssetChange: (id: string) => void;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  analysis: AnalysisCase;
  isPending: boolean;
  errorMessage: string;
  onSubmitSample: () => void;
  onSubmitUpload: () => void;
}) {
  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    onFileChange(e.target.files?.[0] ?? null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Case Intake */}
      <div style={{ padding: "14px 14px 16px", background: "#10151a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
          <Upload style={{ width: 9, height: 9, color: "#3d3a37" }} />
          <span className="lm-label" style={{ fontSize: 9 }}>CASE INTAKE</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <label className="lm-label" style={{ display: "block", marginBottom: 4, fontSize: 9 }}>Reference asset</label>
            <select className="lm-select" value={selectedAssetId} onChange={(e) => onAssetChange(e.target.value)}>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="lm-label" style={{ display: "block", marginBottom: 4, fontSize: 9 }}>Upload owned media</label>
            <div style={{
              background: "#0b0f13",
              borderRadius: "3px 3px 0 0",
              borderBottom: "1px solid rgba(86,66,60,0.15)",
              padding: "6px 10px",
            }}>
              <input type="file" accept="video/*,image/*" onChange={handleFile}
                style={{ width: "100%", fontSize: 10, color: "#9a9590" }}
              />
              {selectedFile && (
                <p style={{ margin: "3px 0 0", fontSize: 10, color: "#625e59", fontFamily: "var(--font-plex-mono)" }}>
                  {selectedFile.name} · {Math.round(selectedFile.size / 1024)} KB
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            <button className="lm-btn-primary" style={{ flex: 1, fontSize: 10 }} onClick={onSubmitSample} disabled={isPending}>
              {isPending ? "Scanning…" : "Seeded scan"}
            </button>
            <button className="lm-btn-secondary" style={{ flex: 1, fontSize: 10 }} onClick={onSubmitUpload} disabled={isPending}>
              Upload scan
            </button>
          </div>

          {errorMessage && (
            <p style={{ fontSize: 10, color: "#e85a3a", margin: 0 }}>{errorMessage}</p>
          )}
        </div>
      </div>

      {/* Asset Metadata — tonal transition (darker bg) */}
      <div style={{ padding: "14px 14px", background: "#0e1216" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <Fingerprint style={{ width: 9, height: 9, color: "#3d3a37" }} />
          <span className="lm-label" style={{ fontSize: 9 }}>ASSET METADATA</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            { l: "Rights owner", v: analysis.officialAsset.rightsOwner },
            { l: "Event", v: analysis.officialAsset.event },
            { l: "Region", v: analysis.officialAsset.region },
            { l: "Channel", v: analysis.officialAsset.releaseChannel },
            { l: "Policy", v: analysis.officialAsset.usagePolicy },
            { l: "Watermark", v: analysis.officialAsset.watermarkKey },
            { l: "Kind", v: analysis.officialAsset.kind },
          ].map((r) => (
            <div className="lm-kv" key={r.l} style={{ padding: "4px 0" }}>
              <span className="lm-kv-label" style={{ fontSize: 10 }}>{r.l}</span>
              <span className="lm-kv-value" style={{ fontSize: 11 }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monitoring Feeds */}
      <div style={{ padding: "14px 14px", background: "#10151a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <Radio style={{ width: 9, height: 9, color: "#3d3a37" }} />
          <span className="lm-label" style={{ fontSize: 9 }}>MONITORING FEEDS</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {channelFeeds.map((f) => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`lm-dot ${f.dot}`} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#e0e3e8", fontWeight: 500 }}>{f.label}</span>
                  <span className="lm-mono" style={{ fontSize: 9, color: "#6ddab8", fontWeight: 600, letterSpacing: "0.06em" }}>{f.state}</span>
                </div>
                <p style={{ fontSize: 10, color: "#3d3a37", marginTop: 1 }}>{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Services — tonal transition */}
      <div style={{ padding: "14px 14px", background: "#0e1216", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <Cloud style={{ width: 9, height: 9, color: "#3d3a37" }} />
          <span className="lm-label" style={{ fontSize: 9 }}>GOOGLE CLOUD</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {cloudServices.map((s) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 7, padding: "2px 0" }}>
              <span className={`lm-dot ${s.active ? "lm-dot-live" : ""}`}
                style={s.active ? {} : { background: "#3d3a37", animation: "none" }}
              />
              <span style={{ fontSize: 11, color: s.active ? "#e0e3e8" : "#625e59", flex: 1 }}>
                {s.name}
              </span>
              <span className="lm-mono" style={{
                fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
                color: s.active ? "#6ddab8" : "#3d3a37",
              }}>
                {s.active ? "ON" : "—"}
              </span>
            </div>
          ))}
        </div>
        <p style={{
          fontSize: 9, color: "#3d3a37", marginTop: 10, lineHeight: 1.4,
          fontFamily: "var(--font-plex-mono), monospace",
        }}>
          Demo mode · Set GOOGLE_CLOUD_PROJECT to activate
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  Download, Zap, Calendar, Users, Shield, Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeReleaseReadiness,
  ReleaseReadinessInput,
  ReleaseReadinessResult,
  SdkEntry,
  SdkStatus,
  AuthChangeLevel,
} from "@/lib/releaseReadiness";
import DropZone from "@/components/features/DropZone";
import { SAMPLE_V1_SPEC, SAMPLE_V2_SPEC } from "@/constants/mockData";

const DEFAULT_SDKS: SdkEntry[] = [
  { name: "Python", status: "pending" },
  { name: "JavaScript", status: "pending" },
  { name: "Go", status: "pending" },
  { name: "Ruby", status: "pending" },
  { name: "PHP", status: "pending" },
  { name: "Java", status: "pending" },
  { name: ".NET", status: "pending" },
];

const SDK_STATUS_LABEL: Record<SdkStatus, string> = {
  ready: "Ready",
  pending: "Pending",
  not_planned: "Not Planned",
};

const SDK_STATUS_COLOR: Record<SdkStatus, string> = {
  ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  not_planned: "bg-slate-100 text-slate-600 border-slate-200",
};

function StatusIcon({ status }: { status: "red" | "yellow" | "green" }) {
  if (status === "green") return <CheckCircle2 className="w-8 h-8 text-emerald-600" />;
  if (status === "yellow") return <AlertTriangle className="w-8 h-8 text-amber-500" />;
  return <XCircle className="w-8 h-8 text-red-600" />;
}

function ScoreGauge({ score, status }: { score: number; status: "red" | "yellow" | "green" }) {
  const color = status === "green" ? "#16a34a" : status === "yellow" ? "#d97706" : "#dc2626";
  const bg = status === "green" ? "bg-emerald-50 border-emerald-200" : status === "yellow" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-3xl border p-8 gap-3", bg)}>
      <StatusIcon status={status} />
      <div className="text-6xl font-extrabold tabular-nums" style={{ color }}>{score}</div>
      <div className="text-sm font-bold text-slate-600 uppercase tracking-wider">out of 100</div>
      <div className="h-3 w-48 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function FactorBar({ factor }: { factor: ReleaseReadinessResult["factors"][0] }) {
  const pct = (factor.earned / factor.max) * 100;
  const barColor = pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-800">{factor.name}</span>
        <span className="font-mono text-slate-600">{factor.earned} / {factor.max} pts</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColor)}
        />
      </div>
      <p className="text-[11px] text-slate-500 leading-snug">{factor.label}</p>
    </div>
  );
}

function handlePdfExport(result: ReleaseReadinessResult, v1Name: string, v2Name: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  const statusColors = { green: "#16a34a", yellow: "#d97706", red: "#dc2626" };
  const color = statusColors[result.status];
  win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Release Readiness Report — ${v1Name} vs ${v2Name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1e293b; padding: 48px; font-size: 14px; line-height: 1.7; }
  h1 { font-size: 28px; font-weight: bold; margin-bottom: 4px; }
  h2 { font-size: 16px; font-weight: bold; margin: 24px 0 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 32px; }
  .score-box { display: flex; align-items: center; gap: 24px; padding: 24px; border: 2px solid ${color}; border-radius: 16px; background: #f8fafc; margin-bottom: 32px; }
  .score-number { font-size: 56px; font-weight: 900; color: ${color}; line-height: 1; }
  .score-label { font-size: 18px; font-weight: bold; color: ${color}; }
  .score-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; padding: 8px; border-bottom: 2px solid #e2e8f0; }
  td { padding: 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .blocker { padding: 12px 16px; border-left: 4px solid #dc2626; background: #fef2f2; border-radius: 8px; margin-bottom: 10px; }
  .blocker-title { font-weight: bold; color: #991b1b; }
  .rec { padding: 10px 16px; border-left: 4px solid #2563eb; background: #eff6ff; border-radius: 8px; margin-bottom: 8px; font-size: 13px; }
  .timeline-item { display: flex; gap: 16px; align-items: baseline; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
  .day-badge { background: #1e293b; color: #fff; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 100px; white-space: nowrap; min-width: 52px; text-align: center; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
<h1>Release Readiness Report</h1>
<p class="meta">Comparing ${v1Name} (baseline) vs ${v2Name} (candidate) &nbsp;|&nbsp; Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

<div class="score-box">
  <div class="score-number">${result.score}</div>
  <div>
    <div class="score-label">${result.statusLabel}</div>
    <div class="score-sub">${result.rawPoints} of ${result.maxPoints} points earned</div>
  </div>
</div>

<h2>Factor Breakdown</h2>
<table>
<thead><tr><th>Factor</th><th>Points Earned</th><th>Max Points</th><th>Assessment</th></tr></thead>
<tbody>
${result.factors.map((f) => `<tr><td>${f.name}</td><td>${f.earned}</td><td>${f.max}</td><td>${f.label}</td></tr>`).join("")}
</tbody>
</table>

${result.blockers.length > 0 ? `<h2>Blockers — Must Fix Before Release</h2>
${result.blockers.map((b) => `<div class="blocker"><div class="blocker-title">${b.title}</div><div>${b.description}</div></div>`).join("")}` : ""}

${result.recommendations.length > 0 ? `<h2>Recommendations</h2>
${result.recommendations.map((r) => `<div class="rec">${r}</div>`).join("")}` : ""}

<h2>Suggested Release Timeline</h2>
${result.timeline.map((t) => `<div class="timeline-item"><span class="day-badge">Day ${t.day}</span><span>${t.action}</span></div>`).join("")}
</body>
</html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

export default function ReleaseReadinessPage() {
  const [v1Content, setV1Content] = useState("");
  const [v1Name, setV1Name] = useState<string | null>(null);
  const [v2Content, setV2Content] = useState("");
  const [v2Name, setV2Name] = useState<string | null>(null);
  const [sunsetDate, setSunsetDate] = useState("");
  const [sdks, setSdks] = useState<SdkEntry[]>(DEFAULT_SDKS);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [notifiedCustomers, setNotifiedCustomers] = useState(0);
  const [authChange, setAuthChange] = useState<AuthChangeLevel>("none");
  const [result, setResult] = useState<ReleaseReadinessResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadSample = () => {
    setV1Content(SAMPLE_V1_SPEC);
    setV1Name("user-api-v1.json");
    setV2Content(SAMPLE_V2_SPEC);
    setV2Name("user-api-v2.json");
    setTotalCustomers(300);
    setNotifiedCustomers(135);
    const d = new Date();
    d.setDate(d.getDate() + 75);
    setSunsetDate(d.toISOString().split("T")[0]);
    setSdks([
      { name: "Python", status: "ready" },
      { name: "JavaScript", status: "pending" },
      { name: "Go", status: "ready" },
      { name: "Ruby", status: "not_planned" },
      { name: "PHP", status: "not_planned" },
      { name: "Java", status: "pending" },
      { name: ".NET", status: "not_planned" },
    ]);
    setAuthChange("minor");
    setResult(null);
    setError("");
  };

  const updateSdkStatus = (name: string, status: SdkStatus) => {
    setSdks((prev) => prev.map((s) => (s.name === name ? { ...s, status } : s)));
  };

  const handleCompute = () => {
    setError("");
    if (!v1Content || !v2Content) {
      setError("Please upload or load both v1 and v2 OpenAPI specifications.");
      return;
    }
    setLoading(true);
    try {
      const input: ReleaseReadinessInput = {
        v1Content,
        v2Content,
        v1Name: v1Name || "v1-spec.json",
        v2Name: v2Name || "v2-spec.json",
        sunsetDate,
        sdks,
        totalCustomers,
        notifiedCustomers,
        authChange,
      };
      const res = computeReleaseReadiness(input);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Check your spec format.");
    } finally {
      setLoading(false);
    }
  };

  const canRun = v1Content.length > 0 && v2Content.length > 0;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 font-sans text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Release Readiness Scorecard</h1>
              <p className="text-xs text-slate-500 mt-0.5">Go / No-Go decision engine — 8 risk factors, 0–100 score</p>
            </div>
          </div>
          <button
            onClick={loadSample}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            Load Sample Data
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: Input Form */}
          <div className="space-y-5">

            {/* Spec Upload */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900">API Specifications</h2>
              <DropZone
                label="Baseline Specification (v1)"
                version="v1"
                fileName={v1Name}
                onFileContent={(c, n) => { setV1Content(c); setV1Name(n); }}
                onClear={() => { setV1Content(""); setV1Name(null); }}
              />
              <DropZone
                label="Candidate Specification (v2)"
                version="v2"
                fileName={v2Name}
                onFileContent={(c, n) => { setV2Content(c); setV2Name(n); }}
                onClear={() => { setV2Content(""); setV2Name(null); }}
              />
            </div>

            {/* SDK Readiness */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900">SDK Update Readiness</h2>
              <p className="text-xs text-slate-500">Mark the status of each official SDK for v2 support.</p>
              {sdks.map((sdk) => (
                <div key={sdk.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 w-24">{sdk.name}</span>
                  <div className="flex gap-1.5">
                    {(["ready", "pending", "not_planned"] as SdkStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateSdkStatus(sdk.name, s)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer",
                          sdk.status === s ? SDK_STATUS_COLOR[s] : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {SDK_STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Customer & Sunset */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Deprecation & Customer Data</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                  v1 Sunset Date
                </label>
                <input
                  type="date"
                  value={sunsetDate}
                  onChange={(e) => setSunsetDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:outline-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    <Users className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                    Total v1 Customers
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={totalCustomers || ""}
                    onChange={(e) => setTotalCustomers(Number(e.target.value))}
                    placeholder="e.g. 300"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    <Users className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                    Already Notified
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={totalCustomers}
                    value={notifiedCustomers || ""}
                    onChange={(e) => setNotifiedCustomers(Number(e.target.value))}
                    placeholder="e.g. 135"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  <Shield className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                  Authentication / Security Changes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["none", "minor", "moderate", "major"] as AuthChangeLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setAuthChange(lvl)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left",
                        authChange === lvl
                          ? lvl === "none" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                            lvl === "minor" ? "bg-blue-100 text-blue-800 border-blue-300" :
                            lvl === "moderate" ? "bg-amber-100 text-amber-800 border-amber-300" :
                            "bg-red-100 text-red-800 border-red-300"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      <span className="capitalize">{lvl}</span>
                      <span className="block text-[10px] font-normal mt-0.5 opacity-70">
                        {lvl === "none" ? "No changes" : lvl === "minor" ? "New optional header" : lvl === "moderate" ? "API key → Basic Auth" : "API key → OAuth"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleCompute}
              disabled={!canRun || loading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-extrabold shadow-md shadow-blue-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Computing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Check Release Readiness
                </>
              )}
            </button>
          </div>

          {/* Right: Results */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                {/* Score */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-900">Release Decision</h2>
                    <button
                      onClick={() => handlePdfExport(result, v1Name || "v1", v2Name || "v2")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export PDF
                    </button>
                  </div>
                  <ScoreGauge score={result.score} status={result.status} />
                  <div className={cn(
                    "mt-4 p-3 rounded-xl text-center text-sm font-bold tracking-wide",
                    result.status === "green" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                    result.status === "yellow" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                    "bg-red-50 text-red-800 border border-red-200"
                  )}>
                    {result.statusLabel}
                  </div>
                </div>

                {/* Factor Breakdown */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-slate-900">Factor Breakdown</h2>
                  {result.factors.map((f) => (
                    <FactorBar key={f.name} factor={f} />
                  ))}
                </div>

                {/* Blockers */}
                {result.blockers.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Blockers — Fix Before Release
                    </h2>
                    {result.blockers.map((b) => (
                      <div key={b.id} className="p-3.5 rounded-xl border-l-4 border-red-500 bg-red-50">
                        <p className="text-xs font-bold text-red-900">{b.title}</p>
                        <p className="text-xs text-red-800/80 mt-0.5 leading-relaxed">{b.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2.5">
                    <h2 className="text-sm font-bold text-slate-900">Recommendations</h2>
                    {result.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 mb-4">Suggested Release Timeline</h2>
                  <div className="space-y-2.5">
                    {result.timeline.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-[11px] font-mono font-bold bg-slate-900 text-white px-2.5 py-1 rounded-full flex-shrink-0">
                          Day {step.day}
                        </span>
                        <span className="text-xs text-slate-700 pt-1">{step.action}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl text-center gap-4 shadow-sm"
              >
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Go / No-Go Analysis</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Upload your specs and fill in the metadata form, then click the button to receive your release readiness score.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

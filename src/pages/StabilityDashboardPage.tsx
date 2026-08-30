import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus, Plus, Trash2,
  Download, Zap, BarChart2, CheckCircle, AlertTriangle, XCircle
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";
import { computeStabilityAnalysis, VersionEntry, StabilityResult, VersionMetrics } from "@/lib/stabilityAnalysis";
import { SAMPLE_V1_SPEC, SAMPLE_V2_SPEC } from "@/constants/mockData";

// ── Sample third version (additive, no breaking) ──────────────────────────────
const SAMPLE_V3_SPEC = JSON.stringify({
  openapi: "3.0.0",
  info: { title: "User API", version: "3.0.0" },
  paths: {
    "/users": {
      get: { operationId: "listUsers", summary: "List users", responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "array", items: { type: "object" } } } } } } },
      post: { operationId: "createUser", summary: "Create user", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "email"], properties: { name: { type: "string" }, email: { type: "string" }, role: { type: "string" } } } } } }, responses: { "201": { description: "Created" } } }
    },
    "/users/{id}": {
      get: { operationId: "getUser", summary: "Get user", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } },
      put: { operationId: "updateUser", summary: "Update user", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], requestBody: { required: false, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, role: { type: "string" } } } } } }, responses: { "200": { description: "OK" } } },
      delete: { operationId: "deleteUser", summary: "Delete user", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { "204": { description: "No Content" } } }
    },
    "/users/search": {
      get: { operationId: "searchUsers", summary: "Search users", parameters: [{ name: "q", in: "query", required: false, schema: { type: "string" } }], responses: { "200": { description: "OK" } } }
    }
  }
}, null, 2);

// ── Status badge styles ───────────────────────────────────────────────────────
const BADGE_STYLES: Record<VersionMetrics["statusBadge"], string> = {
  stable: "bg-emerald-100 text-emerald-800 border-emerald-200",
  risky: "bg-amber-100 text-amber-800 border-amber-200",
  major: "bg-red-100 text-red-800 border-red-200",
};

const BADGE_ICON = {
  stable: <CheckCircle className="w-3 h-3" />,
  risky: <AlertTriangle className="w-3 h-3" />,
  major: <XCircle className="w-3 h-3" />,
};

// ── PDF Export ────────────────────────────────────────────────────────────────
function handlePdfExport(result: StabilityResult) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>API Stability Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1e293b; padding: 48px; font-size: 14px; line-height: 1.7; }
  h1 { font-size: 28px; font-weight: bold; margin-bottom: 4px; }
  h2 { font-size: 16px; font-weight: bold; margin: 24px 0 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
  .meta { color: #64748b; font-size: 12px; margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; padding: 8px; border-bottom: 2px solid #e2e8f0; }
  td { padding: 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .trend { padding: 16px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; margin-top: 8px; }
  .insight { padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; font-size: 13px; }
  .insight-pos { border-left: 4px solid #16a34a; background: #f0fdf4; }
  .insight-neg { border-left: 4px solid #dc2626; background: #fef2f2; }
  .insight-title { font-weight: bold; margin-bottom: 4px; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
<h1>API Stability Report</h1>
<p class="meta">${result.versions.length} versions analyzed &nbsp;|&nbsp; Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

<h2>Version Timeline</h2>
<table>
<thead><tr><th>Version</th><th>Release Date</th><th>Breaking</th><th>Safe</th><th>Endpoints</th><th>Migration Rate</th><th>Status</th></tr></thead>
<tbody>
${result.versions
  .map(
    (v) =>
      `<tr><td>${v.name}</td><td>${new Date(v.releaseDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</td><td>${v.breakingChanges}</td><td>${v.safeChanges}</td><td>${v.totalEndpoints}</td><td>${v.migrationSuccessRate !== null ? v.migrationSuccessRate + "%" : "N/A"}</td><td>${v.statusBadge.toUpperCase()}</td></tr>`
  )
  .join("")}
</tbody>
</table>

<h2>Trend Analysis</h2>
<div class="trend">
<strong>Direction:</strong> ${result.trend.direction.toUpperCase()}<br>
${result.trend.label}<br><br>
Average breaking changes per release: ${result.trend.avgBreakingPerRelease}<br>
Total breaking changes: ${result.trend.totalBreaking}<br>
Average months between releases: ${result.trend.releaseFrequencyMonths}
</div>

<h2>Competitive Benchmark</h2>
<table>
<thead><tr><th>Metric</th><th>Your API</th><th>Stripe</th><th>Shopify</th><th>GitHub</th></tr></thead>
<tbody>
${result.benchmarks.map((b) => `<tr><td>${b.metric}</td><td><strong>${b.yours}</strong></td><td>${b.stripe}</td><td>${b.shopify}</td><td>${b.github}</td></tr>`).join("")}
</tbody>
</table>

<h2>Strategic Insights</h2>
${result.insights.map((ins) => `<div class="insight ${ins.positive ? "insight-pos" : "insight-neg"}"><div class="insight-title">${ins.title}</div>${ins.body}</div>`).join("")}
</body>
</html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

// ── Version Entry Form ────────────────────────────────────────────────────────
interface VersionFormEntry {
  id: string;
  name: string;
  releaseDate: string;
  specContent: string;
  fileName: string | null;
  totalCustomers: string;
  migratedCustomers: string;
}

function emptyEntry(): VersionFormEntry {
  return {
    id: Math.random().toString(36).slice(2, 8),
    name: "",
    releaseDate: "",
    specContent: "",
    fileName: null,
    totalCustomers: "",
    migratedCustomers: "",
  };
}

export default function StabilityDashboardPage() {
  const [entries, setEntries] = useState<VersionFormEntry[]>([emptyEntry(), emptyEntry(), emptyEntry()]);
  const [result, setResult] = useState<StabilityResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addVersion = () => {
    if (entries.length < 10) setEntries((p) => [...p, emptyEntry()]);
  };

  const removeVersion = (id: string) => {
    if (entries.length > 2) setEntries((p) => p.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, patch: Partial<VersionFormEntry>) => {
    setEntries((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const handleFileForEntry = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) =>
      updateEntry(id, { specContent: ev.target?.result as string, fileName: file.name });
    reader.readAsText(file);
  };

  const loadSample = () => {
    const today = new Date();
    const d = (offsetDays: number) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - offsetDays);
      return dt.toISOString().split("T")[0];
    };
    setEntries([
      { id: "s1", name: "v1.0", releaseDate: d(365), specContent: SAMPLE_V1_SPEC, fileName: "v1.json", totalCustomers: "200", migratedCustomers: "200" },
      { id: "s2", name: "v1.5", releaseDate: d(240), specContent: SAMPLE_V2_SPEC, fileName: "v1.5.json", totalCustomers: "280", migratedCustomers: "242" },
      { id: "s3", name: "v2.0", releaseDate: d(90), specContent: SAMPLE_V3_SPEC, fileName: "v2.json", totalCustomers: "310", migratedCustomers: "298" },
    ]);
    setResult(null);
    setError("");
  };

  const handleCompute = () => {
    setError("");
    const valid = entries.filter((e) => e.name && e.releaseDate && e.specContent);
    if (valid.length < 2) {
      setError("At least 2 versions with a name, release date, and uploaded spec are required.");
      return;
    }
    setLoading(true);
    try {
      const payload: VersionEntry[] = valid.map((e) => ({
        name: e.name,
        releaseDate: e.releaseDate,
        specContent: e.specContent,
        totalCustomers: e.totalCustomers ? Number(e.totalCustomers) : undefined,
        migratedCustomers: e.migratedCustomers ? Number(e.migratedCustomers) : undefined,
      }));
      setResult(computeStabilityAnalysis(payload));
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Analysis failed. Check spec formats.");
    } finally {
      setLoading(false);
    }
  };

  // Chart data derived from result
  const chartData = result
    ? result.versions.map((v) => ({
        name: v.name,
        Breaking: v.breakingChanges,
        Safe: v.safeChanges,
        Endpoints: v.totalEndpoints,
      }))
    : [];

  const benchmarkChartData = result
    ? result.benchmarks
        .filter((b) => !isNaN(Number(b.yours.replace(/[^0-9.]/g, ""))))
        .slice(0, 2)
        .map((b) => ({
          metric: b.metric,
          Yours: Number(b.yours.replace(/[^0-9.]/g, "")),
          Stripe: Number(b.stripe.replace(/[^0-9.]/g, "")),
          Shopify: Number(b.shopify.replace(/[^0-9.]/g, "")),
          GitHub: Number(b.github.replace(/[^0-9.]/g, "")),
        }))
    : [];

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 font-sans text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">API Stability Dashboard</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-version trend analysis, competitive benchmarking, and release predictions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <button
                onClick={() => handlePdfExport(result)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>
            )}
            <button
              onClick={loadSample}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Load Sample Data
            </button>
          </div>
        </div>

        {/* Version Input Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">API Versions ({entries.length} / 10)</h2>
            <button
              onClick={addVersion}
              disabled={entries.length >= 10}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Version
            </button>
          </div>

          <div className="space-y-3">
            {entries.map((entry, idx) => (
              <div
                key={entry.id}
                className="grid grid-cols-1 sm:grid-cols-6 gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50"
              >
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Version</label>
                  <input
                    type="text"
                    placeholder="v1.0"
                    value={entry.name}
                    onChange={(e) => updateEntry(entry.id, { name: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Release Date</label>
                  <input
                    type="date"
                    value={entry.releaseDate}
                    onChange={(e) => updateEntry(entry.id, { releaseDate: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">OpenAPI Spec</label>
                  <label className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors",
                    entry.fileName ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  )}>
                    <BarChart2 className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{entry.fileName || "Upload spec"}</span>
                    <input
                      type="file"
                      accept=".json,.yaml,.yml"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileForEntry(entry.id, f); }}
                    />
                  </label>
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Total Customers</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 300"
                    value={entry.totalCustomers}
                    onChange={(e) => updateEntry(entry.id, { totalCustomers: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Migrated</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 280"
                    value={entry.migratedCustomers}
                    onChange={(e) => updateEntry(entry.id, { migratedCustomers: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <button
                    onClick={() => removeVersion(entry.id)}
                    disabled={entries.length <= 2}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 cursor-pointer"
                    title="Remove version"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          )}

          <button
            onClick={handleCompute}
            disabled={loading}
            className="mt-4 w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-extrabold shadow-md shadow-blue-600/20 transition-all disabled:opacity-40 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Generate Stability Report
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >

              {/* Trend Summary */}
              <div className={cn(
                "bg-white border rounded-2xl p-5 shadow-sm flex items-start gap-4",
                result.trend.direction === "improving" ? "border-emerald-200" :
                result.trend.direction === "declining" ? "border-red-200" : "border-slate-200"
              )}>
                <div className={cn(
                  "p-3 rounded-xl border flex-shrink-0",
                  result.trend.direction === "improving" ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                  result.trend.direction === "declining" ? "bg-red-50 border-red-200 text-red-600" :
                  "bg-slate-100 border-slate-200 text-slate-600"
                )}>
                  {result.trend.direction === "improving" ? <TrendingDown className="w-6 h-6" /> :
                   result.trend.direction === "declining" ? <TrendingUp className="w-6 h-6" /> :
                   <Minus className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Stability Trend: <span className="capitalize">{result.trend.direction}</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">{result.trend.label}</p>
                  <div className="flex gap-4 mt-3 text-xs">
                    <div><span className="text-slate-500">Avg breaking / release: </span><strong>{result.trend.avgBreakingPerRelease}</strong></div>
                    <div><span className="text-slate-500">Total breaking: </span><strong>{result.trend.totalBreaking}</strong></div>
                    <div><span className="text-slate-500">Avg release cadence: </span><strong>{result.trend.releaseFrequencyMonths} mo</strong></div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-x-auto">
                <h2 className="text-sm font-bold text-slate-900 mb-5">Release Timeline</h2>
                <div className="flex items-start gap-0 min-w-max">
                  {result.versions.map((v, i) => (
                    <div key={v.name} className="flex items-start">
                      <div className="flex flex-col items-center gap-2 w-36">
                        {/* Node */}
                        <div className={cn(
                          "w-11 h-11 rounded-full border-2 flex items-center justify-center text-xs font-extrabold",
                          v.statusBadge === "stable" ? "bg-emerald-100 border-emerald-400 text-emerald-800" :
                          v.statusBadge === "risky" ? "bg-amber-100 border-amber-400 text-amber-800" :
                          "bg-red-100 border-red-500 text-red-800"
                        )}>
                          {i + 1}
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">{v.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(v.releaseDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                        <span className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border", BADGE_STYLES[v.statusBadge])}>
                          {BADGE_ICON[v.statusBadge]}
                          {v.statusBadge.toUpperCase()}
                        </span>
                        <div className="text-[10px] text-slate-600 text-center space-y-0.5">
                          <div>Breaking: <strong>{v.breakingChanges}</strong></div>
                          <div>Safe: <strong>{v.safeChanges}</strong></div>
                          <div>Endpoints: <strong>{v.totalEndpoints}</strong></div>
                          {v.migrationSuccessRate !== null && (
                            <div>Migration: <strong>{v.migrationSuccessRate}%</strong></div>
                          )}
                        </div>
                      </div>
                      {/* Connector */}
                      {i < result.versions.length - 1 && (
                        <div className="flex items-center self-start mt-5">
                          <div className="w-8 h-0.5 bg-slate-300" />
                          <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-slate-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Breaking + Safe Trend */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 mb-4">Breaking vs Safe Changes Trend</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="Breaking" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Safe" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Endpoint Growth */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 mb-4">API Endpoint Growth</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                      />
                      <Bar dataKey="Endpoints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Benchmark Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-x-auto">
                <h2 className="text-sm font-bold text-slate-900 mb-4">Competitive Benchmark Comparison</h2>
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold pb-2 pr-4">Metric</th>
                      <th className="text-left text-[11px] uppercase tracking-wider text-blue-600 font-bold pb-2 pr-4">Your API</th>
                      <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold pb-2 pr-4">Stripe</th>
                      <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold pb-2 pr-4">Shopify</th>
                      <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold pb-2 pr-4">GitHub</th>
                      <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold pb-2">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.benchmarks.map((b) => (
                      <tr key={b.metric} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 pr-4 text-xs text-slate-700 font-medium">{b.metric}</td>
                        <td className="py-2.5 pr-4 text-xs font-bold text-blue-700">{b.yours}</td>
                        <td className="py-2.5 pr-4 text-xs text-slate-600">{b.stripe}</td>
                        <td className="py-2.5 pr-4 text-xs text-slate-600">{b.shopify}</td>
                        <td className="py-2.5 pr-4 text-xs text-slate-600">{b.github}</td>
                        <td className="py-2.5 text-xs text-slate-500 max-w-xs">{b.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Insights */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 mb-4">Strategic Insights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.insights.map((insight, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-4 rounded-xl border-l-4",
                        insight.positive
                          ? "bg-emerald-50 border-emerald-500"
                          : "bg-amber-50 border-amber-500"
                      )}
                    >
                      <h3 className={cn(
                        "text-xs font-bold mb-1",
                        insight.positive ? "text-emerald-900" : "text-amber-900"
                      )}>
                        {insight.title}
                      </h3>
                      <p className={cn("text-xs leading-relaxed", insight.positive ? "text-emerald-800" : "text-amber-800")}>
                        {insight.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

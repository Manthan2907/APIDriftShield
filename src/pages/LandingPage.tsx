import { Link } from "react-router-dom";
import { ArrowRight, Zap, ShieldCheck, GitCompare, History, FileJson, CheckCircle } from "lucide-react";
import shieldLogo from "@/assets/shield-logo.png";

const FEATURES = [
  {
    icon: GitCompare,
    title: "Deep API Diffing",
    desc: "Compares every path, method, parameter, schema, and auth requirement between two OpenAPI specs.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: ShieldCheck,
    title: "Breaking Change Detection",
    desc: "Automatically classifies every change as Breaking, Caution, or Safe — with confidence scores.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    desc: "Results in under 3 seconds. No servers, no accounts, no waiting. Runs entirely in your browser.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: History,
    title: "Analysis History",
    desc: "Every analysis is saved locally so you can compare across sessions and track API evolution.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: FileJson,
    title: "Export & Share",
    desc: "Download as JSON or copy as Markdown for GitHub PR descriptions, release notes, or tickets.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: CheckCircle,
    title: "Schema Evidence",
    desc: "Every detected change includes a side-by-side schema diff, test evidence, and recommendations.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Upload your specs", desc: "Upload or paste two OpenAPI 3.x JSON specs — v1 and v2. Or fetch directly from a GitHub URL." },
  { step: "02", title: "Automatic diff", desc: "The engine compares all endpoints, parameters, schemas, required fields, and auth changes." },
  { step: "03", title: "Classified results", desc: "Every change is labeled Breaking, Caution, or Safe with evidence, impact analysis, and recommendations." },
  { step: "04", title: "Export & act", desc: "Download a JSON report or copy as Markdown. Paste directly into your GitHub PR or release notes." },
];

const CHANGE_TYPES = [
  { label: "Removed endpoint", severity: "breaking" },
  { label: "Required field added", severity: "breaking" },
  { label: "Type changed", severity: "breaking" },
  { label: "Auth scheme changed", severity: "breaking" },
  { label: "Parameter removed", severity: "breaking" },
  { label: "Response code removed", severity: "caution" },
  { label: "Parameter type changed", severity: "caution" },
  { label: "New optional field", severity: "safe" },
  { label: "New endpoint added", severity: "safe" },
  { label: "New response code", severity: "safe" },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-100 border border-indigo-200 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Built for the Micro1 Frontier Engineering Challenge 2026
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-slate-900 leading-tight tracking-tight mb-6">
              Know exactly which
              <br />
              <span className="text-indigo-600">API changes will break</span>
              <br />
              your clients
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-xl">
              Upload two OpenAPI specs and get an instant, classified report of every breaking, cautionary, and safe change — with schema evidence and recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/analyze"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <Zap className="w-4 h-4" />
                Analyze your API now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
              >
                Learn how it works
              </Link>
            </div>
            <p className="text-xs text-slate-400 mt-4">No account required · Runs in your browser · OpenAPI 3.x</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: "87%", label: "F1 Score (vs 62% baseline)" },
              { value: "+25%", label: "Improvement over diff-only" },
              { value: "< 3s", label: "Analysis time" },
              { value: "13+", label: "Change types detected" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-slate-900 tabular-nums">{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything you need to ship safely</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              From raw spec comparison to classified, evidence-backed reports — all in one tool.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: 18, height: 18 }} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-[15px]">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How it works</h2>
            <p className="text-slate-500">Four steps from upload to actionable report</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-5xl font-bold text-slate-100 mb-3 tabular-nums leading-none">{step}</div>
                <h3 className="font-semibold text-slate-900 mb-2 text-[15px]">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Change types preview */}
      <section className="py-20 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Detects every class of API change</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                The rule-based classifier handles all common OpenAPI change patterns and correctly identifies which ones are breaking vs. backward-compatible.
              </p>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Try with your own specs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {CHANGE_TYPES.map(({ label, severity }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white">
                  <span className="text-sm text-slate-700">{label}</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    severity === "breaking" ? "bg-red-100 text-red-700"
                    : severity === "caution" ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src={shieldLogo} alt="DriftShield" className="w-12 h-12 rounded-lg mx-auto mb-6 object-cover" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to protect your API clients?</h2>
          <p className="text-indigo-200 mb-8 max-w-md mx-auto">
            Paste two OpenAPI specs and get your report in seconds. Free, private, no account needed.
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors text-sm"
          >
            <Zap className="w-4 h-4" />
            Open the analyzer
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={shieldLogo} alt="DriftShield" className="w-5 h-5 rounded object-cover" />
            <span className="text-xs text-slate-500">API DriftShield · Micro1 Frontier 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/analyze" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Analyzer</Link>
            <Link to="/history" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">History</Link>
            <Link to="/docs" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

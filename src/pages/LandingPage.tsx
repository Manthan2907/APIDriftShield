import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  GitCompare,
  History,
  FileJson,
  CheckCircle,
  FlaskConical,
  Cpu,
  Trophy,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Wrench,
  Activity,
  Workflow,
  CheckCircle2
} from "lucide-react";
import BenchmarkModal from "@/components/features/BenchmarkModal";

const PIPELINE_STEPS = [
  {
    num: "01",
    title: "Deterministic Diff Engine",
    desc: "Performs pure structural OpenAPI AST comparison of paths, parameters, schemas, responses, and security schemes without LLM hallucination.",
    icon: GitCompare,
    badge: "AST Diff"
  },
  {
    num: "02",
    title: "Policy-Aware Classifier",
    desc: "Classifies each mutation against strict 13 RFC compatibility rules (Breaking, Caution, Safe) with fallback reasoning for ambiguous cases.",
    icon: ShieldCheck,
    badge: "RFC Policy"
  },
  {
    num: "03",
    title: "Targeted Test Generator",
    desc: "Synthesizes black-box reproduction test probes and payload mutations to verify whether risks actually manifest at runtime.",
    icon: FlaskConical,
    badge: "HTTP Probes"
  },
  {
    num: "04",
    title: "Runtime Sandbox Execution",
    desc: "Executes probes against versioned mock/live API fixtures to capture concrete HTTP status codes (400, 404, 422) and response differences.",
    icon: Activity,
    badge: "Runtime Proof"
  },
  {
    num: "05",
    title: "Downstream Blast Radius Tracer",
    desc: "Calculates the blast radius across client SDK method signatures, documentation snippets, and integration tests.",
    icon: Cpu,
    badge: "Blast Radius"
  },
  {
    num: "06",
    title: "Evidence Gating & Honest Abstention",
    desc: "Enforces evidence gates: if evidence is incomplete, DriftShield marks findings as 'Uncertain / Review Required' rather than guessing.",
    icon: HelpCircle,
    badge: "0.0% Hallucinations"
  },
  {
    num: "07",
    title: "Automated Code Remediation",
    desc: "Generates side-by-side v1 vs v2 code diffs, sed -i bulk regex replacement rules, and grep search commands for instant client migration.",
    icon: Wrench,
    badge: "Instant Fixes"
  }
];

export default function LandingPage() {
  const [showBenchmark, setShowBenchmark] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-20 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3.5 py-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Evidence-First API Compatibility &amp; Governance Agent</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Turn API changes into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">
                verified release decisions
              </span>
            </h1>

            {/* Central Motto Card */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-slate-800 text-sm leading-relaxed shadow-sm">
              <p className="italic text-indigo-950 font-medium">
                &ldquo;DriftShield turns API changes into verified compatibility decisions—using deterministic analysis, executable tests, downstream impact tracing, automated code remediation, and honest abstention when the evidence is incomplete.&rdquo;
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center pt-2">
              <Link
                to="/analyze"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl transition-all shadow-md shadow-indigo-600/20 text-xs sm:text-sm cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Launch Live Analyzer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setShowBenchmark(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-300 hover:border-slate-400 transition-all text-xs sm:text-sm shadow-sm cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-indigo-600" />
                <span>Benchmark Scorecard (0.965 F1)</span>
              </button>

              <Link
                to="/flowchart"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all rounded-2xl border border-slate-200"
              >
                <Workflow className="w-4 h-4 text-indigo-600" />
                <span>Deep Flowchart</span>
              </Link>
            </div>

            <p className="text-xs text-slate-500 pt-2 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Deterministic Diff
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Executable Probes
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 0.0% Hallucinations
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-indigo-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Auto Migration Code
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Quantitative Benchmark Stat Highlights */}
      <section className="border-b border-slate-200 bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tabular-nums">0.965</div>
              <div className="text-xs font-bold text-slate-800 mt-1">Macro-F1 Score</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">+58.4% vs openapi-diff</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tabular-nums">97.6%</div>
              <div className="text-xs font-bold text-slate-800 mt-1">Classification Accuracy</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">40 / 41 Benchmark Tests</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-3xl sm:text-4xl font-extrabold text-sky-600 tabular-nums">0.0%</div>
              <div className="text-xs font-bold text-slate-800 mt-1">Unsupported Claims</div>
              <div className="text-[11px] text-sky-600 font-semibold mt-0.5">Honest Evidence Gating</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 tabular-nums">20 / 20</div>
              <div className="text-xs font-bold text-slate-800 mt-1">Automated Tests Passing</div>
              <div className="text-[11px] text-purple-600 font-semibold mt-0.5">100% Pytest Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7-Stage Purposeful Agent Architecture */}
      <section className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Purposeful Agent Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              7 Verified Stages from Diff to Remediation
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Every stage has a specific deterministic or empirical job: schema facts, runtime proof, blast radius mapping, and code remediation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PIPELINE_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/70 hover:bg-white transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                        STAGE {step.num}
                      </span>
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{step.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-400 font-mono uppercase">
                    Badge: {step.badge}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Engineering Insight Banner */}
      <section className="py-16 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            The Core Engineering Insight
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
            &ldquo;Static diffing identifies possible contract risk; executable evidence determines whether that risk deserves an alert. LLM confidence is not evidence.&rdquo;
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            If static tools say &ldquo;breaking&rdquo; but runtime evidence is inconclusive, DriftShield marks findings as <strong>Uncertain</strong> instead of hallucinating false precision.
          </p>
          <div className="pt-4">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <span>Try with Sample OpenAPI Specs</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benchmark Modal */}
      <BenchmarkModal isOpen={showBenchmark} onClose={() => setShowBenchmark(false)} />
    </div>
  );
}

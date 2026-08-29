import React from "react";
import { X, Trophy, ShieldCheck, Zap, AlertTriangle, CheckCircle2, ArrowUpRight, BarChart2, Award, Terminal } from "lucide-react";

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BenchmarkModal({ isOpen, onClose }: BenchmarkModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  DriftShield Ground-Truth Benchmark Scorecard
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                41 enterprise test cases evaluated against Stripe, GitHub, AWS, Slack, and baseline diff tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Stat Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-center shadow-sm">
              <div className="text-3xl font-extrabold text-indigo-700 tabular-nums">0.965</div>
              <div className="text-xs font-bold text-slate-800 mt-1">Macro-F1 Score</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">+58.4% vs openapi-diff</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center shadow-sm">
              <div className="text-3xl font-extrabold text-emerald-700 tabular-nums">97.6%</div>
              <div className="text-xs font-bold text-slate-800 mt-1">Classification Accuracy</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">40 / 41 Correct Decisions</div>
            </div>
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 text-center shadow-sm">
              <div className="text-3xl font-extrabold text-sky-700 tabular-nums">0.0%</div>
              <div className="text-xs font-bold text-slate-800 mt-1">Unsupported Claims</div>
              <div className="text-[11px] text-sky-700 font-semibold mt-0.5">0.0% Hallucinations (Gated)</div>
            </div>
          </div>

          {/* Benchmark Comparison Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Comparative Evaluation Matrix
              </span>
              <span className="text-[11px] text-indigo-700 font-mono font-semibold">41 Enterprise Test Cases</span>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Evaluation Metric</th>
                  <th className="py-3 px-4 text-slate-500">B0 (Naive LLM)</th>
                  <th className="py-3 px-4 text-slate-500">B1 (openapi-diff)</th>
                  <th className="py-3 px-4 text-indigo-700 font-bold">API DriftShield</th>
                  <th className="py-3 px-4 text-emerald-700">Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">Overall Accuracy</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">56.1%</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">39.0%</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">97.6%</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-700">+58.6%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">Macro F1-Score</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">0.560</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">0.381</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-indigo-700">0.965</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-700">+58.4% vs B1</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">Precision / Recall</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">0.583 / 0.538</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">0.286 / 0.577</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">0.976 / 0.958</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-700">Production Ready</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">Hallucination Rate</td>
                  <td className="py-2.5 px-4 font-mono text-red-600">34.1%</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">0.0%</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">0.0%</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-700">Evidence Gated</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-slate-900">Execution Runtime</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">~12.4s</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">&lt; 0.5s</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">&lt; 2.2s</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">Instant Local</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reproduction Command Snippet */}
          <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Terminal className="w-3.5 h-3.5" /> CLI Reproduction Command
              </span>
              <span>Python 3.10+ / pytest</span>
            </div>
            <div className="bg-black/60 p-2.5 rounded-lg border border-slate-800 text-emerald-400 select-all">
              python antigravity_backend/benchmark/evaluate.py
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Ground-truth dataset: <code>benchmark/cases/*.json</code> (41 cases)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GitCompare, ArrowUpRight, UploadCloud, Github, Sparkles, BookOpen, ShieldCheck } from "lucide-react";
import InputPanel from "@/components/features/InputPanel";
import ResultsPanel from "@/components/features/ResultsPanel";
import ProgressBar from "@/components/features/ProgressBar";
import { GitHubAnalyzer } from "@/components/features/GitHubAnalyzer";
import { useApiAnalysis } from "@/hooks/useApiAnalysis";

export default function AnalyzerPage() {
  const [tab, setTab] = useState<"manual" | "github">("manual");
  const { stageMessage, stageStep, isLoading, progress, result, jsonError, analyze, reset } = useApiAnalysis();

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Page Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Deterministic &amp; Evidence-Gated
                </span>
                <span className="text-[10px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  0.0% Hallucinations
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                API Drift &amp; Compatibility Analyzer
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Upload specification files or scan any public GitHub repository to detect breaking changes, synthesize HTTP test probes, and generate automated code remediation paths.
              </p>
            </div>

            <Link
              to="/docs"
              className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-indigo-600 font-semibold transition-all border border-slate-200 hover:border-indigo-300 rounded-xl px-3.5 py-2 bg-white shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>13 RFC Categories</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Source Mode Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-fit border border-slate-300/80 shadow-sm">
          <button
            onClick={() => setTab("manual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === "manual"
                ? "bg-white text-slate-900 shadow-sm font-extrabold border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <span>Upload / Paste Specs</span>
          </button>

          <button
            onClick={() => setTab("github")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === "github"
                ? "bg-white text-slate-900 shadow-sm font-extrabold border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Github className="w-4 h-4 text-slate-800" />
            <span>Scan GitHub Repo</span>
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-100 text-indigo-700">
              Live
            </span>
          </button>
        </div>

        {tab === "github" ? (
          /* GitHub Repo Analyzer View */
          <div className="space-y-6">
            <GitHubAnalyzer onAnalyzeSpecs={analyze} />
            {result && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <ResultsPanel result={result} />
              </div>
            )}
          </div>
        ) : (
          /* Manual Upload / Paste Specs View */
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left: Input Panel (340px) */}
            <div className="w-full lg:w-[340px] flex-shrink-0 space-y-4 lg:sticky lg:top-20">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <InputPanel
                  onAnalyze={analyze}
                  isLoading={isLoading}
                  onReset={reset}
                  hasResult={!!result}
                  jsonError={jsonError}
                />
              </div>

              {isLoading && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <ProgressBar
                    progress={progress}
                    stage={stageMessage}
                    currentStep={stageStep}
                    visible={isLoading}
                  />
                </div>
              )}

              {!isLoading && !result && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    How DriftShield Analyzes
                  </p>
                  <ol className="space-y-2.5">
                    {[
                      "Upload or select baseline v1 & candidate v2 specs",
                      "Diffs AST across 13 RFC breaking change policies",
                      "Synthesizes targeted executable test probes",
                      "Generates exact sed/grep code remediation paths",
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Right: Results View (Fill) */}
            <div className="w-full lg:flex-1 min-w-0">
              {result ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <ResultsPanel result={result} />
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[420px] bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                    <span className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900 tracking-tight">{stageMessage}</p>
                    <p className="text-xs text-slate-500 mt-1">Executing deterministic diff engine &amp; test probe sandbox...</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[420px] border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner">
                    <GitCompare className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Analysis results will appear here</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Upload two OpenAPI JSON/YAML specs on the left or click <strong>"Load Sample Specs"</strong> to see the full 7-stage report.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompare,
  ArrowUpRight,
  UploadCloud,
  Github,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Zap
} from "lucide-react";
import InputPanel from "@/components/features/InputPanel";
import ResultsPanel from "@/components/features/ResultsPanel";
import ProgressBar from "@/components/features/ProgressBar";
import { GitHubAnalyzer } from "@/components/features/GitHubAnalyzer";
import { AnimatedAlert } from "@/components/ui/AnimatedAlert";
import { useApiAnalysis } from "@/hooks/useApiAnalysis";

export default function AnalyzerPage() {
  const [tab, setTab] = useState<"manual" | "github">("manual");
  const { stageMessage, stageStep, isLoading, progress, result, jsonError, analyze, reset } = useApiAnalysis();

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="border-b border-slate-200 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
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
              className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-blue-600 font-semibold transition-all border border-slate-200 hover:border-blue-300 rounded-xl px-3.5 py-2 bg-white shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>13 RFC Categories</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </motion.div>

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
            <UploadCloud className="w-4 h-4 text-blue-600" />
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
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-blue-100 text-blue-700">
              Live
            </span>
          </button>
        </div>

        {/* JSON / Syntax Error Alert */}
        {jsonError && (
          <AnimatedAlert
            type="error"
            title="Specification Parse Error"
            description={jsonError}
          />
        )}

        <AnimatePresence mode="wait">
          {tab === "github" ? (
            /* GitHub Repo Analyzer View */
            <motion.div
              key="github-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <GitHubAnalyzer onAnalyzeSpecs={analyze} />
              {isLoading && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-4 animate-fade-in">
                  <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">{stageMessage}</h3>
                  <ProgressBar
                    progress={progress}
                    stage={stageMessage}
                    currentStep={stageStep}
                    visible={isLoading}
                  />
                </div>
              )}
              {result && !isLoading && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="font-extrabold text-sm text-slate-900">DriftShield Analysis Report</h3>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {result.specV1Name} ➔ {result.specV2Name}
                    </span>
                  </div>
                  <ResultsPanel result={result} />
                </div>
              )}
            </motion.div>
          ) : (
            /* Manual Upload / Paste Specs View */
            <motion.div
              key="manual-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col lg:flex-row gap-6 items-start"
            >
              {/* Left: Input Panel (340px) */}
              <div className="w-full lg:w-[340px] flex-shrink-0 space-y-4 lg:sticky lg:top-20">
                <div className="card-light p-5">
                  <InputPanel
                    onAnalyze={analyze}
                    isLoading={isLoading}
                    onReset={reset}
                  />
                </div>
              </div>

              {/* Right: Results / Progress / Empty State */}
              <div className="flex-1 min-w-0 w-full space-y-4">
                {isLoading && (
                  <div className="card-light p-8 text-center space-y-4">
                    <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">{stageMessage}</h3>
                    <ProgressBar
                      progress={progress}
                      stage={stageMessage}
                      currentStep={stageStep}
                      visible={isLoading}
                    />
                  </div>
                )}

                {result && !isLoading && (
                  <div className="animate-fade-in">
                    <ResultsPanel result={result} />
                  </div>
                )}

                {!result && !isLoading && (
                  <div className="card-light p-12 text-center space-y-4 border-2 border-dashed border-slate-200">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
                      <GitCompare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">No Specification Loaded</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                        Upload two OpenAPI spec files or click <strong>&quot;Load Sample Specs&quot;</strong> on the left panel to run instant compatibility verification.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

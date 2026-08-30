import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompare,
  ArrowUpRight,
  UploadCloud,
  Github,
  History,
  Trash2,
  RotateCcw,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap
} from "lucide-react";
import InputPanel from "@/components/features/InputPanel";
import ResultsPanel from "@/components/features/ResultsPanel";
import ProgressBar from "@/components/features/ProgressBar";
import { GitHubAnalyzer } from "@/components/features/GitHubAnalyzer";
import { AnimatedAlert } from "@/components/ui/AnimatedAlert";
import { useApiAnalysis } from "@/hooks/useApiAnalysis";
import { getHistory, clearHistory, deleteEntry } from "@/lib/history";
import { HistoryEntry, AnalysisResult } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AnalyzerPage() {
  const [tab, setTab] = useState<"manual" | "github" | "history">("manual");
  const { stageMessage, stageStep, isLoading, progress, result, setResult, jsonError, analyze, reset } = useApiAnalysis();
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  // Refresh history entries
  const refreshHistory = () => {
    setHistoryEntries(getHistory());
  };

  useEffect(() => {
    refreshHistory();
  }, [result]);

  const handleSelectHistory = (historicalResult: AnalysisResult) => {
    setResult(historicalResult);
    toast.success(`Loaded history snapshot: ${historicalResult.specV1Name} ➔ ${historicalResult.specV2Name}`);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteEntry(id);
    refreshHistory();
    toast.info("History entry removed");
  };

  const handleClearAllHistory = () => {
    clearHistory();
    refreshHistory();
    toast.info("All history cleared");
  };

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
                Upload specification files, scan any public GitHub repository, or inspect cached run history to detect breaking changes and generate automated code remediation paths.
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
        <div className="flex items-center justify-between flex-wrap gap-3">
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

            <button
              onClick={() => setTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === "history"
                  ? "bg-white text-slate-900 shadow-sm font-extrabold border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span>Run History</span>
              {historyEntries.length > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-extrabold rounded-full bg-indigo-100 text-indigo-700">
                  {historyEntries.length}
                </span>
              )}
            </button>
          </div>

          {result && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Current Run</span>
            </button>
          )}
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
          {tab === "history" ? (
            /* Full History View inside Analyze Page */
            <motion.div
              key="history-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 flex-wrap gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-600" />
                      Saved Analysis Run History
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select any previously analyzed specification run to immediately reload its metrics, diffs, and AI prompts.
                    </p>
                  </div>
                  {historyEntries.length > 0 && (
                    <button
                      onClick={handleClearAllHistory}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors border border-slate-200 hover:border-red-300 rounded-xl px-3 py-1.5 bg-white shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All History</span>
                    </button>
                  )}
                </div>

                {historyEntries.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600 shadow-xs">
                      <History className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No Saved Runs Yet</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Runs executed via the Upload Specs or Scan GitHub tabs are automatically saved here for quick reloading.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {historyEntries.map((entry) => {
                      const isBlocked = entry.summary.breaking > 0;
                      return (
                        <div
                          key={entry.id}
                          onClick={() => {
                            handleSelectHistory(entry.result);
                            setTab("manual");
                          }}
                          className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/60 hover:bg-indigo-50/30 transition-all cursor-pointer shadow-xs space-y-3 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={cn(
                                "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase font-mono border",
                                isBlocked
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              )}
                            >
                              {isBlocked ? `${entry.summary.breaking} Breaking` : "All Safe"}
                            </span>
                            <button
                              onClick={(e) => handleDeleteHistory(entry.id, e)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <div className="text-xs font-bold text-slate-900 font-mono truncate">
                              {entry.v1Name} ➔ {entry.v2Name}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{new Date(entry.analyzedAt).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px]">
                            <span className="text-slate-600">
                              {entry.summary.total} mutations ({entry.summary.impactScore}% blast)
                            </span>
                            <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Load</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {result && !isLoading && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-extrabold text-sm text-slate-900">Active Loaded Historical Snapshot</h3>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {result.specV1Name} ➔ {result.specV2Name}
                    </span>
                  </div>
                  <ResultsPanel result={result} />
                </div>
              )}
            </motion.div>
          ) : tab === "github" ? (
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
              {/* Left: Input Panel & History Quick-Access Sidebar */}
              <div className="w-full lg:w-[340px] flex-shrink-0 space-y-4 lg:sticky lg:top-20">
                <div className="card-light p-5">
                  <InputPanel
                    onAnalyze={analyze}
                    isLoading={isLoading}
                    onReset={reset}
                    hasResult={!!result}
                    jsonError={jsonError}
                  />
                </div>

                {/* Side History Quick-Access Box */}
                {historyEntries.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Saved Run History</span>
                      </span>
                      <button
                        onClick={() => setTab("history")}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        View all ({historyEntries.length})
                      </button>
                    </div>

                    <div className="space-y-2">
                      {historyEntries.slice(0, 3).map((entry) => {
                        const isBlocked = entry.summary.breaking > 0;
                        return (
                          <button
                            key={entry.id}
                            onClick={() => handleSelectHistory(entry.result)}
                            className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all flex items-center justify-between gap-2 cursor-pointer group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-bold text-slate-900 font-mono truncate">
                                {entry.v1Name} ➔ {entry.v2Name}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {isBlocked ? `${entry.summary.breaking} Breaking` : "All Safe"} &bull; {new Date(entry.analyzedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                        Upload two OpenAPI spec files, pick a saved run from the history on the left, or click <strong>&quot;Load Sample Specs&quot;</strong> to run instant compatibility verification.
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

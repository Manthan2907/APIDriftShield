import { Link } from "react-router-dom";
import { GitCompare, ArrowUpRight } from "lucide-react";
import InputPanel from "@/components/features/InputPanel";
import ResultsPanel from "@/components/features/ResultsPanel";
import ProgressBar from "@/components/features/ProgressBar";
import { useApiAnalysis } from "@/hooks/useApiAnalysis";

export default function AnalyzerPage() {
  const { stageMessage, stageStep, isLoading, progress, result, jsonError, analyze, reset } = useApiAnalysis();

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">API Change Analyzer</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Upload or paste two OpenAPI 3.x specs to detect breaking changes instantly.
              </p>
            </div>
            <Link
              to="/docs"
              className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors border border-indigo-200 hover:border-indigo-300 rounded-md px-3 py-1.5 bg-indigo-50 flex-shrink-0"
            >
              <GitCompare className="w-3.5 h-3.5" />
              View docs
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Input (30%) */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-4 lg:sticky lg:top-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <InputPanel
                onAnalyze={analyze}
                isLoading={isLoading}
                onReset={reset}
                hasResult={!!result}
                jsonError={jsonError}
              />
            </div>

            {isLoading && (
              <ProgressBar
                progress={progress}
                stage={stageMessage}
                currentStep={stageStep}
                visible={isLoading}
              />
            )}

            {!isLoading && !result && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">How it works</p>
                <ol className="space-y-2.5">
                  {[
                    "Upload or paste your v1 and v2 OpenAPI 3.x specs",
                    "The engine diffs all paths, methods, schemas, and auth",
                    "Changes are classified: Breaking · Caution · Safe",
                    "Review evidence and download the full report",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Right: Results (70%) */}
          <div className="w-full lg:flex-1 min-w-0">
            {result ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <ResultsPanel result={result} />
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[360px] bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-slate-700">{stageMessage}</p>
                <p className="text-xs text-slate-400 mt-1">Scanning endpoints and schemas...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[360px] border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                  <GitCompare className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">Analysis results will appear here</p>
                <p className="text-xs text-slate-400 mt-1">Upload your specs and click Analyze</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

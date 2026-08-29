import { useState } from "react";
import { Clock, Trash2, ArrowRight, BarChart3, RotateCcw, GitCompare } from "lucide-react";
import { getHistory, clearHistory, deleteEntry } from "@/lib/history";
import { HistoryEntry, AnalysisResult } from "@/types";
import ResultsPanel from "@/components/features/ResultsPanel";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistory());
  const [viewing, setViewing] = useState<AnalysisResult | null>(null);

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setEntries(getHistory());
    if (viewing?.id === id) setViewing(null);
  };

  const handleClearAll = () => {
    clearHistory();
    setEntries([]);
    setViewing(null);
  };

  if (entries.length === 0) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="text-center py-20 px-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto mb-4 shadow-sm text-indigo-600">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">No Analysis History Yet</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Run an analysis on your OpenAPI specifications or GitHub repository and results will be saved here automatically for local review.
          </p>
          <a
            href="/analyze"
            className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-600/20"
          >
            <span>Open API Analyzer</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Analysis History</h1>
            <p className="text-xs text-slate-500 mt-1">
              {entries.length} saved historical run{entries.length !== 1 ? "s" : ""} cached locally
            </p>
          </div>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors border border-slate-200 hover:border-red-300 rounded-xl px-3.5 py-2 bg-white shadow-sm cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar List */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-2.5">
            {entries.map((entry) => (
              <HistoryCard
                key={entry.id}
                entry={entry}
                active={viewing?.id === entry.id}
                onClick={() => setViewing(entry.result)}
                onDelete={() => handleDelete(entry.id)}
              />
            ))}
          </div>

          {/* Detail Panel */}
          <div className="flex-1 min-w-0 w-full">
            {viewing ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-xs text-slate-500">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Viewing saved snapshot from {new Date(viewing.analyzedAt).toLocaleString()}</span>
                </div>
                <ResultsPanel result={viewing} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[380px] border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <GitCompare className="w-7 h-7 text-indigo-600" />
                </div>
                <p className="text-sm font-bold text-slate-900">Select a historical run to view details</p>
                <p className="text-xs text-slate-500 mt-1">
                  Compare historical blast radius, runtime test probes, and migration paths.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryCard({
  entry,
  active,
  onClick,
  onDelete
}: {
  entry: HistoryEntry;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const { summary } = entry.result;
  const isBlocked = summary.breaking > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl border transition-all cursor-pointer text-left relative group",
        active
          ? "bg-indigo-50/70 border-indigo-400 shadow-sm"
          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={cn(
                "text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase font-mono border",
                isBlocked
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}
            >
              {isBlocked ? `${summary.breaking} Breaking` : "All Safe"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date(entry.timestamp).toLocaleDateString()}
            </span>
          </div>

          <p className="text-xs font-bold text-slate-900 truncate font-mono">
            {entry.v1Name} ➔ {entry.v2Name}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
            <span className="text-red-700 font-bold">🔴 {summary.breaking}</span>
            <span className="text-amber-700 font-bold">🟡 {summary.caution}</span>
            <span className="text-emerald-700 font-bold">🟢 {summary.safe}</span>
            <span className="ml-auto font-mono font-semibold text-indigo-700">{summary.impactScore}% Blast</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-slate-400 hover:text-red-600 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
          title="Delete entry"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

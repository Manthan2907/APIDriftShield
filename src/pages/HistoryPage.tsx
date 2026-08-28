import { useState } from "react";
import { Clock, Trash2, ArrowRight, BarChart3, RotateCcw } from "lucide-react";
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
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center">
        <div className="text-center py-20 px-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No analysis history yet</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
            Once you analyze API specs, results are automatically saved here for future reference.
          </p>
          <a
            href="/analyze"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Go to the Analyzer <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analysis History</h1>
            <p className="text-sm text-slate-500 mt-0.5">{entries.length} saved analysis{entries.length !== 1 ? "es" : ""}</p>
          </div>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors border border-slate-200 hover:border-red-200 rounded-md px-3 py-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar list */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-2">
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

          {/* Detail panel */}
          <div className="flex-1 min-w-0">
            {viewing ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    Viewing saved analysis from {new Date(viewing.analyzedAt).toLocaleString()}
                  </span>
                </div>
                <ResultsPanel result={viewing} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Select an analysis to view details</p>
                </div>
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
  onDelete,
}: {
  entry: HistoryEntry;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const { breaking, caution, safe } = entry.summary;
  const date = new Date(entry.analyzedAt);

  return (
    <div
      className={cn(
        "group relative rounded-lg border cursor-pointer transition-all p-3.5",
        active
          ? "border-indigo-300 bg-indigo-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">{entry.v1Name}</p>
          <p className="text-[11px] text-slate-400 truncate">→ {entry.v2Name}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 p-0.5 flex-shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="flex items-center gap-3 mt-2.5">
        {breaking > 0 && <Chip count={breaking} color="red" label="B" />}
        {caution > 0 && <Chip count={caution} color="amber" label="C" />}
        {safe > 0 && <Chip count={safe} color="emerald" label="S" />}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Clock className="w-3 h-3 text-slate-300" />
        <span className="text-[11px] text-slate-400">{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}

function Chip({ count, color, label }: { count: number; color: string; label: string }) {
  const cls = {
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
  }[color] ?? "";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls}`}>
      {label} {count}
    </span>
  );
}

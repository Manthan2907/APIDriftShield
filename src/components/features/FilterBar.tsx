import { cn } from "@/lib/utils";
import { Severity } from "@/types";

type SeverityFilter = "all" | Severity;
type MethodFilter = "all" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FilterBarProps {
  active: SeverityFilter;
  onChange: (f: SeverityFilter) => void;
  counts: { all: number; breaking: number; caution: number; safe: number };
  methodFilter: MethodFilter;
  onMethodChange: (m: MethodFilter) => void;
}

const SEVERITY_FILTERS: { value: SeverityFilter; label: string; active: string }[] = [
  { value: "all", label: "All Changes", active: "bg-indigo-600 text-white shadow-sm font-bold border-indigo-600" },
  {
    value: "breaking",
    label: "Breaking",
    active: "bg-red-600 text-white shadow-sm font-bold border-red-600"
  },
  {
    value: "caution",
    label: "Caution & Review",
    active: "bg-amber-500 text-white shadow-sm font-bold border-amber-500"
  },
  {
    value: "safe",
    label: "Safe",
    active: "bg-emerald-600 text-white shadow-sm font-bold border-emerald-600"
  }
];

const METHODS: MethodFilter[] = ["all", "GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-blue-700 bg-blue-50 border-blue-200",
  POST: "text-emerald-700 bg-emerald-50 border-emerald-200",
  PUT: "text-amber-700 bg-amber-50 border-amber-200",
  PATCH: "text-purple-700 bg-purple-50 border-purple-200",
  DELETE: "text-red-700 bg-red-50 border-red-200"
};

export default function FilterBar({ active, onChange, counts, methodFilter, onMethodChange }: FilterBarProps) {
  return (
    <div className="space-y-2.5 font-sans">
      {/* Severity filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {SEVERITY_FILTERS.map(({ value, label, active: activeStyle }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 cursor-pointer border",
              active === value
                ? activeStyle
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border-slate-200"
            )}
          >
            <span>{label}</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold tabular-nums",
                active === value ? "bg-black/20 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
              )}
            >
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      {/* Method filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-500 font-semibold mr-1">HTTP Verb:</span>
        {METHODS.map((m) => (
          <button
            key={m}
            onClick={() => onMethodChange(m)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all duration-150 border cursor-pointer",
              methodFilter === m
                ? m === "all"
                  ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                  : cn(METHOD_COLORS[m], "shadow-sm")
                : "text-slate-500 bg-white border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

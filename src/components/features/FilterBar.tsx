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
  { value: "all", label: "All", active: "bg-slate-900 text-white" },
  { value: "breaking", label: "Breaking", active: "bg-red-100 text-red-700 border border-red-200" },
  { value: "caution", label: "Caution", active: "bg-amber-100 text-amber-700 border border-amber-200" },
  { value: "safe", label: "Safe", active: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
];

const METHODS: MethodFilter[] = ["all", "GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-blue-700 bg-blue-50 border-blue-200",
  POST: "text-emerald-700 bg-emerald-50 border-emerald-200",
  PUT: "text-amber-700 bg-amber-50 border-amber-200",
  PATCH: "text-violet-700 bg-violet-50 border-violet-200",
  DELETE: "text-red-700 bg-red-50 border-red-200",
};

export default function FilterBar({ active, onChange, counts, methodFilter, onMethodChange }: FilterBarProps) {
  return (
    <div className="space-y-2">
      {/* Severity filters */}
      <div className="flex items-center gap-1 flex-wrap">
        {SEVERITY_FILTERS.map(({ value, label, active: activeStyle }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all duration-150",
              active === value
                ? activeStyle
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 bg-white border border-slate-200"
            )}
          >
            {label}
            <span className={cn(
              "text-[11px] px-1.5 py-0.5 rounded font-mono tabular-nums",
              active === value ? "bg-black/10" : "bg-slate-100 text-slate-500"
            )}>
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      {/* Method filters */}
      <div className="flex items-center gap-1 flex-wrap">
        {METHODS.map((m) => (
          <button
            key={m}
            onClick={() => onMethodChange(m)}
            className={cn(
              "px-2.5 py-0.5 rounded text-[11px] font-bold transition-all duration-150 border",
              methodFilter === m
                ? m === "all"
                  ? "bg-slate-800 text-white border-slate-800"
                  : cn(METHOD_COLORS[m], "border")
                : "text-slate-400 bg-white border-slate-200 hover:bg-slate-50"
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

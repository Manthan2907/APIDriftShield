import { motion } from "framer-motion";
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

const SEVERITY_FILTERS: { value: SeverityFilter; label: string; dot: string; activeStyle: string }[] = [
  {
    value: "all",
    label: "All Changes",
    dot: "bg-blue-600",
    activeStyle: "bg-blue-600 text-white border-blue-600 shadow-sm",
  },
  {
    value: "breaking",
    label: "Breaking",
    dot: "bg-red-500",
    activeStyle: "bg-red-600 text-white border-red-600 shadow-sm",
  },
  {
    value: "caution",
    label: "Caution",
    dot: "bg-amber-500",
    activeStyle: "bg-amber-500 text-white border-amber-500 shadow-sm",
  },
  {
    value: "safe",
    label: "Safe",
    dot: "bg-emerald-500",
    activeStyle: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
  },
];

const METHODS: MethodFilter[] = ["all", "GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-blue-700 bg-blue-50 border-blue-200",
  POST: "text-emerald-700 bg-emerald-50 border-emerald-200",
  PUT: "text-amber-700 bg-amber-50 border-amber-200",
  PATCH: "text-purple-700 bg-purple-50 border-purple-200",
  DELETE: "text-red-700 bg-red-50 border-red-200",
};

export default function FilterBar({ active, onChange, counts, methodFilter, onMethodChange }: FilterBarProps) {
  return (
    <div className="space-y-2.5 font-sans">
      {/* Severity badge filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {SEVERITY_FILTERS.map(({ value, label, dot, activeStyle }) => (
          <motion.button
            key={value}
            onClick={() => onChange(value)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer border",
              active === value
                ? activeStyle
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border-slate-200"
            )}
          >
            {active !== value && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} />}
            <span>{label}</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold tabular-nums",
                active === value ? "bg-black/20 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
              )}
            >
              {counts[value]}
            </span>
          </motion.button>
        ))}
      </div>

      {/* HTTP Method filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-500 font-semibold mr-1">HTTP Verb:</span>
        {METHODS.map((m) => (
          <motion.button
            key={m}
            onClick={() => onMethodChange(m)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all duration-150 border cursor-pointer",
              methodFilter === m
                ? m === "all"
                  ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                  : cn(METHOD_COLORS[m], "shadow-xs font-extrabold")
                : "text-slate-500 bg-white border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {m}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

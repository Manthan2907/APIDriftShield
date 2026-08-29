import { ShieldX, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import { AnalysisResult } from "@/types";
import { cn } from "@/lib/utils";

export default function SummaryCards({ result }: { result: AnalysisResult }) {
  const { breaking, caution, safe, total, impactScore } = result.summary;

  const cards = [
    {
      label: "Breaking Changes",
      value: breaking,
      icon: ShieldX,
      cls: "border-red-200 bg-red-50/70",
      iconCls: "text-red-600",
      valCls: "text-red-700"
    },
    {
      label: "Caution & Review",
      value: caution,
      icon: AlertTriangle,
      cls: "border-amber-200 bg-amber-50/70",
      iconCls: "text-amber-600",
      valCls: "text-amber-700"
    },
    {
      label: "Safe Additions",
      value: safe,
      icon: ShieldCheck,
      cls: "border-emerald-200 bg-emerald-50/70",
      iconCls: "text-emerald-600",
      valCls: "text-emerald-700"
    },
    {
      label: "Blast Radius Score",
      value: `${impactScore}%`,
      icon: Activity,
      cls:
        impactScore >= 70
          ? "border-red-200 bg-red-50/70"
          : impactScore >= 40
          ? "border-amber-200 bg-amber-50/70"
          : "border-indigo-200 bg-indigo-50/70",
      iconCls: impactScore >= 70 ? "text-red-600" : impactScore >= 40 ? "text-amber-600" : "text-indigo-600",
      valCls: impactScore >= 70 ? "text-red-700" : impactScore >= 40 ? "text-amber-700" : "text-indigo-700"
    }
  ];

  return (
    <div className="space-y-3 font-sans">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(({ label, value, icon: Icon, cls, iconCls, valCls }) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl border p-4 flex flex-col items-center gap-1.5 shadow-sm transition-all hover:shadow-md bg-white",
              cls
            )}
          >
            <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <Icon className={cn("w-4 h-4", iconCls)} />
            </div>
            <span className={cn("text-2xl font-extrabold tabular-nums tracking-tight", valCls)}>{value}</span>
            <span className="text-[11px] text-slate-600 font-semibold">{label}</span>
          </div>
        ))}
      </div>

      {/* Breakdown Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Compatibility Severity Breakdown
          </span>
          <span className="text-[11px] text-indigo-700 font-mono font-bold">{total} Total Modifications</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden gap-1 bg-slate-100 border border-slate-200 p-0.5">
          {breaking > 0 && (
            <div
              className="bg-red-500 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${(breaking / Math.max(total, 1)) * 100}%` }}
              title={`${breaking} breaking`}
            />
          )}
          {caution > 0 && (
            <div
              className="bg-amber-500 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${(caution / Math.max(total, 1)) * 100}%` }}
              title={`${caution} caution`}
            />
          )}
          {safe > 0 && (
            <div
              className="bg-emerald-500 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${(safe / Math.max(total, 1)) * 100}%` }}
              title={`${safe} safe`}
            />
          )}
        </div>
        <div className="flex items-center gap-4 mt-2.5 flex-wrap">
          {[
            { l: "Breaking (Blockers)", c: "bg-red-500", v: breaking },
            { l: "Caution (Abstentions)", c: "bg-amber-500", v: caution },
            { l: "Safe (Additive)", c: "bg-emerald-500", v: safe }
          ].map(({ l, c, v }) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full flex-shrink-0", c)} />
              <span className="text-xs text-slate-600">
                {l}: <span className="text-slate-900 font-bold font-mono">{v}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

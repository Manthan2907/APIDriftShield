import { ShieldX, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import { AnalysisResult } from "@/types";
import { cn } from "@/lib/utils";

export default function SummaryCards({ result }: { result: AnalysisResult }) {
  const { breaking, caution, safe, total, impactScore } = result.summary;

  const cards = [
    { label: "Breaking", value: breaking, icon: ShieldX, cls: "border-red-200 bg-red-50", iconCls: "text-red-500", valCls: "text-red-700" },
    { label: "Caution",  value: caution,  icon: AlertTriangle, cls: "border-amber-200 bg-amber-50", iconCls: "text-amber-500", valCls: "text-amber-700" },
    { label: "Safe",     value: safe,     icon: ShieldCheck, cls: "border-emerald-200 bg-emerald-50", iconCls: "text-emerald-500", valCls: "text-emerald-700" },
    {
      label: "Impact",
      value: `${impactScore}%`,
      icon: Activity,
      cls: impactScore >= 70 ? "border-red-200 bg-red-50" : impactScore >= 40 ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50",
      iconCls: impactScore >= 70 ? "text-red-500" : impactScore >= 40 ? "text-amber-500" : "text-emerald-500",
      valCls: impactScore >= 70 ? "text-red-700" : impactScore >= 40 ? "text-amber-700" : "text-emerald-700",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(({ label, value, icon: Icon, cls, iconCls, valCls }) => (
          <div key={label} className={cn("rounded-lg border p-4 flex flex-col items-center gap-1.5", cls)}>
            <Icon className={cn("w-4 h-4", iconCls)} />
            <span className={cn("text-2xl font-bold tabular-nums", valCls)}>{value}</span>
            <span className="text-xs text-slate-500 font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Breakdown bar */}
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Severity breakdown</span>
          <span className="text-[11px] text-slate-400">{total} total</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5 bg-slate-100">
          {breaking > 0 && <div className="bg-red-400 rounded-full transition-all duration-700" style={{ width: `${(breaking / total) * 100}%` }} title={`${breaking} breaking`} />}
          {caution > 0 && <div className="bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${(caution / total) * 100}%` }} title={`${caution} caution`} />}
          {safe > 0 && <div className="bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${(safe / total) * 100}%` }} title={`${safe} safe`} />}
        </div>
        <div className="flex items-center gap-4 mt-2">
          {[{ l: "Breaking", c: "bg-red-400", v: breaking }, { l: "Caution", c: "bg-amber-400", v: caution }, { l: "Safe", c: "bg-emerald-400", v: safe }].map(({ l, c, v }) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full flex-shrink-0", c)} />
              <span className="text-[11px] text-slate-500">{l}: <span className="text-slate-700 font-semibold">{v}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

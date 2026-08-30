import { motion } from "framer-motion";
import { ShieldX, ShieldCheck, AlertTriangle, Activity, TrendingUp } from "lucide-react";
import { AnalysisResult } from "@/types";
import { cn } from "@/lib/utils";

export default function SummaryCards({ result }: { result: AnalysisResult }) {
  const { breaking, caution, safe, total, impactScore } = result.summary;

  const cards = [
    {
      label: "Breaking Changes",
      value: breaking,
      icon: ShieldX,
      bg: "bg-red-50",
      border: "border-red-200",
      iconBg: "bg-red-100 text-red-600 border-red-200",
      valCls: "text-red-700",
      badge: breaking > 0 ? "BLOCKERS" : "NONE",
      badgeCls: breaking > 0 ? "bg-red-100 text-red-700 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    {
      label: "Caution & Review",
      value: caution,
      icon: AlertTriangle,
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconBg: "bg-amber-100 text-amber-600 border-amber-200",
      valCls: "text-amber-700",
      badge: "REVIEW",
      badgeCls: "bg-amber-100 text-amber-700 border-amber-200",
    },
    {
      label: "Safe Additions",
      value: safe,
      icon: ShieldCheck,
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-600 border-emerald-200",
      valCls: "text-emerald-700",
      badge: "ADDITIVE",
      badgeCls: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    {
      label: "Blast Radius",
      value: `${impactScore}%`,
      icon: impactScore >= 70 ? Activity : TrendingUp,
      bg: impactScore >= 70 ? "bg-red-50" : impactScore >= 40 ? "bg-amber-50" : "bg-blue-50",
      border: impactScore >= 70 ? "border-red-200" : impactScore >= 40 ? "border-amber-200" : "border-blue-200",
      iconBg: impactScore >= 70
        ? "bg-red-100 text-red-600 border-red-200"
        : impactScore >= 40
        ? "bg-amber-100 text-amber-600 border-amber-200"
        : "bg-blue-100 text-blue-600 border-blue-200",
      valCls: impactScore >= 70 ? "text-red-700" : impactScore >= 40 ? "text-amber-700" : "text-blue-700",
      badge: impactScore >= 70 ? "HIGH RISK" : impactScore >= 40 ? "MEDIUM" : "LOW",
      badgeCls: impactScore >= 70
        ? "bg-red-100 text-red-700 border-red-200"
        : impactScore >= 40
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-blue-100 text-blue-700 border-blue-200",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
    hover: { y: -3, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.10)", transition: { duration: 0.2 } },
  };

  return (
    <div className="space-y-3 font-sans">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {cards.map(({ label, value, icon: Icon, bg, border, iconBg, valCls, badge, badgeCls }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            whileHover="hover"
            className={cn(
              "rounded-2xl border p-4 flex flex-col items-start gap-2 bg-white cursor-default transition-colors",
              border,
              bg
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div className={cn("p-2 rounded-xl border", iconBg)}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={cn("text-[9px] uppercase font-extrabold font-mono px-1.5 py-0.5 rounded-full border", badgeCls)}>
                {badge}
              </span>
            </div>
            <div>
              <span className={cn("text-2xl font-extrabold tabular-nums tracking-tight block", valCls)}>
                {value}
              </span>
              <span className="text-[11px] text-slate-600 font-semibold">{label}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Animated Breakdown Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Compatibility Severity Breakdown
          </span>
          <span className="text-[11px] text-blue-700 font-mono font-bold">{total} Total Modifications</span>
        </div>

        {/* Animated segmented bar */}
        <div className="h-3 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex gap-0.5 p-0.5">
          {breaking > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(breaking / Math.max(total, 1)) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="bg-red-500 rounded-full h-full shadow-xs"
              title={`${breaking} breaking`}
            />
          )}
          {caution > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(caution / Math.max(total, 1)) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="bg-amber-500 rounded-full h-full shadow-xs"
              title={`${caution} caution`}
            />
          )}
          {safe > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(safe / Math.max(total, 1)) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="bg-emerald-500 rounded-full h-full shadow-xs"
              title={`${safe} safe`}
            />
          )}
        </div>

        <div className="flex items-center gap-4 mt-2.5 flex-wrap">
          {[
            { l: "Breaking (Blockers)", c: "bg-red-500", v: breaking },
            { l: "Caution (Review)", c: "bg-amber-500", v: caution },
            { l: "Safe (Additive)", c: "bg-emerald-500", v: safe },
          ].map(({ l, c, v }) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full flex-shrink-0", c)} />
              <span className="text-xs text-slate-600">
                {l}: <span className="text-slate-900 font-bold font-mono">{v}</span>
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

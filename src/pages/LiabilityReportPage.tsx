import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Users,
  Clock,
  Shield,
  Download,
  Loader2,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Presentation,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { calculateLiability, LiabilityInput, LiabilityResult, MitigationStrategy } from "@/lib/liabilityReport";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  "$" +
  Math.round(n).toLocaleString("en-US");

const pct = (n: number) => `${Math.round(n)}%`;

const STATUS_CONFIG = {
  green: {
    label: "RELEASE READY",
    sub: "Financial risk is within acceptable bounds.",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  yellow: {
    label: "MITIGATE FIRST",
    sub: "Significant financial exposure — implement mitigations before release.",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    dot: "bg-amber-400",
    icon: AlertTriangle,
  },
  red: {
    label: "HIGH RISK — DELAY RELEASE",
    sub: "Substantial financial liability. Do not release without full mitigation plan.",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800 border-red-300",
    dot: "bg-red-500",
    icon: TrendingDown,
  },
};

const PRIORITY_CONFIG = {
  high: { color: "bg-red-100 text-red-700 border-red-200", label: "High Priority" },
  medium: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Medium Priority" },
  low: { color: "bg-slate-100 text-slate-600 border-slate-200", label: "Low Priority" },
};

// ─── Custom Tooltip for Recharts ──────────────────────────────────────────────

const CurrencyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
        <p className="font-bold text-slate-900 mb-1">{label || payload[0].name}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || p.fill }} className="font-mono font-semibold">
            {p.name}: {fmt(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Input Form ───────────────────────────────────────────────────────────────

import { getHistory } from "@/lib/history";
import { Link } from "react-router-dom";
import { Sparkles, History, Github } from "lucide-react";

interface FormState {
  api_name: string;
  v1_name: string;
  v2_name: string;
  total_breaking_changes: string;
  total_customers: string;
  avg_customer_arr: string;
  historical_churn_rate: string;
  avg_support_ticket_cost: string;
  expected_migration_time_hours: string;
  enterprise_customer_count: string;
  enterprise_avg_arr: string;
  auth_change_severity: "none" | "minor" | "moderate" | "major";
}

const DEFAULT_FORM: FormState = {
  api_name: "User & Payment API",
  v1_name: "v1.0",
  v2_name: "v2.0",
  total_breaking_changes: "3",
  total_customers: "500",
  avg_customer_arr: "20000",
  historical_churn_rate: "2.5",
  avg_support_ticket_cost: "150",
  expected_migration_time_hours: "4",
  enterprise_customer_count: "25",
  enterprise_avg_arr: "100000",
  auth_change_severity: "none",
};

const PRESETS = {
  saas: {
    label: "SaaS Scale ($20k ARR)",
    api_name: "Stripe-Style Payments API",
    total_breaking_changes: "3",
    total_customers: "500",
    avg_customer_arr: "20000",
    historical_churn_rate: "2.5",
    enterprise_customer_count: "35",
    enterprise_avg_arr: "100000",
    auth_change_severity: "minor" as const,
  },
  fintech: {
    label: "Enterprise FinTech ($100k ARR)",
    api_name: "Core Banking Ledger API",
    total_breaking_changes: "4",
    total_customers: "120",
    avg_customer_arr: "100000",
    historical_churn_rate: "1.8",
    enterprise_customer_count: "60",
    enterprise_avg_arr: "250000",
    auth_change_severity: "moderate" as const,
  },
  developer: {
    label: "Public Dev Platform ($5k ARR)",
    api_name: "Cloud Infrastructure API",
    total_breaking_changes: "2",
    total_customers: "2500",
    avg_customer_arr: "5000",
    historical_churn_rate: "3.2",
    enterprise_customer_count: "15",
    enterprise_avg_arr: "50000",
    auth_change_severity: "none" as const,
  },
};

function InputForm({
  form,
  onChange,
  onSubmit,
  isLoading,
}: {
  form: FormState;
  onChange: (f: Partial<FormState>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  const history = getHistory();
  const latestRun = history.length > 0 ? history[0] : null;

  const handleApplyHistory = () => {
    if (!latestRun) {
      toast.info("No prior analysis run found", {
        description: "Run an analysis in API Analyzer or Scan GitHub first.",
      });
      return;
    }
    const breaking = latestRun.summary.breaking;
    const authChange = latestRun.result.changes.some((c) =>
      c.type.includes("auth") || c.title.toLowerCase().includes("auth")
    )
      ? ("moderate" as const)
      : ("none" as const);

    onChange({
      api_name: `${latestRun.v1Name.replace(/\.[^/.]+$/, "")} API`,
      v1_name: latestRun.v1Name,
      v2_name: latestRun.v2Name,
      total_breaking_changes: String(breaking),
      auth_change_severity: authChange,
    });
    toast.success("Auto-filled from latest run analysis", {
      description: `Loaded ${breaking} breaking changes from ${latestRun.v1Name} ➔ ${latestRun.v2Name}`,
    });
  };

  const field = (
    id: keyof FormState,
    label: string,
    prefix?: string,
    suffix?: string,
    type: string = "number"
  ) => (
    <div>
      <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs text-slate-500 font-mono select-none">{prefix}</span>
        )}
        <input
          id={`liability-${id}`}
          type={type}
          value={form[id] as string}
          onChange={(e) => onChange({ [id]: e.target.value } as any)}
          className={cn(
            "w-full text-xs font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all",
            prefix && "pl-7",
            suffix && "pr-10"
          )}
        />
        {suffix && (
          <span className="absolute right-3 text-xs text-slate-500 font-mono select-none">{suffix}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div>
        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-0.5">
          <DollarSign className="w-4 h-4 text-red-600" />
          Financial Input Parameters
        </h2>
        <p className="text-[11px] text-slate-500">
          Auto-fill from your recent spec scan or choose an industry preset.
        </p>
      </div>

      {/* 1-Click Loaders / Presets */}
      <div className="space-y-2 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>1-Click Presets</span>
          </span>
          {latestRun && (
            <button
              onClick={handleApplyHistory}
              className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <History className="w-3 h-3" />
              <span>Auto-Fill from Run</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => onChange(preset)}
              className="text-left px-3 py-2 rounded-xl text-[11px] font-bold border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/40 text-slate-700 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>{preset.label}</span>
              <span className="text-[10px] font-mono text-slate-400">Apply</span>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <Link
            to="/analyze"
            className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 justify-center py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 transition-all"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Scan GitHub Repo for New Specs ➔</span>
          </Link>
        </div>
      </div>

      {/* API Info */}
      <div className="space-y-3 pb-4 border-b border-slate-100">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">API Details</p>
        <div className="grid grid-cols-3 gap-2">
          {field("api_name", "API Name", undefined, undefined, "text")}
          {field("v1_name", "V1 Label", undefined, undefined, "text")}
          {field("v2_name", "V2 Label", undefined, undefined, "text")}
        </div>
        {field("total_breaking_changes", "Total Breaking Changes Detected")}
      </div>

      {/* Customer Base */}
      <div className="space-y-3 pb-4 border-b border-slate-100">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Customer Base</p>
        <div className="grid grid-cols-2 gap-3">
          {field("total_customers", "Total Active Customers")}
          {field("avg_customer_arr", "Avg Customer ARR", "$")}
          {field("historical_churn_rate", "Historical Churn Rate", undefined, "%")}
          {field("avg_support_ticket_cost", "Avg Support Ticket Cost", "$")}
          {field("expected_migration_time_hours", "Migration Time Per Customer", undefined, "h")}
        </div>
      </div>

      {/* Enterprise */}
      <div className="space-y-3 pb-4 border-b border-slate-100">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Enterprise Segment</p>
        <div className="grid grid-cols-2 gap-3">
          {field("enterprise_customer_count", "Enterprise Customer Count")}
          {field("enterprise_avg_arr", "Enterprise Avg ARR", "$")}
        </div>
      </div>

      {/* Auth Change */}
      <div className="space-y-2">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Auth Change Severity</p>
        <div className="grid grid-cols-2 gap-2">
          {(["none", "minor", "moderate", "major"] as const).map((opt) => (
            <button
              key={opt}
              id={`auth-severity-${opt}`}
              onClick={() => onChange({ auth_change_severity: opt })}
              className={cn(
                "px-3 py-2 rounded-xl border text-xs font-bold transition-all capitalize cursor-pointer",
                form.auth_change_severity === opt
                  ? opt === "major"
                    ? "bg-red-600 text-white border-red-700"
                    : opt === "moderate"
                    ? "bg-amber-500 text-white border-amber-600"
                    : opt === "minor"
                    ? "bg-blue-500 text-white border-blue-600"
                    : "bg-emerald-500 text-white border-emerald-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button
        id="run-liability-analysis"
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full py-3 rounded-2xl bg-slate-900 text-white text-sm font-extrabold hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Calculating Liability...</span>
          </>
        ) : (
          <>
            <DollarSign className="w-4 h-4" />
            <span>Calculate Financial Liability</span>
          </>
        )}
      </button>
    </div>
  );
}

// ─── Result Sections ──────────────────────────────────────────────────────────

function StatusBanner({ result }: { result: LiabilityResult }) {
  const cfg = STATUS_CONFIG[result.status];
  const Icon = cfg.icon;
  const savings = result.total_liability - result.mitigated_liability;
  const savingsPct = result.total_liability > 0
    ? Math.round((savings / result.total_liability) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border p-6 shadow-sm", cfg.bg, cfg.border)}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm border", cfg.border)}>
          <Icon className={cn("w-7 h-7", cfg.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={cn("text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border", cfg.badge)}>
              {cfg.label}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              via {result.provider_used.replace("_", " ")}
            </span>
          </div>
          <p className={cn("text-xs font-medium", cfg.text)}>{cfg.sub}</p>
          {result.executive_summary && (
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{result.executive_summary}</p>
          )}
        </div>

        {/* Main number */}
        <div className="text-right flex-shrink-0">
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            {fmt(result.total_liability)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Total estimated liability</div>
          {savings > 0 && (
            <div className="text-xs font-bold text-emerald-600 mt-1">
              → {fmt(result.mitigated_liability)} after mitigations ({savingsPct}% saved)
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ScenariosRow({ result }: { result: LiabilityResult }) {
  const items = [
    { label: "Best Case", value: result.scenarios.best_case, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    { label: "Likely Case", value: result.scenarios.likely_case, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    { label: "Worst Case", value: result.scenarios.worst_case, color: "text-red-700", bg: "bg-red-50 border-red-200" },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.label} className={cn("rounded-xl border px-4 py-3 text-center", item.bg)}>
          <div className={cn("text-lg font-extrabold font-mono", item.color)}>{fmt(item.value)}</div>
          <div className="text-[11px] text-slate-600 mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function BreakdownCards({ result }: { result: LiabilityResult }) {
  const items = [
    { label: "Revenue at Risk", value: result.breakdown.revenue_at_risk, color: "#dc2626", desc: "Customer ARR × churn uplift × 3yr LTV" },
    { label: "Enterprise Risk", value: result.breakdown.enterprise_risk, color: "#b91c1c", desc: "Enterprise segment — higher churn sensitivity" },
    { label: "Support Overhead", value: result.breakdown.support_cost, color: "#f97316", desc: "Direct tickets + debugging + guides + CS time" },
    { label: "Reputation Damage", value: result.breakdown.reputation_risk, color: "#be123c", desc: "Review impact × lost new-customer pipeline" },
    { label: "Opportunity Cost", value: result.breakdown.opportunity_cost, color: "#ea580c", desc: "Engineering + DevRel + Sales distraction" },
  ];
  const total = result.total_liability;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-slate-600" />
        Cost Breakdown
      </h3>
      {items.map((item) => {
        const pctVal = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">{item.label}</span>
              <span className="font-mono font-bold text-slate-900">
                {fmt(item.value)} <span className="text-slate-400 font-normal">({pct(pctVal)})</span>
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pctVal}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ backgroundColor: item.color }}
                className="h-full rounded-full"
              />
            </div>
            <p className="text-[10px] text-slate-500">{item.desc}</p>
          </div>
        );
      })}
    </div>
  );
}

function LiabilityPieChart({ result }: { result: LiabilityResult }) {
  const data = result.chart_data.filter((d) => d.value > 0);
  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.04) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="700">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-slate-600" />
        Liability Composition
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} label={renderLabel} outerRadius={110} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(v: number) => [fmt(v), ""]} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-700 font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function MitigationROIChart({ mitigations }: { mitigations: MitigationStrategy[] }) {
  const data = mitigations.map((m) => ({
    name: m.name.length > 22 ? m.name.slice(0, 22) + "…" : m.name,
    "Implementation Cost": m.implementation_cost,
    "Expected Savings": m.savings,
    ROI: m.roi,
  }));
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4">
        <TrendingDown className="w-4 h-4 text-emerald-600" />
        Mitigation ROI Analysis
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <RechartsTooltip content={<CurrencyTooltip />} />
          <Legend formatter={(v) => <span className="text-xs text-slate-700">{v}</span>} />
          <Bar dataKey="Implementation Cost" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Expected Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RiskRadarChart({ result }: { result: LiabilityResult }) {
  const data = result.risk_dimensions.map((d) => ({ subject: d.axis, score: d.score, fullMark: 10 }));
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-indigo-600" />
        Risk Dimension Analysis
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9 }} />
          <Radar name="Risk Score" dataKey="score" stroke="#dc2626" fill="#dc2626" fillOpacity={0.18} strokeWidth={2} />
          <RechartsTooltip formatter={(v: number) => [`${v}/10`, "Risk Score"]} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MitigationCards({ mitigations }: { mitigations: MitigationStrategy[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        Mitigation Strategies
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mitigations.map((m, i) => {
          const pc = PRIORITY_CONFIG[m.priority];
          return (
            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
              <div className="flex items-start justify-between gap-2">
                <span className={cn("text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border", pc.color)}>
                  {pc.label}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{m.time_hours}h work</span>
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900 leading-snug">{m.name}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{m.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                <div>
                  <p className="text-[10px] text-slate-500">Implementation</p>
                  <p className="text-xs font-extrabold text-slate-800 font-mono">{fmt(m.implementation_cost)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Expected Savings</p>
                  <p className="text-xs font-extrabold text-emerald-700 font-mono">{fmt(m.savings)}</p>
                </div>
              </div>
              <div className={cn("text-center py-1.5 rounded-lg text-xs font-extrabold font-mono",
                m.roi > 10 ? "bg-emerald-100 text-emerald-800" : m.roi > 4 ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
              )}>
                {m.roi}x ROI
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineSection({ result }: { result: LiabilityResult }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600" />
        Release Timeline Recommendation
      </h3>
      <div className="relative pl-6 space-y-3">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200 rounded-full" />
        {result.timeline.map((step, i) => (
          <div key={i} className="relative flex items-start gap-3">
            <div className="absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 flex-1 flex items-center gap-3">
              <span className="text-[10px] font-extrabold font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg whitespace-nowrap border border-blue-200">
                Day {step.day}
              </span>
              <span className="text-xs text-slate-700">{step.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardTalkingPoints({ result }: { result: LiabilityResult }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
        <Presentation className="w-4 h-4 text-purple-600" />
        Board Presentation Talking Points
      </h3>
      <div className="space-y-2">
        {(result.board_talking_points || []).map((point, i) => (
          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/60 border border-purple-100">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 border border-purple-200">
              {i + 1}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{point}</p>
          </div>
        ))}
      </div>
      {result.risk_insights && result.risk_insights.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Strategic Insights</p>
          {result.risk_insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>{ins}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

function exportPDF(result: LiabilityResult, form: FormState) {
  const win = window.open("", "_blank");
  if (!win) return;

  const statusColors: Record<string, string> = {
    green: "#059669",
    yellow: "#d97706",
    red: "#dc2626",
  };
  const sColor = statusColors[result.status] || "#1e293b";
  const statusLabel = STATUS_CONFIG[result.status].label;

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Breaking Change Liability Report — ${form.api_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; color: #1e293b; background: white; padding: 40px; }
    h1 { font-size: 22pt; font-weight: 700; margin-bottom: 4px; }
    h2 { font-size: 13pt; font-weight: 700; margin: 22px 0 10px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; }
    h3 { font-size: 11pt; font-weight: 700; margin: 14px 0 6px; }
    .header { border-bottom: 2px solid ${sColor}; padding-bottom: 16px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 3px 12px; border-radius: 99px; font-size: 9pt; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ${sColor}; border: 1.5px solid ${sColor}; margin-bottom: 8px; }
    .total { font-size: 30pt; font-weight: 900; color: ${sColor}; letter-spacing: -1px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .card-label { font-size: 9pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
    .card-value { font-size: 14pt; font-weight: 700; font-family: Courier New, monospace; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 16px; }
    th { background: #1e293b; color: white; padding: 6px 10px; text-align: left; font-size: 9pt; }
    td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }
    .point { padding: 6px 0; border-bottom: 1px solid #f1f5f9; display: flex; gap: 8px; align-items: flex-start; }
    .num { min-width: 20px; font-weight: 700; color: ${sColor}; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">${statusLabel}</div>
    <h1>Breaking Change Liability Report</h1>
    <p style="color:#64748b; font-size:10pt; margin-top:4px;">${form.api_name} &nbsp;|&nbsp; ${form.v1_name} → ${form.v2_name} &nbsp;|&nbsp; ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>

  <div style="display:flex; gap:24px; align-items:flex-start; margin-bottom:24px;">
    <div>
      <p style="font-size:10pt; color:#64748b;">Total Estimated Liability</p>
      <div class="total">${fmt(result.total_liability)}</div>
      <p style="font-size:10pt; color:#059669; margin-top:4px;">→ ${fmt(result.mitigated_liability)} after top mitigations</p>
    </div>
    <div style="flex:1;">
      <p style="font-size:10pt; margin-bottom:8px;">${result.executive_summary || ""}</p>
      <p style="font-size:10pt; font-weight:700;">Recommendation: <span style="color:${sColor}">${result.recommendation || statusLabel}</span></p>
    </div>
  </div>

  <h2>Financial Breakdown</h2>
  <div class="grid-2">
    ${[
      ["Revenue at Risk", result.breakdown.revenue_at_risk],
      ["Enterprise Risk", result.breakdown.enterprise_risk],
      ["Support Cost", result.breakdown.support_cost],
      ["Reputation Risk", result.breakdown.reputation_risk],
      ["Opportunity Cost", result.breakdown.opportunity_cost],
    ]
      .map(
        ([label, value]) =>
          `<div class="card"><div class="card-label">${label}</div><div class="card-value">${fmt(value as number)}</div></div>`
      )
      .join("")}
  </div>

  <h2>Scenarios</h2>
  <div class="grid-2">
    ${[
      ["Best Case", result.scenarios.best_case, "#059669"],
      ["Likely Case", result.scenarios.likely_case, "#d97706"],
      ["Worst Case", result.scenarios.worst_case, "#dc2626"],
    ]
      .map(
        ([label, value, color]) =>
          `<div class="card"><div class="card-label">${label}</div><div class="card-value" style="color:${color}">${fmt(value as number)}</div></div>`
      )
      .join("")}
  </div>

  <h2>Mitigation Strategies</h2>
  <table>
    <thead><tr><th>Strategy</th><th>Impl. Cost</th><th>Savings</th><th>ROI</th><th>Hours</th><th>Priority</th></tr></thead>
    <tbody>
      ${result.mitigations
        .map(
          (m) =>
            `<tr><td>${m.name}</td><td>${fmt(m.implementation_cost)}</td><td>${fmt(m.savings)}</td><td>${m.roi}x</td><td>${m.time_hours}h</td><td style="text-transform:capitalize">${m.priority}</td></tr>`
        )
        .join("")}
    </tbody>
  </table>

  <h2>Board Talking Points</h2>
  ${(result.board_talking_points || [])
    .map((p, i) => `<div class="point"><span class="num">${i + 1}.</span><span>${p}</span></div>`)
    .join("")}

  <h2>Release Timeline</h2>
  <table>
    <thead><tr><th>Day</th><th>Action</th></tr></thead>
    <tbody>
      ${result.timeline
        .map((t) => `<tr><td style="font-weight:700; font-family: Courier New; width:60px">Day ${t.day}</td><td>${t.action}</td></tr>`)
        .join("")}
    </tbody>
  </table>

  <p style="margin-top:32px; font-size:9pt; color:#94a3b8; text-align:center;">
    Generated by APIDriftShield &nbsp;·&nbsp; ${new Date().toISOString()} &nbsp;·&nbsp; Powered by ${result.provider_used.replace(/_/g, " ")}
  </p>
</body>
</html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LiabilityReportPage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LiabilityResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((partial: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const breaking = parseInt(form.total_breaking_changes, 10);
    if (isNaN(breaking) || breaking < 0) {
      toast.error("Invalid Input", { description: "Breaking changes count must be a non-negative number." });
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const input: LiabilityInput = {
        api_name: form.api_name || "My API",
        v1_name: form.v1_name || "v1",
        v2_name: form.v2_name || "v2",
        total_breaking_changes: breaking,
        total_customers: parseInt(form.total_customers, 10) || 500,
        avg_customer_arr: parseFloat(form.avg_customer_arr) || 20000,
        historical_churn_rate: (parseFloat(form.historical_churn_rate) || 2.5) / 100,
        avg_support_ticket_cost: parseFloat(form.avg_support_ticket_cost) || 150,
        expected_migration_time_hours: parseFloat(form.expected_migration_time_hours) || 4,
        enterprise_customer_count: parseInt(form.enterprise_customer_count, 10) || 0,
        enterprise_avg_arr: parseFloat(form.enterprise_avg_arr) || 100000,
        auth_change_severity: form.auth_change_severity,
      };
      const res = await calculateLiability(input);
      setResult(res);
      toast.success("Liability report generated", {
        description: `Total liability: ${fmt(res.total_liability)} — ${res.recommendation}`,
      });
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      toast.error("Calculation failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="border-b border-slate-200 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  Financial Intelligence
                </span>
                <span className="text-[10px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Groq + Gemini Powered
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Breaking Change Liability Report
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Translate API breaking changes into board-ready financial impact analysis — revenue at risk, support overhead, reputation damage, and ROI-ranked mitigation strategies.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Input Panel */}
          <div className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-20">
            <InputForm
              form={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>

          {/* Right: Results */}
          <div className="flex-1 min-w-0 space-y-5">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-slate-900 border-t-transparent animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-900">Calculating Financial Exposure...</p>
                  <p className="text-xs text-slate-500">Contacting Groq AI for financial reasoning and mitigation analysis</p>
                </motion.div>
              )}

              {!isLoading && !result && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center shadow-sm"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                    <DollarSign className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No Report Generated Yet</h3>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    Fill in the financial parameters on the left and click <strong>"Calculate Financial Liability"</strong> to generate a board-ready impact analysis.
                  </p>
                </motion.div>
              )}

              {!isLoading && result && (
                <motion.div
                  key="result"
                  ref={resultRef}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-5"
                >
                  {/* Export button */}
                  <div className="flex justify-end">
                    <button
                      id="export-liability-pdf"
                      onClick={() => exportPDF(result, form)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 bg-white px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Board PDF
                    </button>
                  </div>

                  {/* Status banner */}
                  <StatusBanner result={result} />

                  {/* Scenarios */}
                  <ScenariosRow result={result} />

                  {/* Charts row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <LiabilityPieChart result={result} />
                    <RiskRadarChart result={result} />
                  </div>

                  {/* Breakdown */}
                  <BreakdownCards result={result} />

                  {/* Mitigation chart */}
                  <MitigationROIChart mitigations={result.mitigations} />

                  {/* Mitigation cards */}
                  <MitigationCards mitigations={result.mitigations} />

                  {/* Timeline */}
                  <TimelineSection result={result} />

                  {/* Board talking points */}
                  <BoardTalkingPoints result={result} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

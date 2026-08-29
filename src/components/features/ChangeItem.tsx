import { useState } from "react";
import {
  Trash2,
  Plus,
  RefreshCw,
  Lock,
  XCircle,
  Hash,
  FlaskConical,
  Cpu,
  ChevronDown,
  FileCode,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { ApiChange, ChangeType, Severity } from "@/types";
import { cn } from "@/lib/utils";

const CHANGE_ICONS: Record<ChangeType, React.ElementType> = {
  removed_endpoint: Trash2,
  added_required_field: Plus,
  type_change: RefreshCw,
  auth_change: Lock,
  response_removed: XCircle,
  description_change: Hash,
  optional_field_added: Plus,
  new_endpoint: Plus,
  example_update: RefreshCw,
  new_response_field: Plus,
  status_code_change: Hash,
  parameter_removed: Trash2,
  parameter_type_change: RefreshCw,
  enum_value_removed: XCircle,
  request_body_made_required: Lock,
  format_changed: Hash,
  uncertain_drift: HelpCircle
};

const SEV: Record<Severity, { badge: string; leftBorder: string; expandBg: string; label: string }> = {
  breaking: {
    badge: "bg-red-50 text-red-700 border-red-200",
    leftBorder: "border-l-red-500",
    expandBg: "bg-red-50/20",
    label: "BREAKING"
  },
  caution: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    leftBorder: "border-l-amber-500",
    expandBg: "bg-amber-50/20",
    label: "CAUTION"
  },
  safe: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    leftBorder: "border-l-emerald-500",
    expandBg: "bg-emerald-50/20",
    label: "SAFE"
  },
  uncertain: {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    leftBorder: "border-l-purple-500",
    expandBg: "bg-purple-50/20",
    label: "REVIEW REQ."
  }
};

const METHOD_COLOR: Record<string, string> = {
  GET: "text-blue-700 bg-blue-50 border-blue-200",
  POST: "text-emerald-700 bg-emerald-50 border-emerald-200",
  PUT: "text-amber-700 bg-amber-50 border-amber-200",
  PATCH: "text-purple-700 bg-purple-50 border-purple-200",
  DELETE: "text-red-700 bg-red-50 border-red-200",
  SCHEMA: "text-indigo-700 bg-indigo-50 border-indigo-200",
  ALL: "text-slate-700 bg-slate-100 border-slate-200"
};

type TabType = "evidence" | "test" | "impact" | "migration";

export default function ChangeItem({ change, index }: { change: ApiChange; index: number }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("evidence");

  const severityKey = change.severity || "caution";
  const cfg = SEV[severityKey] || SEV.caution;
  const Icon = CHANGE_ICONS[change.type] || Hash;

  const [methodPart, ...pathParts] = (change.route || "GET /").split(" ");
  const pathPart = pathParts.join(" ") || change.route;
  const methodColor = METHOD_COLOR[methodPart] ?? "text-slate-700 bg-slate-50 border-slate-200";

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 border-l-4 overflow-hidden transition-all bg-white shadow-sm hover:border-slate-300 hover:shadow-md",
        cfg.leftBorder
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Change Item Header Bar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3.5 p-4 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
      >
        <div className={cn("flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border mt-0.5 shadow-sm", cfg.badge)}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={cn("text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border font-mono", cfg.badge)}>
              {cfg.label}
            </span>

            {methodPart && (
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md font-mono border", methodColor)}>
                {methodPart}
              </span>
            )}

            <code className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[280px] font-mono border border-slate-200">
              {pathPart}
            </code>

            {change.verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Runtime Verified
              </span>
            )}

            {change.verificationStatus === "UNCERTAIN_REVIEW_REQUIRED" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                <HelpCircle className="w-3 h-3" />
                Honest Abstention
              </span>
            )}

            <span className="text-[11px] text-slate-400 ml-auto font-mono tabular-nums font-semibold">
              {change.confidence}% Conf.
            </span>
          </div>

          <p className="text-sm font-bold text-slate-900 leading-snug">{change.title}</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{change.description}</p>
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 flex-shrink-0 mt-1.5 transition-transform duration-200",
            open ? "rotate-180 text-indigo-600" : ""
          )}
        />
      </button>

      {/* Expanded Accordion Detail View with 4-Tab Navigation */}
      {open && (
        <div className={cn("border-t border-slate-200 p-4 space-y-4 animate-slide-down", cfg.expandBg)}>
          {/* Abstention alert if applicable */}
          {change.abstentionReason && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Honest Abstention Checkpoint: </span>
                {change.abstentionReason}
              </div>
            </div>
          )}

          {/* Sub-Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 flex-wrap">
            <TabBtn
              label="Contract Diff"
              icon={FileCode}
              active={activeTab === "evidence"}
              onClick={() => setActiveTab("evidence")}
            />
            <TabBtn
              label="Executable Test Evidence"
              icon={FlaskConical}
              badge={change.testEvidence ? "Verified" : undefined}
              active={activeTab === "test"}
              onClick={() => setActiveTab("test")}
            />
            <TabBtn
              label="Downstream Impact"
              icon={Cpu}
              count={change.impactItems?.length}
              active={activeTab === "impact"}
              onClick={() => setActiveTab("impact")}
            />
            <TabBtn
              label="Migration Guide"
              icon={GitPullRequest}
              active={activeTab === "migration"}
              onClick={() => setActiveTab("migration")}
            />
          </div>

          {/* TAB 1: Contract Diff */}
          {activeTab === "evidence" && (
            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Raw Contract Evidence
                </div>
                <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 shadow-inner">
                  <code className="text-xs text-indigo-300 leading-relaxed font-mono whitespace-pre-wrap break-all select-all">
                    {change.evidence}
                  </code>
                </div>
              </div>

              {change.schemaChanges && change.schemaChanges.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Side-by-Side Schema Mutation
                  </div>
                  {change.schemaChanges.map((sc, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 overflow-hidden text-xs font-mono mb-2 shadow-sm bg-white">
                      <div className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-[11px] font-semibold border-b border-slate-200">
                        Field: <span className="text-indigo-600 font-bold">{sc.field}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                        <div className="bg-red-50/70 p-3">
                          <div className="text-[10px] font-sans font-bold text-red-700 mb-1 uppercase tracking-wider">
                            Before (v1 Spec)
                          </div>
                          <code className="text-red-900 break-all leading-relaxed text-xs">{sc.before || "null"}</code>
                        </div>
                        <div className="bg-emerald-50/70 p-3">
                          <div className="text-[10px] font-sans font-bold text-emerald-800 mb-1 uppercase tracking-wider">
                            After (v2 Spec)
                          </div>
                          <code className="text-emerald-900 break-all leading-relaxed text-xs">{sc.after || "null"}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Executable Test Evidence */}
          {activeTab === "test" && (
            <div className="space-y-3">
              {change.testEvidence ? (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Targeted Synthetic Test Probe</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                      Black-Box Reproduction
                    </span>
                  </div>
                  <div className="p-3.5 border-b border-slate-200 text-xs text-slate-800 font-mono">
                    <span className="text-slate-500 font-medium">Test Case: </span>
                    <span className="font-semibold text-slate-900">{change.testEvidence.testCase}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                    <div className="p-3.5 bg-emerald-50/40">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                        v1 Runtime Response
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="text-xs font-mono font-bold text-emerald-900">
                          {change.testEvidence.v1Result}
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5 bg-red-50/40">
                      <div className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-1">
                        v2 Runtime Response
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        <span className="text-xs font-mono font-bold text-red-900">
                          {change.testEvidence.v2Result}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 bg-indigo-50/80 border-t border-indigo-100">
                    <div className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Empirical Proof: {change.testEvidence.confirms}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                  This change is verified purely by static schema analysis without requiring live black-box execution.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Downstream Impact Tracing */}
          {activeTab === "impact" && (
            <div className="space-y-3">
              {change.impactItems && change.impactItems.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Blast Radius &amp; Affected Artifacts
                  </div>
                  {change.impactItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      <span className="text-xs font-bold text-slate-900 min-w-[110px] flex-shrink-0">{item.name}</span>
                      <span className="text-xs font-mono text-amber-800 font-bold flex-shrink-0 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {item.affected}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">{item.detail}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500">No downstream client artifacts impacted.</div>
              )}

              {change.affectedDocs && change.affectedDocs.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Documentation &amp; Example Files Requiring Sync
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {change.affectedDocs.map((doc, i) => (
                      <span
                        key={i}
                        className="text-xs text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-mono"
                      >
                        📄 {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Migration Guide & Release Action */}
          {activeTab === "migration" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-sm space-y-2">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4 text-indigo-600" />
                  <span>Actionable Migration Recipe</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {change.recommendation || "Ensure client code is updated before migrating to this API version."}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Release Status: Release Blocked until verified</span>
                <span className="text-[10px] font-bold text-indigo-700 uppercase font-mono">PR Review Required</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabBtn({
  label,
  icon: Icon,
  badge,
  count,
  active,
  onClick
}: {
  label: string;
  icon: React.ElementType;
  badge?: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer",
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
      {badge && (
        <span
          className={cn(
            "text-[9px] px-1.5 py-0.2 rounded font-bold uppercase",
            active ? "bg-indigo-700 text-indigo-100" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
          )}
        >
          {badge}
        </span>
      )}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
            active ? "bg-indigo-700 text-white" : "bg-slate-200 text-slate-700"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

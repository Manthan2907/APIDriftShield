import { useState } from "react";
import { Trash2, Plus, RefreshCw, Lock, XCircle, Hash, FlaskConical, Lightbulb, FileText, Cpu, ChevronDown } from "lucide-react";
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
};

const SEV: Record<Severity, { badge: string; leftBorder: string; expandBg: string; label: string }> = {
  breaking: { badge: "bg-red-50 text-red-700 border-red-200", leftBorder: "border-l-red-400", expandBg: "bg-red-50/50", label: "BREAKING" },
  caution:  { badge: "bg-amber-50 text-amber-700 border-amber-200", leftBorder: "border-l-amber-400", expandBg: "bg-amber-50/50", label: "CAUTION" },
  safe:     { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", leftBorder: "border-l-emerald-400", expandBg: "bg-emerald-50/50", label: "SAFE" },
};

const METHOD_COLOR: Record<string, string> = {
  GET: "text-blue-700 bg-blue-50",
  POST: "text-emerald-700 bg-emerald-50",
  PUT: "text-amber-700 bg-amber-50",
  PATCH: "text-violet-700 bg-violet-50",
  DELETE: "text-red-700 bg-red-50",
};

export default function ChangeItem({ change, index }: { change: ApiChange; index: number }) {
  const [open, setOpen] = useState(false);
  const cfg = SEV[change.severity];
  const Icon = CHANGE_ICONS[change.type];
  const [methodPart, ...pathParts] = change.route.split(" ");
  const pathPart = pathParts.join(" ");
  const methodColor = METHOD_COLOR[methodPart] ?? "text-slate-700 bg-slate-50";

  return (
    <div
      className={cn("rounded-lg border border-slate-200 border-l-[3px] overflow-hidden transition-shadow hover:shadow-sm", cfg.leftBorder)}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className={cn("flex-shrink-0 w-6 h-6 rounded flex items-center justify-center border mt-0.5", cfg.badge)}>
          <Icon className="w-3 h-3" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn("text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border", cfg.badge)}>
              {cfg.label}
            </span>
            {change.method && (
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded font-mono", methodColor)}>
                {change.method}
              </span>
            )}
            <code className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[180px]">
              {pathPart}
            </code>
            <span className="text-[11px] text-slate-400 ml-auto tabular-nums">{change.confidence}%</span>
          </div>
          <p className="text-sm font-medium text-slate-800 leading-snug">{change.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{change.description}</p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200", open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className={cn("border-t border-slate-100 px-4 pb-4 pt-3 space-y-4 animate-slide-down", cfg.expandBg)}>
          {/* Evidence */}
          <div>
            <SectionTitle label="Evidence" />
            <div className="bg-slate-900 rounded-lg p-3">
              <code className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap break-all">{change.evidence}</code>
            </div>
          </div>

          {/* Schema diff */}
          {change.schemaChanges && change.schemaChanges.length > 0 && (
            <div>
              <SectionTitle label="Schema Diff" />
              {change.schemaChanges.map((sc, i) => (
                <div key={i} className="rounded-lg border border-slate-200 overflow-hidden text-xs font-mono mb-2">
                  <div className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[11px] border-b border-slate-200">{sc.field}</div>
                  <div className="grid grid-cols-2 divide-x divide-slate-200">
                    <div className="bg-red-50 p-3">
                      <div className="text-[10px] font-sans font-semibold text-red-500 mb-1.5 uppercase tracking-wide">Before (v1)</div>
                      <code className="text-red-800 break-all leading-relaxed text-xs">{sc.before}</code>
                    </div>
                    <div className="bg-emerald-50 p-3">
                      <div className="text-[10px] font-sans font-semibold text-emerald-600 mb-1.5 uppercase tracking-wide">After (v2)</div>
                      <code className="text-emerald-800 break-all leading-relaxed text-xs">{sc.after}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Test evidence */}
          {change.testEvidence && (
            <div>
              <SectionTitle label="Test Evidence" icon={FlaskConical} />
              <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                  <span className="text-xs text-slate-500">Case: </span>
                  <span className="text-xs text-slate-800 font-medium">{change.testEvidence.testCase}</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-200">
                  <div className="p-3">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">v1 Result</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span className="text-xs text-slate-700 font-mono">{change.testEvidence.v1Result}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">v2 Result</div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                      <span className="text-xs text-slate-700 font-mono">{change.testEvidence.v2Result}</span>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2 border-t border-slate-100 bg-indigo-50">
                  <span className="text-xs text-indigo-700 font-medium">→ {change.testEvidence.confirms}</span>
                </div>
              </div>
            </div>
          )}

          {/* Impact */}
          {change.impactItems && change.impactItems.length > 0 && (
            <div>
              <SectionTitle label="Impact Analysis" icon={Cpu} />
              <div className="space-y-1.5">
                {change.impactItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="text-xs font-semibold text-slate-700 min-w-[90px] flex-shrink-0">{item.name}</span>
                    <span className="text-xs text-amber-700 font-medium flex-shrink-0">{item.affected}</span>
                    <span className="text-xs text-slate-500 font-mono">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Docs */}
          {change.affectedDocs && change.affectedDocs.length > 0 && (
            <div>
              <SectionTitle label="Affected Documentation" icon={FileText} />
              <ul className="space-y-1">
                {change.affectedDocs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="text-amber-500 flex-shrink-0 mt-0.5">•</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          {change.recommendation && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
              <Lightbulb className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Recommendation</div>
                <p className="text-xs text-slate-700 leading-relaxed">{change.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ label, icon: Icon }: { label: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {Icon && <Icon className="w-3 h-3 text-slate-400" />}
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

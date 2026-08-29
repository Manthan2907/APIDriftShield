import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Clock,
  Calendar,
  Copy,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Code2,
  Terminal,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Bot,
  Layers,
  ChevronLeft
} from "lucide-react";
import { ApiChange } from "@/types";
import { toast } from "sonner";
import { AiRemediationModal } from "@/components/features/AiRemediationModal";
import { cn } from "@/lib/utils";

interface MigrationPathPanelProps {
  breakingChanges: ApiChange[];
  v1SpecName?: string;
  v2SpecName?: string;
}

export const MigrationPathPanel: React.FC<MigrationPathPanelProps> = ({
  breakingChanges,
  v1SpecName = "v1.json",
  v2SpecName = "v2.json"
}) => {
  const [migrations, setMigrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedSed, setCopiedSed] = useState<string | null>(null);
  const [copiedBash, setCopiedBash] = useState<string | null>(null);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [completionDate, setCompletionDate] = useState<string>("");
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [clusterFilter, setClusterFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    if (breakingChanges && breakingChanges.length > 0) {
      fetchMigrationPaths();
    } else {
      setMigrations([]);
    }
  }, [breakingChanges]);

  const fetchMigrationPaths = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/generate-migration-path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          breaking_changes: breakingChanges.map((c) => ({
            id: c.id,
            type: c.type,
            path: c.route || c.path,
            method: c.method || "ALL",
            field: c.title,
            details: c.description || c.title,
            v1_value: c.evidence,
            v2_value: c.recommendation
          }))
        })
      });

      const data = await response.json();
      if (data.success && data.migrations && data.migrations.length > 0) {
        setMigrations(data.migrations);
        setTotalHours(data.total_effort_hours || 1.0);
        setTotalMinutes(data.total_effort_minutes || 60);
        setCompletionDate(data.estimated_completion_date || "Next Work Day");
        setExpandedId(data.migrations[0]?.change_id || null);
        return;
      }
      throw new Error("No backend migrations returned");
    } catch {
      const fallbackMigrations = breakingChanges.map((c, i) => generateClientFallbackMigration(c, i + 1));
      const totalMins = fallbackMigrations.reduce((acc, m) => acc + (m.time_minutes || 15), 0);
      setMigrations(fallbackMigrations);
      setTotalMinutes(totalMins);
      setTotalHours(Math.round((totalMins / 60) * 10) / 10);
      setCompletionDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
      setExpandedId(fallbackMigrations[0]?.change_id || null);
    } finally {
      setLoading(false);
    }
  };

  // Grouped breakdown for UI pill filters
  const clusterCounts = useMemo(() => {
    const removed = migrations.filter((m) => m.breaking_change_type?.toLowerCase().includes("removed"));
    const required = migrations.filter((m) => m.breaking_change_type?.toLowerCase().includes("required"));
    const typeNarrow = migrations.filter((m) => m.breaking_change_type?.toLowerCase().includes("type"));
    return {
      all: migrations.length,
      removed: removed.length,
      required: required.length,
      typeNarrow: typeNarrow.length
    };
  }, [migrations]);

  // Filtered and paginated migrations
  const filteredMigrations = useMemo(() => {
    let list = migrations;
    if (clusterFilter === "removed") {
      list = list.filter((m) => m.breaking_change_type?.toLowerCase().includes("removed"));
    } else if (clusterFilter === "required") {
      list = list.filter((m) => m.breaking_change_type?.toLowerCase().includes("required"));
    } else if (clusterFilter === "type") {
      list = list.filter((m) => m.breaking_change_type?.toLowerCase().includes("type"));
    }
    return list;
  }, [migrations, clusterFilter]);

  const totalPages = Math.ceil(filteredMigrations.length / ITEMS_PER_PAGE) || 1;
  const paginatedMigrations = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredMigrations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMigrations, page]);

  const copyToClipboard = (text: string, type: "sed" | "bash", id: string) => {
    navigator.clipboard.writeText(text);
    if (type === "sed") {
      setCopiedSed(id);
      toast.success("sed bulk find-and-replace command copied!");
      setTimeout(() => setCopiedSed(null), 2000);
    } else {
      setCopiedBash(id);
      toast.success("grep search command copied!");
      setTimeout(() => setCopiedBash(null), 2000);
    }
  };

  if (!breakingChanges || breakingChanges.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-2 border-indigo-100 rounded-3xl p-6 shadow-sm text-slate-900 space-y-5 font-sans">
      {/* Header Banner */}
      <div className="flex items-start justify-between flex-wrap gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Automated Client Migration Path &amp; Code Remediation
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold uppercase">
                {breakingChanges.length} Breaking Fixes
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact old ➔ new replacement code, regex find-and-replace rules, and AI refactoring prompts for Cursor / Claude.
            </p>
          </div>
        </div>

        {/* AI Prompt CTA & Manual Effort Pill */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Strategic Fix &amp; Cursor Prompt</span>
          </button>

          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-xs font-medium">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{totalHours > 20 ? `${totalHours}h Manual` : `${totalMinutes} min`}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" /> 2 Min AI Fix
            </span>
          </div>
        </div>
      </div>

      {/* High-Scale Notice when > 20 breaking changes */}
      {breakingChanges.length > 20 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 to-purple-50/70 border border-indigo-200/80 text-xs text-slate-800 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white text-indigo-600 border border-indigo-200 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900">
                Large Enterprise Breaking Diff ({breakingChanges.length} contract modifications)
              </p>
              <p className="text-slate-600 text-[11.5px] mt-0.5">
                Don't spend {totalHours} hours manually editing each file. Generate a unified refactoring directive for <strong>Cursor AI</strong> or <strong>Claude Code</strong> to update your client repository automatically.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAiModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-700 font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Open AI Refactor Suite &rarr;</span>
          </button>
        </div>
      )}

      {/* Root Cause Cluster Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { setClusterFilter("all"); setPage(1); }}
            className={cn(
              "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
              clusterFilter === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            )}
          >
            All Changes ({clusterCounts.all})
          </button>

          {clusterCounts.removed > 0 && (
            <button
              onClick={() => { setClusterFilter("removed"); setPage(1); }}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                clusterFilter === "removed"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              )}
            >
              Removed Routes ({clusterCounts.removed})
            </button>
          )}

          {clusterCounts.required > 0 && (
            <button
              onClick={() => { setClusterFilter("required"); setPage(1); }}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                clusterFilter === "required"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
              )}
            >
              Required Fields ({clusterCounts.required})
            </button>
          )}

          {clusterCounts.typeNarrow > 0 && (
            <button
              onClick={() => { setClusterFilter("type"); setPage(1); }}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                clusterFilter === "type"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
              )}
            >
              Type Narrowing ({clusterCounts.typeNarrow})
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({filteredMigrations.length} total)
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-xs text-slate-500 gap-2.5">
          <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Synthesizing actionable code remediation diffs...</span>
        </div>
      ) : (
        /* Paginated Migrations Accordion List */
        <div className="space-y-3">
          {paginatedMigrations.map((mig, idx) => {
            const isExpanded = expandedId === mig.change_id;
            return (
              <div
                key={mig.change_id || idx}
                className="bg-slate-50/80 border border-slate-200 hover:border-indigo-200 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                {/* Accordion Toggle Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : mig.change_id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0 ${
                        mig.severity === "Critical"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {mig.severity || "Critical"}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate font-mono">
                          {mig.breaking_change_type}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                          — {mig.change_description}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] text-slate-600 font-mono bg-white px-2 py-0.5 rounded-full border border-slate-200 font-bold">
                      ⏱️ {mig.time_minutes} min
                    </span>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-600" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Details Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-200 bg-white p-5 space-y-4 text-xs"
                    >
                      {/* Code Diff Box: Old vs New */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-red-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              Legacy v1 Client Code
                            </span>
                            <span className="font-mono text-[10px] text-red-600">Old Syntax</span>
                          </div>
                          <pre className="p-2.5 rounded-lg bg-red-100/60 border border-red-200 text-red-950 font-mono text-[11.5px] overflow-x-auto whitespace-pre-wrap">
                            {mig.legacy_code_snippet}
                          </pre>
                        </div>

                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Migrated v2 Replacement
                            </span>
                            <span className="font-mono text-[10px] text-emerald-600">New Syntax</span>
                          </div>
                          <pre className="p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-200 text-emerald-950 font-mono text-[11.5px] overflow-x-auto whitespace-pre-wrap">
                            {mig.migrated_code_snippet}
                          </pre>
                        </div>
                      </div>

                      {/* Numbered Remediation Steps */}
                      {mig.remediation_steps && mig.remediation_steps.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                            Step-by-Step Remediation Instructions:
                          </span>
                          <ol className="space-y-1.5 pl-1">
                            {mig.remediation_steps.map((step: string, sIdx: number) => (
                              <li key={sIdx} className="flex items-start gap-2 text-slate-700">
                                <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Automation Tools: sed Find-and-Replace & grep */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-slate-600" />
                            Bulk Automated Regex Find &amp; Replace (sed)
                          </span>
                          <button
                            onClick={() => copyToClipboard(mig.sed_command, "sed", mig.change_id)}
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                          >
                            {copiedSed === mig.change_id ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedSed === mig.change_id ? "Copied" : "Copy sed"}</span>
                          </button>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-mono text-[11px] overflow-x-auto flex items-center justify-between gap-3">
                          <code className="truncate">{mig.sed_command}</code>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev Page
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  // Show current, first, last, and immediate neighbors
                  if (pNum === 1 || pNum === totalPages || Math.abs(pNum - page) <= 1) {
                    return (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={cn(
                          "w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer",
                          page === pNum
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        {pNum}
                      </button>
                    );
                  }
                  if (pNum === 2 && page > 3) return <span key="dots1" className="px-1 text-slate-400">...</span>;
                  if (pNum === totalPages - 1 && page < totalPages - 2) return <span key="dots2" className="px-1 text-slate-400">...</span>;
                  return null;
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                Next Page <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI Remediation Suite Modal */}
      <AiRemediationModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        breakingChanges={breakingChanges}
        v1SpecName={v1SpecName}
        v2SpecName={v2SpecName}
      />
    </div>
  );
};

function generateClientFallbackMigration(change: ApiChange, idx: number) {
  const method = change.method || "POST";
  const route = change.route || "/v1/resource";
  const fieldName = change.title.includes("'") ? change.title.split("'")[1] : "idempotency_key";

  if (change.type === "removed_endpoint") {
    return {
      change_id: change.id || `mig_${idx}`,
      breaking_change_type: `Endpoint Removed — ${method} ${route}`,
      change_description: `Route ${route} has been deprecated. Migrate client calls to v2 service.`,
      severity: "Critical",
      time_minutes: 15,
      legacy_code_snippet: `// Legacy v1 Client Call\nconst res = await api.delete("${route}");\nreturn res.data;`,
      migrated_code_snippet: `// Migrated v2 Client Call\nconst res = await api.post("${route.replace('/delete', '')}/deactivate", {\n  reason: "client_migration"\n});\nreturn res.data;`,
      remediation_steps: [
        `Locate legacy calls to ${route} across client codebase.`,
        `Update endpoint URL to the active v2 replacement route.`,
        `Verify HTTP 200/204 response status in integration test suite.`
      ],
      sed_command: `find ./src -type f \\( -name "*.ts" -o -name "*.js" -o -name "*.py" \\) -exec sed -i '' 's|${route}|/v2/resource|g' {} +`
    };
  }

  if (change.type === "added_required_field") {
    return {
      change_id: change.id || `mig_${idx}`,
      breaking_change_type: `Required Field Added — ${fieldName}`,
      change_description: `Mandatory property '${fieldName}' is now enforced on ${route}.`,
      severity: "Critical",
      time_minutes: 15,
      legacy_code_snippet: `// Legacy payload omitting required field\nawait api.post("${route}", {\n  title: "Item 1"\n});`,
      migrated_code_snippet: `// Migrated payload with mandatory field\nawait api.post("${route}", {\n  title: "Item 1",\n  ${fieldName}: crypto.randomUUID()\n});`,
      remediation_steps: [
        `Add '${fieldName}' parameter to client payload constructor.`,
        `Configure default UUID or token generator for automated requests.`,
        `Verify schema validation passes with HTTP 200 OK.`
      ],
      sed_command: `grep -rn "${route}" src/`
    };
  }

  return {
    change_id: change.id || `mig_${idx}`,
    breaking_change_type: `Contract Mutation — ${change.title}`,
    change_description: change.description || "Update client schema to match v2 contract.",
    severity: "Warning",
    time_minutes: 10,
    legacy_code_snippet: `// Legacy v1 Interface\ninterface Payload { id: string | number; }`,
    migrated_code_snippet: `// Migrated v2 Interface\ninterface Payload { id: string; }`,
    remediation_steps: [
      `Update TypeScript/Python schema types.`,
      `Ensure client serialization conforms to v2 format.`
    ],
    sed_command: `grep -rn "${route}" src/`
  };
}

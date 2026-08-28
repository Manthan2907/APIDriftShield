import { useState } from "react";
import { Clock, GitCompare, Copy, CheckCheck, Download, FileJson, AlertTriangle, CheckCircle } from "lucide-react";
import { AnalysisResult } from "@/types";
import SummaryCards from "@/components/features/SummaryCards";
import ChangeItem from "@/components/features/ChangeItem";
import FilterBar from "@/components/features/FilterBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SeverityFilter = "all" | "breaking" | "caution" | "safe";
type MethodFilter = "all" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export default function ResultsPanel({ result }: { result: AnalysisResult }) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");
  const [copied, setCopied] = useState(false);

  const filtered = result.changes.filter((c) => {
    const sevOk = severityFilter === "all" || c.severity === severityFilter;
    const methOk = methodFilter === "all" || c.method === methodFilter;
    return sevOk && methOk;
  });

  const counts = {
    all: result.summary.total,
    breaking: result.summary.breaking,
    caution: result.summary.caution,
    safe: result.summary.safe,
  };

  const buildMarkdown = () => {
    const lines = [
      `# API DriftShield — Analysis Report`,
      ``,
      `**Analyzed:** ${new Date(result.analyzedAt).toLocaleString()}`,
      `**v1:** \`${result.specV1Name}\` → **v2:** \`${result.specV2Name}\``,
      ``,
      `## Summary`,
      `| Severity | Count |`,
      `|----------|-------|`,
      `| 🔴 Breaking | ${result.summary.breaking} |`,
      `| 🟡 Caution | ${result.summary.caution} |`,
      `| 🟢 Safe | ${result.summary.safe} |`,
      `| **Total** | **${result.summary.total}** |`,
      `| Impact Score | **${result.summary.impactScore}%** |`,
      ``,
      `## Changes`,
      ``,
      ...result.changes.map((c) => [
        `### ${c.severity === "breaking" ? "🔴" : c.severity === "caution" ? "🟡" : "🟢"} ${c.title}`,
        `**Route:** \`${c.route}\` | **Severity:** ${c.severity.toUpperCase()} | **Confidence:** ${c.confidence}%`,
        ``,
        `${c.description}`,
        ``,
        `**Evidence:** ${c.evidence}`,
        ...(c.recommendation ? [``, `> **Recommendation:** ${c.recommendation}`] : []),
        ``,
        `---`,
        ``,
      ].join("\n")),
    ].join("\n");
    return lines;
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(buildMarkdown());
    setCopied(true);
    toast.success("Copied as Markdown");
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadJson = () => {
    const data = { meta: { tool: "API DriftShield", analyzedAt: result.analyzedAt, v1: result.specV1Name, v2: result.specV2Name }, summary: result.summary, changes: result.changes };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `driftshield-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const downloadMarkdownAsPdf = () => {
    const content = buildMarkdown();
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>DriftShield Report</title><style>
      body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; color: #1e293b; line-height: 1.6; }
      h1 { color: #4f46e5; } h2 { border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
      h3 { margin-top: 20px; } code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
      blockquote { border-left: 3px solid #4f46e5; margin: 0; padding-left: 16px; color: #6366f1; }
      pre { background: #f1f5f9; padding: 12px; border-radius: 6px; overflow-x: auto; }
      hr { border: none; border-top: 1px solid #e2e8f0; }
      table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    </style></head><body><pre style="white-space:pre-wrap;font-family:inherit">${content.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre>
    <script>window.print();<\/script></body></html>`);
    win.document.close();
    toast.success("PDF print dialog opened");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Analysis Report</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <GitCompare className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">
              <span className="text-slate-700 font-medium">{result.specV1Name}</span>
              {" → "}
              <span className="text-slate-700 font-medium">{result.specV2Name}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            {new Date(result.analyzedAt).toLocaleTimeString()}
          </span>
          <ExportBtn icon={<Download className="w-3.5 h-3.5" />} label="JSON" onClick={downloadJson} />
          <ExportBtn icon={copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />} label={copied ? "Copied!" : "Markdown"} onClick={copyMarkdown} active={copied} />
          <ExportBtn icon={<FileJson className="w-3.5 h-3.5" />} label="PDF" onClick={downloadMarkdownAsPdf} />
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards result={result} />

      {/* Status banner */}
      {result.summary.breaking > 0 ? (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <span className="font-semibold">{result.summary.breaking} breaking change{result.summary.breaking > 1 ? "s" : ""}</span>
            {" — do not deploy v2 without resolving these."}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-800 font-medium">No breaking changes — safe to deploy v2.</p>
        </div>
      )}

      {/* Filter + list */}
      <div>
        <div className="mb-3">
          <FilterBar
            active={severityFilter}
            onChange={setSeverityFilter}
            counts={counts}
            methodFilter={methodFilter}
            onMethodChange={setMethodFilter}
          />
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">{filtered.length} change{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
              No changes match this filter
            </div>
          ) : (
            filtered.map((change, i) => <ChangeItem key={change.id} change={change} index={i} />)
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 border-t border-slate-100 pt-3">
        Export this report as JSON, Markdown, or PDF for your team
      </p>
    </div>
  );
}

function ExportBtn({ icon, label, onClick, active = false }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 text-xs transition-colors border rounded-md px-2.5 py-1.5 font-medium min-h-[30px]",
        active
          ? "text-emerald-700 border-emerald-200 bg-emerald-50"
          : "text-slate-600 hover:text-indigo-600 border-slate-200 hover:border-indigo-200 bg-white"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

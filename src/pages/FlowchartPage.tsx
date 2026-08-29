import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Workflow,
  GitCompare,
  Copy,
  CheckCheck,
  Activity,
  ArrowRight,
  Sparkles,
  Zap,
  HelpCircle
} from "lucide-react";
import { AnalysisResult } from "@/types";
import { SAMPLE_V1_SPEC, SAMPLE_V2_SPEC } from "@/constants/mockData";
import { analyzeSpecs } from "@/lib/openApiDiff";
import { getHistory } from "@/lib/history";
import { AnimatedFlowchart } from "@/components/features/AnimatedFlowchart";
import { toast } from "sonner";

export default function FlowchartPage() {
  const location = useLocation();

  // Retrieve analysis result ONLY if passed from an actual analysis run or history
  const [result, setResult] = useState<AnalysisResult | null>(() => {
    if (location.state?.result) {
      return location.state.result;
    }
    const history = getHistory();
    if (history.length > 0 && history[0].result) {
      return history[0].result;
    }
    return null;
  });

  const [copiedMermaid, setCopiedMermaid] = useState(false);

  const handleLoadDemo = () => {
    try {
      const demoResult = analyzeSpecs(SAMPLE_V1_SPEC, SAMPLE_V2_SPEC, "v1_production.json", "v2_release.json");
      setResult(demoResult);
      toast.success("Loaded Interactive Demo Flowchart");
    } catch {
      toast.error("Failed to load demo specifications.");
    }
  };

  // If no analysis has been executed yet, show a clean Empty State Screen
  if (!result) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white border border-slate-200 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
            <Workflow className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              No Active API Analysis Found
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              The Deep Node Architecture Flowchart maps real routes, fault clusters, and runtime traps from an active analysis. Run an analysis on your OpenAPI specs first, or launch the interactive demo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-center pt-2">
            <Link
              to="/analyze"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Launch API Analyzer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLoadDemo}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load Interactive Demo</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 font-mono pt-2">
            OpenAPI 3.0 / 3.1 AST &bull; React Flow Graph &bull; AI Voice Tour
          </p>
        </div>
      </div>
    );
  }

  const breakingCount = result.summary.breaking;
  const cautionCount = result.summary.caution;
  const safeCount = result.summary.safe;
  const isReleaseBlocked = breakingCount > 0;

  const getMermaidDiagram = () => {
    return `graph LR
    subgraph Clients["Upstream Consumers"]
      C1["Web App (React/TS)"]
      C2["Mobile SDK (iOS/Android)"]
      C3["Internal Microservices"]
    end

    subgraph Gateway["API Gateway Layer"]
      GW["Kong / Envoy Gateway"]
      AUTH["Security & Auth Validator"]
    end

    subgraph DriftShield["DriftShield Deterministic Engine"]
      AST["AST Diff Engine (v1 ➔ v2)"]
      POL["RFC Policy Classifier"]
      PRB["Executable HTTP Sandbox Probes"]
    end

    subgraph Endpoints["Target Backend Routes"]
      ${result.changes.slice(0, 5).map((c, i) => `EP${i}["${c.severity.toUpperCase()}: ${c.route}"]`).join("\n      ")}
    end

    subgraph Decision["Release Decision Gate"]
      ${isReleaseBlocked ? 'VERDICT["🚫 RELEASE BLOCKED (Incompatibilities Detected)"]' : 'VERDICT["✅ RELEASE APPROVED (Backwards-Compatible)"]'}
    end

    Clients --> GW
    GW --> DriftShield
    DriftShield --> Endpoints
    Endpoints --> Decision
    `;
  };

  const copyMermaid = () => {
    navigator.clipboard.writeText(getMermaidDiagram());
    setCopiedMermaid(true);
    toast.success("Mermaid Architecture Diagram copied!");
    setTimeout(() => setCopiedMermaid(false), 2200);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Deep Node Architecture Visualizer
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive React Flow node stream: Pan, zoom, and inspect live runtime probe evidence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={copyMermaid}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all shadow-sm cursor-pointer"
            >
              {copiedMermaid ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copiedMermaid ? "Copied" : "Copy Mermaid"}</span>
            </button>

            <Link
              to="/analyze"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <GitCompare className="w-4 h-4" />
              <span>Back to Analyzer</span>
            </Link>
          </div>
        </div>

        {/* Deep React Flow Node Graph Canvas */}
        <div className="space-y-6">
          <AnimatedFlowchart result={result} />
        </div>

        {/* Traffic & Incompatibility Summary Footer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h4 className="font-bold text-sm text-slate-900">
                Live Traffic &amp; Route Incompatibility Breakdown
              </h4>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Comparing: <strong className="text-slate-900">{result.specV1Name}</strong> ➔{" "}
              <strong className="text-slate-900">{result.specV2Name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200">
              <div className="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Breaking Faults ({breakingCount})
              </div>
              <p className="text-red-800/80 leading-relaxed">
                Endpoints where removed methods, mandatory fields, or type narrowing cause immediate HTTP 400/404/422 runtime failures.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
              <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Caution Items ({cautionCount})
              </div>
              <p className="text-amber-800/80 leading-relaxed">
                Nullable shifts, altered defaults, or deprecations that require maintainer review before deployment.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Safe Additions ({safeCount})
              </div>
              <p className="text-emerald-800/80 leading-relaxed">
                Additive optional parameters, new endpoints, and documentation updates that do not affect existing clients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

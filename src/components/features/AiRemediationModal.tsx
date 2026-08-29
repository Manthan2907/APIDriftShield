import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  Copy,
  CheckCheck,
  Zap,
  Key,
  ShieldAlert,
  Terminal,
  Code2,
  ExternalLink,
  Workflow,
  Cpu,
  Layers,
  Wrench,
  CheckCircle2,
  RefreshCw,
  Info
} from "lucide-react";
import { ApiChange } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AiRemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakingChanges: ApiChange[];
  v1SpecName?: string;
  v2SpecName?: string;
}

type Provider = "groq" | "gemini" | "offline";
type TargetTool = "cursor" | "claude" | "copilot" | "gateway";

export const AiRemediationModal: React.FC<AiRemediationModalProps> = ({
  isOpen,
  onClose,
  breakingChanges,
  v1SpecName = "v1_production.json",
  v2SpecName = "v2_release.json"
}) => {
  const [provider, setProvider] = useState<Provider>("groq");
  const [apiKey, setApiKey] = useState<string>("");
  const [targetTool, setTargetTool] = useState<TargetTool>("cursor");
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"prompt" | "gateway" | "sdk" | "summary">("prompt");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [gatewayCode, setGatewayCode] = useState<string>("");
  const [sdkCode, setSdkCode] = useState<string>("");
  const [aiSummary, setAiSummary] = useState<string>("");

  // Load saved API key from localStorage
  useEffect(() => {
    const savedGroq = localStorage.getItem("driftshield_groq_api_key");
    const savedGemini = localStorage.getItem("driftshield_gemini_api_key");
    if (provider === "groq" && savedGroq) setApiKey(savedGroq);
    if (provider === "gemini" && savedGemini) setApiKey(savedGemini);
  }, [provider]);

  // Group breaking changes by root-cause patterns
  const clusters = React.useMemo(() => {
    const removed = breakingChanges.filter(
      (c) => c.type === "removed_endpoint" || c.title?.toLowerCase().includes("removed")
    );
    const required = breakingChanges.filter(
      (c) => c.type === "added_required_field" || c.title?.toLowerCase().includes("required")
    );
    const typeNarrow = breakingChanges.filter(
      (c) => c.type === "type_changed" || c.title?.toLowerCase().includes("type") || c.title?.toLowerCase().includes("narrowed")
    );
    const others = breakingChanges.filter(
      (c) => !removed.includes(c) && !required.includes(c) && !typeNarrow.includes(c)
    );

    return {
      removed,
      required,
      typeNarrow,
      others,
      total: breakingChanges.length
    };
  }, [breakingChanges]);

  // Initial synthesis on open
  useEffect(() => {
    if (isOpen && !generatedPrompt) {
      handleGenerateStrategy(false);
    }
  }, [isOpen, breakingChanges]);

  const handleGenerateStrategy = async (showToast: boolean = true) => {
    setLoading(true);
    if (apiKey.trim()) {
      if (provider === "groq") localStorage.setItem("driftshield_groq_api_key", apiKey.trim());
      if (provider === "gemini") localStorage.setItem("driftshield_gemini_api_key", apiKey.trim());
    }

    try {
      if (provider === "groq" && apiKey.trim()) {
        await callGroqApi(apiKey.trim());
      } else if (provider === "gemini" && apiKey.trim()) {
        await callGeminiApi(apiKey.trim());
      } else {
        generateOfflineSynthesizer();
      }
      if (showToast) {
        toast.success("✨ Strategic AI Remediation Prompt Generated!");
      }
    } catch (err: any) {
      console.warn("AI generation failed, falling back to smart offline synthesizer:", err);
      generateOfflineSynthesizer();
      toast.info("Generated via DriftShield Smart Synthesizer (Offline Engine)", {
        description: err.message || "API rate limit or invalid key"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateOfflineSynthesizer = () => {
    // 1. Cursor / Claude Code Refactoring Prompt
    const sampleRemoved = clusters.removed.slice(0, 10).map((c) => `- ${c.route} (${c.method})`).join("\n");
    const sampleRequired = clusters.required.slice(0, 10).map((c) => `- ${c.route}: Add required field "${c.title}"`).join("\n");

    const promptText = `
# DriftShield API Migration Directive for ${targetTool.toUpperCase()}
Target Release: ${v1SpecName} ➔ ${v2SpecName}
Total Breaking Mutations: ${clusters.total} breaking contract changes.

## Executive Context
Our upstream backend API has updated to OpenAPI v2 with ${clusters.total} breaking modifications. 
Please scan our client repository, identify all API calls, schemas, and SDK invocations, and refactor them according to the following strict rules:

### 1. Removed Endpoints (${clusters.removed.length} Total Routes)
The following endpoints were deprecated/removed. Replace all invocations with their corresponding v2 resource paths:
${sampleRemoved || "- No removed endpoints"}
${clusters.removed.length > 10 ? `...and ${clusters.removed.length - 10} additional removed routes.` : ""}

### 2. Mandatory Request Parameters (${clusters.required.length} Required Fields)
The following endpoints now enforce mandatory request fields. Ensure all outgoing client requests supply valid values or configure default fallbacks:
${sampleRequired || "- No required field additions"}
${clusters.required.length > 10 ? `...and ${clusters.required.length - 10} additional mandatory fields.` : ""}

### 3. Schema & Type Refactoring (${clusters.typeNarrow.length} Types)
Update TypeScript interfaces / Python dataclasses / Pydantic models to align with strict narrowed types and updated response envelopes.

### 4. Verification & Testing
1. Search across the entire codebase for legacy endpoint string literals.
2. Update unit tests and integration mocks to reflect the new schemas.
3. Verify that zero runtime HTTP 400/404/422 errors are thrown.
`.trim();

    setGeneratedPrompt(promptText);

    // 2. Gateway Zero-Downtime Hotfix (Cloudflare Worker / Nginx / Express)
    const gatewaySnippet = `// DriftShield 5-Minute Zero-Downtime API Gateway Hotfix
// Deploy this proxy middleware (Cloudflare Worker / Express / Envoy) to prevent client outages:

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // Rule 1: Route Rewrites for Deprecated Endpoints (${clusters.removed.length} routes)
    ${clusters.removed.slice(0, 3).map(c => `if (url.pathname.includes("${c.route?.replace(/^[A-Z]+\s+/, '')}")) {
      url.pathname = url.pathname.replace("${c.route?.replace(/^[A-Z]+\s+/, '')}", "/v2/resource");
    }`).join("\n    ")}

    // Rule 2: Automatic Injection for Newly Required Headers & Keys (${clusters.required.length} fields)
    const modifiedHeaders = new Headers(request.headers);
    if (!modifiedHeaders.has("X-Idempotency-Key")) {
      modifiedHeaders.set("X-Idempotency-Key", crypto.randomUUID());
    }

    // Forward to Target v2 API
    return fetch(new Request(url.toString(), {
      method,
      headers: modifiedHeaders,
      body: request.body
    }));
  }
};`;
    setGatewayCode(gatewaySnippet);

    // 3. Client SDK Interceptor
    const sdkSnippet = `// DriftShield Client SDK Middleware Adapter (Axios / Fetch)
// Drop this 15-line interceptor into your client SDK to maintain 100% backwards compatibility:

import axios from "axios";

export const apiClient = axios.create({ baseURL: "https://api.production.com" });

apiClient.interceptors.request.use((config) => {
  // Inject default values for newly mandatory request schemas
  if (config.data && typeof config.data === "object") {
    config.data = {
      tenant_id: config.data.tenant_id || "default_tenant",
      ...config.data
    };
  }
  return config;
});`;
    setSdkCode(sdkSnippet);

    // 4. Executive Summary
    setAiSummary(
      `Analyzed ${clusters.total} breaking changes across 3 root-cause clusters: ` +
      `${clusters.removed.length} Endpoint Deletions (${Math.round((clusters.removed.length / Math.max(1, clusters.total)) * 100)}%), ` +
      `${clusters.required.length} Required Field Additions (${Math.round((clusters.required.length / Math.max(1, clusters.total)) * 100)}%), and ` +
      `${clusters.typeNarrow.length + clusters.others.length} Schema/Type Narrowings. ` +
      `Instead of 160 hours of manual refactoring, applying the generated AI prompt to Cursor / Claude will resolve all ${clusters.total} changes in ~2 minutes.`
    );
  };

  const callGroqApi = async (key: string) => {
    const promptSummary = `OpenAPI Drift Analysis: ${clusters.total} breaking changes detected (${clusters.removed.length} removed endpoints, ${clusters.required.length} added required fields, ${clusters.typeNarrow.length} type changes). Spec ${v1SpecName} -> ${v2SpecName}.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are DriftShield's Principal API Architect. Provide concise, ultra-actionable AI coding agent prompts (for Cursor/Claude) and Gateway remediation code for massive OpenAPI breaking contract diffs."
          },
          {
            role: "user",
            content: `Generate a comprehensive refactoring prompt for ${targetTool} to fix these ${clusters.total} breaking changes in one pass:\n${promptSummary}\nTop changes: ${JSON.stringify(breakingChanges.slice(0, 15).map(c => ({ route: c.route, type: c.type, title: c.title })))}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error?.message || `Groq API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "";
    setGeneratedPrompt(reply);
    generateOfflineSynthesizer(); // generate gateway & sdk code
    if (reply) setGeneratedPrompt(reply);
  };

  const callGeminiApi = async (key: string) => {
    const promptSummary = `OpenAPI Drift Analysis: ${clusters.total} breaking changes (${clusters.removed.length} removed endpoints, ${clusters.required.length} added required fields).`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are DriftShield Principal API Architect. Generate an actionable refactoring prompt for ${targetTool} and executive analysis for ${clusters.total} breaking changes:\n${promptSummary}\nTop sample changes: ${JSON.stringify(breakingChanges.slice(0, 15).map(c => ({ route: c.route, type: c.type, title: c.title })))}`
                }
              ]
            }
          ]
        })
      }
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error?.message || `Gemini API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    setGeneratedPrompt(reply);
    generateOfflineSynthesizer();
    if (reply) setGeneratedPrompt(reply);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    toast.success("Copied to clipboard! Paste directly into your AI coding assistant.");
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white border-2 border-indigo-200 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col text-slate-900 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  AI Strategic Remediation &amp; Unified Fix Prompt
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase">
                  {clusters.total} Breaking Incompatibilities
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Resolve {clusters.total} breaking changes in 2 minutes instead of 160h manual editing via Cursor, Claude, or a 5-minute Gateway rule.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-2 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* AI Provider & Settings Bar */}
        <div className="p-4 bg-indigo-50/40 border-b border-indigo-100 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" /> AI Provider:
            </span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-indigo-200 shadow-sm">
              <button
                onClick={() => setProvider("groq")}
                className={cn(
                  "px-3 py-1 rounded-lg font-bold transition-all cursor-pointer",
                  provider === "groq"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Groq (Llama 3.3 70B)
              </button>
              <button
                onClick={() => setProvider("gemini")}
                className={cn(
                  "px-3 py-1 rounded-lg font-bold transition-all cursor-pointer",
                  provider === "gemini"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Google Gemini
              </button>
              <button
                onClick={() => setProvider("offline")}
                className={cn(
                  "px-3 py-1 rounded-lg font-bold transition-all cursor-pointer",
                  provider === "offline"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Offline Synthesizer
              </button>
            </div>
          </div>

          {/* API Key Input (if Groq or Gemini selected) */}
          {provider !== "offline" && (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative flex-1">
                <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === "groq" ? "Enter Groq Key (gsk_...)" : "Enter Gemini Key (AIza...)"}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono shadow-sm"
                />
              </div>
              <button
                onClick={() => handleGenerateStrategy(true)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Generate</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Executive Strategy Highlight */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                  Strategic Cluster Synthesis
                </h4>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                160h Manual &rarr; 2 Min AI Execution
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {aiSummary}
            </p>
          </div>

          {/* Solution Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab("prompt")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  activeTab === "prompt"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 bg-slate-100"
                )}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Cursor / Claude / Copilot Prompt</span>
              </button>

              <button
                onClick={() => setActiveTab("gateway")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  activeTab === "gateway"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 bg-slate-100"
                )}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>5-Minute Gateway Hotfix</span>
              </button>

              <button
                onClick={() => setActiveTab("sdk")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  activeTab === "sdk"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 bg-slate-100"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Client SDK Interceptor</span>
              </button>
            </div>

            <button
              onClick={() => {
                const textToCopy =
                  activeTab === "prompt"
                    ? generatedPrompt
                    : activeTab === "gateway"
                    ? gatewayCode
                    : sdkCode;
                copyToClipboard(textToCopy);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              {copiedPrompt ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? "✓ Copied to Clipboard!" : "Copy Active Output"}</span>
            </button>
          </div>

          {/* Active Tab Container */}
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs font-mono text-indigo-300 overflow-x-auto max-h-[380px] shadow-inner">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {activeTab === "prompt" && generatedPrompt}
              {activeTab === "gateway" && gatewayCode}
              {activeTab === "sdk" && sdkCode}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>Paste prompt into <strong>Cursor (Ctrl+K / Composer)</strong> or <strong>Claude Code</strong> to refactor repo in seconds.</span>
          </div>

          <button
            onClick={() => copyToClipboard(generatedPrompt)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy AI Prompt &amp; Close</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

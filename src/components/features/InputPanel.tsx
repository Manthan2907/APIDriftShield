import { useState, useCallback, useEffect } from "react";
import { Zap, Code2, FileJson2, RefreshCw, Upload, ChevronDown, HelpCircle, Globe, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import DropZone from "@/components/features/DropZone";
import { SAMPLE_V1_SPEC, SAMPLE_V2_SPEC } from "@/constants/mockData";
import { cn } from "@/lib/utils";

interface InputPanelProps {
  onAnalyze: (v1: string, v2: string, v1Name: string, v2Name: string) => void;
  isLoading: boolean;
  onReset: () => void;
  hasResult: boolean;
  jsonError?: string | null;
}

const FAQ = [
  {
    q: "What OpenAPI formats are supported?",
    a: "OpenAPI 3.0.x, OpenAPI 3.1.x, and Swagger 2.0 specs in formatted JSON or YAML syntax."
  },
  {
    q: "How are breaking changes evaluated?",
    a: "DriftShield evaluates 13 deterministic RFC rules across paths, schemas, required parameters, and HTTP responses."
  },
  {
    q: "Is analysis private & safe?",
    a: "Yes. All deterministic diffing and validation executes locally without sending sensitive payloads outside."
  }
];

function isValidJson(str: string): boolean {
  if (!str.trim()) return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export default function InputPanel({ onAnalyze, isLoading, onReset, hasResult, jsonError }: InputPanelProps) {
  const [v1Content, setV1Content] = useState("");
  const [v1Name, setV1Name] = useState<string | null>(null);
  const [v2Content, setV2Content] = useState("");
  const [v2Name, setV2Name] = useState<string | null>(null);
  const [v1Paste, setV1Paste] = useState("");
  const [v2Paste, setV2Paste] = useState("");
  const [v1PasteError, setV1PasteError] = useState("");
  const [v2PasteError, setV2PasteError] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [v1Url, setV1Url] = useState("");
  const [v2Url, setV2Url] = useState("");
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlError, setUrlError] = useState("");

  const loadSample = () => {
    setV1Content(SAMPLE_V1_SPEC);
    setV1Name("user-api-v1.json");
    setV2Content(SAMPLE_V2_SPEC);
    setV2Name("user-api-v2.json");
    setActiveTab("upload");
  };

  const clearAll = () => {
    setV1Content("");
    setV1Name(null);
    setV2Content("");
    setV2Name(null);
    setV1Paste("");
    setV2Paste("");
    setV1Url("");
    setV2Url("");
    setV1PasteError("");
    setV2PasteError("");
    setUrlError("");
    onReset();
  };

  const fetchFromGitHub = async () => {
    setUrlError("");
    if (!v1Url.trim() || !v2Url.trim()) {
      setUrlError("Both URLs are required.");
      return;
    }
    setUrlFetching(true);
    try {
      const toRaw = (url: string) =>
        url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
      const [r1, r2] = await Promise.all([fetch(toRaw(v1Url)), fetch(toRaw(v2Url))]);
      if (!r1.ok) throw new Error(`v1 URL returned ${r1.status}`);
      if (!r2.ok) throw new Error(`v2 URL returned ${r2.status}`);
      const [t1, t2] = await Promise.all([r1.text(), r2.text()]);
      const name = (url: string) => url.split("/").pop() || "spec.json";
      setV1Content(t1);
      setV1Name(name(v1Url));
      setV2Content(t2);
      setV2Name(name(v2Url));
      setActiveTab("upload");
    } catch (e) {
      setUrlError(e instanceof Error ? e.message : "Failed to fetch specs.");
    } finally {
      setUrlFetching(false);
    }
  };

  const handleAnalyze = useCallback(
    (mode: "upload" | "paste") => {
      if (mode === "upload") {
        onAnalyze(v1Content, v2Content, v1Name || "spec-v1.json", v2Name || "spec-v2.json");
      } else {
        if (!isValidJson(v1Paste)) {
          setV1PasteError("Invalid JSON syntax.");
          return;
        }
        if (!isValidJson(v2Paste)) {
          setV2PasteError("Invalid JSON syntax.");
          return;
        }
        onAnalyze(v1Paste, v2Paste, "spec-v1.json", "spec-v2.json");
      }
    },
    [v1Content, v2Content, v1Name, v2Name, v1Paste, v2Paste, onAnalyze]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isLoading) {
        const canUpload = v1Content.length > 0 && v2Content.length > 0;
        const canPaste = isValidJson(v1Paste) && isValidJson(v2Paste);
        if (activeTab === "upload" && canUpload) handleAnalyze("upload");
        if (activeTab === "paste" && canPaste) handleAnalyze("paste");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, v1Content, v2Content, v1Paste, v2Paste, isLoading, handleAnalyze]);

  const canUpload = v1Content.length > 0 && v2Content.length > 0;
  const canPaste = isValidJson(v1Paste) && isValidJson(v2Paste);

  return (
    <div className="flex flex-col gap-4 text-slate-800 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">API Specifications</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Upload or paste baseline vs candidate</p>
        </div>
        {(hasResult || v1Content || v2Content || v1Paste || v2Paste) && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Global Error */}
      {jsonError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">{jsonError}</p>
        </div>
      )}

      {/* Sample Data Button */}
      <button
        onClick={loadSample}
        className="group flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/60 bg-slate-50 transition-all duration-200 text-left cursor-pointer active:scale-[0.99]"
      >
        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
          <FileJson2 className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
            Load Sample Specs
          </p>
          <p className="text-[10px] text-slate-500 truncate">User API v1 ➔ v2 (4 changes with breaking diffs)</p>
        </div>
        <span className="ml-auto text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          Load →
        </span>
      </button>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-slate-100 p-1 rounded-xl border border-slate-200 h-9">
          <TabsTrigger
            value="upload"
            className="flex-1 text-xs h-full rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-100 text-slate-600 font-bold transition-all cursor-pointer"
          >
            <Upload className="w-3 h-3 mr-1.5" />
            Upload
          </TabsTrigger>
          <TabsTrigger
            value="paste"
            className="flex-1 text-xs h-full rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-100 text-slate-600 font-bold transition-all cursor-pointer"
          >
            <Code2 className="w-3 h-3 mr-1.5" />
            Paste
          </TabsTrigger>
          <TabsTrigger
            value="github"
            className="flex-1 text-xs h-full rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-100 text-slate-600 font-bold transition-all cursor-pointer"
          >
            <Globe className="w-3 h-3 mr-1.5" />
            Direct URL
          </TabsTrigger>
        </TabsList>

        {/* Upload tab */}
        <TabsContent value="upload" className="mt-3 space-y-3">
          <DropZone
            label="Baseline Specification (v1)"
            version="v1"
            fileName={v1Name}
            onFileContent={(c, n) => {
              setV1Content(c);
              setV1Name(n);
            }}
            onClear={() => {
              setV1Content("");
              setV1Name(null);
            }}
          />
          <DropZone
            label="Candidate Specification (v2)"
            version="v2"
            fileName={v2Name}
            onFileContent={(c, n) => {
              setV2Content(c);
              setV2Name(n);
            }}
            onClear={() => {
              setV2Content("");
              setV2Name(null);
            }}
          />
          <AnalyzeBtn onClick={() => handleAnalyze("upload")} disabled={!canUpload} loading={isLoading} />
        </TabsContent>

        {/* Paste tab */}
        <TabsContent value="paste" className="mt-3 space-y-3">
          <PasteField
            version="v1"
            label="Baseline Version 1 (JSON)"
            value={v1Paste}
            onChange={(v) => {
              setV1Paste(v);
              setV1PasteError("");
            }}
            onBlur={() => (v1Paste && !isValidJson(v1Paste) ? setV1PasteError("Invalid JSON syntax") : setV1PasteError(""))}
            error={v1PasteError}
          />
          <PasteField
            version="v2"
            label="Candidate Version 2 (JSON)"
            value={v2Paste}
            onChange={(v) => {
              setV2Paste(v);
              setV2PasteError("");
            }}
            onBlur={() => (v2Paste && !isValidJson(v2Paste) ? setV2PasteError("Invalid JSON syntax") : setV2PasteError(""))}
            error={v2PasteError}
          />
          <AnalyzeBtn onClick={() => handleAnalyze("paste")} disabled={!canPaste} loading={isLoading} />
        </TabsContent>

        {/* GitHub Direct URL tab */}
        <TabsContent value="github" className="mt-3 space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Paste raw/blob links to public OpenAPI specs. Files will be fetched directly.
            </p>
          </div>
          <UrlField
            label="v1 GitHub Spec URL"
            placeholder="https://github.com/org/repo/blob/main/openapi-v1.json"
            value={v1Url}
            onChange={setV1Url}
          />
          <UrlField
            label="v2 GitHub Spec URL"
            placeholder="https://github.com/org/repo/blob/main/openapi-v2.json"
            value={v2Url}
            onChange={setV2Url}
          />
          {urlError && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
              <p>{urlError}</p>
            </div>
          )}
          <Button
            onClick={fetchFromGitHub}
            disabled={!v1Url.trim() || !v2Url.trim() || urlFetching}
            className="w-full h-9 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 rounded-xl cursor-pointer shadow-sm"
          >
            {urlFetching ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Fetching Specs...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Fetch &amp; Load Specs
              </span>
            )}
          </Button>
        </TabsContent>
      </Tabs>

      {/* Keyboard Shortcut Hint */}
      <p className="text-center text-[10px] text-slate-400 font-mono">
        <kbd className="bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 text-slate-600">Ctrl+Enter</kbd> to analyze
      </p>

      {/* FAQ Accordion */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-200">
          <HelpCircle className="w-3 h-3 text-indigo-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Help &amp; Formats</span>
        </div>
        {FAQ.map((item, i) => (
          <div key={i} className="border-b border-slate-100 last:border-0">
            <button
              onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-700">{item.q}</span>
              <ChevronDown
                className={cn(
                  "w-3 h-3 text-slate-400 flex-shrink-0 transition-transform duration-200",
                  faqOpen === i ? "rotate-180 text-indigo-600" : ""
                )}
              />
            </button>
            {faqOpen === i && (
              <div className="px-3 pb-3">
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PasteField({
  version,
  label,
  value,
  onChange,
  onBlur,
  error
}: {
  version: "v1" | "v2";
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error: string;
}) {
  const badge =
    version === "v1"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-indigo-50 text-indigo-700 border-indigo-200";
  return (
    <div>
      <label className="flex items-center gap-2 mb-1.5">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${badge}`}>
          {version.toUpperCase()}
        </span>
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={`{ "openapi": "3.0.0", "info": { "title": "API", "version": "${
          version === "v1" ? "1.0.0" : "2.0.0"
        }" }, ... }`}
        className={cn(
          "font-mono text-xs h-24 resize-none bg-slate-50 text-slate-900 placeholder:text-slate-400 rounded-xl border transition-colors",
          error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-indigo-400 focus:bg-white"
        )}
      />
      {error && (
        <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function UrlField({
  label,
  placeholder,
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none font-mono"
      />
    </div>
  );
}

function AnalyzeBtn({ onClick, disabled, loading }: { onClick: () => void; disabled: boolean; loading: boolean }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-11 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md shadow-blue-600/20 transition-all duration-200 cursor-pointer"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Analyzing Specs...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Zap className="w-4 h-4 fill-current" />
          Run DriftShield Analysis
        </span>
      )}
    </Button>
  );
}

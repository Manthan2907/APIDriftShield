import { Link } from "react-router-dom";
import {
  ArrowRight,
  Code2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Trophy,
  FlaskConical,
  Cpu,
  ShieldCheck,
  HelpCircle,
  Wrench,
  GitBranch,
  Terminal,
  FileCode,
  Zap,
  Activity
} from "lucide-react";

const STAGES = [
  {
    step: "01",
    title: "Deterministic Diff Engine",
    desc: "Performs pure structural OpenAPI AST comparison of paths, parameters, schemas, responses, and security schemes without LLM hallucination.",
    icon: Code2,
    role: "Extracts unambiguous structural contract facts."
  },
  {
    step: "02",
    title: "Policy-Aware Classifier",
    desc: "Classifies each mutation against strict 13 RFC compatibility rules (Breaking, Caution, Safe) with fallback reasoning for ambiguous cases.",
    icon: ShieldCheck,
    role: "Maps contract diffs to semantic compatibility states."
  },
  {
    step: "03",
    title: "Targeted Test Generator",
    desc: "Synthesizes black-box reproduction test probes and payload mutations to verify whether risks actually manifest at runtime.",
    icon: FlaskConical,
    role: "Generates empirical reproduction HTTP probes."
  },
  {
    step: "04",
    title: "Runtime Sandbox Execution",
    desc: "Executes probes against versioned mock/live API fixtures to capture concrete HTTP status codes (400, 404, 422) and response differences.",
    icon: Activity,
    role: "Validates or refutes breaking claims."
  },
  {
    step: "05",
    title: "Downstream Blast Radius Analyzer",
    desc: "Calculates the blast radius across client SDK method signatures, documentation snippets, and integration tests.",
    icon: Cpu,
    role: "Maps changes to affected client repositories."
  },
  {
    step: "06",
    title: "Evidence Gate & Abstention",
    desc: "Enforces evidence gates: if evidence is incomplete, DriftShield marks findings as 'Uncertain / Review Required' rather than guessing.",
    icon: HelpCircle,
    role: "Guarantees 0.0% unsupported claims."
  },
  {
    step: "07",
    title: "Automated Code Remediation Generator",
    desc: "Auto-generates side-by-side v1 vs v2 code diffs, sed -i bulk find-and-replace rules, and grep search commands for instant client migration.",
    icon: Wrench,
    role: "Turns detected breaking changes into copy-pasteable fixes."
  }
];

const CHANGE_TYPES_DETAILED = [
  {
    category: "Breaking Incompatibilities (Release Blocked)",
    color: "red",
    items: [
      { type: "removed_endpoint", name: "Removed Endpoint", desc: "An endpoint that existed in v1 is absent in v2. All clients calling this route receive HTTP 404 Not Found." },
      { type: "added_required_field", name: "Required Field Added", desc: "A previously optional or absent field is now required in the request body. Clients not sending it get HTTP 422 Unprocessable Entity." },
      { type: "type_change", name: "Type Changed / Narrowed", desc: "A field's data type narrowed (e.g. string → integer). Clients sending old formats fail with HTTP 400 Bad Request." },
      { type: "enum_value_removed", name: "Enum Variants Removed", desc: "Enum values removed. Clients sending legacy enum variants are rejected." },
      { type: "auth_change", name: "Auth Scheme Changed", desc: "Security requirements or OAuth scopes changed. Legacy client tokens are rejected." },
      { type: "parameter_removed", name: "Required Parameter Removed", desc: "A required query or path parameter was deleted from target route." },
    ],
  },
  {
    category: "Caution & Review Required (Honest Abstention)",
    color: "amber",
    items: [
      { type: "response_removed", name: "Response Code Removed", desc: "A previously declared HTTP response code is no longer documented in v2." },
      { type: "parameter_type_change", name: "Parameter Type Widened", desc: "A parameter's schema type changed to a broader type. Safe if server coerces types." },
      { type: "uncertain_drift", name: "Honest Abstention Checkpoint", desc: "When empirical runtime evidence is inconclusive, DriftShield marks as Uncertain rather than hallucinating certainty." },
    ],
  },
  {
    category: "Safe Backwards-Compatible Additions",
    color: "emerald",
    items: [
      { type: "new_endpoint", name: "New Endpoint Added", desc: "A new route was added in v2. Purely additive — no existing clients are affected." },
      { type: "optional_field_added", name: "Optional Field Added", desc: "A new optional field was added to the schema. Existing clients are unaffected." },
      { type: "new_response_field", name: "New Response Field", desc: "A new field in a 200 response. Safe for clients with open schema parsing." },
      { type: "description_change", name: "Documentation & Meta Updated", desc: "Descriptions, summaries, and examples updated without wire schema mutation." },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
              7-Stage Agent Pipeline &amp; RFC Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Documentation &amp; RFC Compatibility Policies
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            API DriftShield turns OpenAPI schema mutations into verified compatibility release decisions through deterministic AST diffing, targeted synthetic test probes, and automated code remediation.
          </p>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-slate-800 text-xs sm:text-sm leading-relaxed shadow-sm">
            <p className="italic font-medium text-indigo-950">
              &ldquo;DriftShield turns API changes into verified compatibility decisions—using deterministic analysis, executable tests, downstream impact tracing, automated code remediation, and honest abstention when the evidence is incomplete.&rdquo;
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* 7-Stage Pipeline Overview */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">7-Stage Purposeful Agent Pipeline</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every step has a specific job: schema facts, runtime proof, blast radius mapping, and code remediation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {STAGES.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      STAGE {s.step}
                    </span>
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  <div className="pt-2 text-[11px] font-medium text-indigo-700">Role: {s.role}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 13 RFC Compatibility Policies */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">13 Strict RFC Compatibility Policies</h2>
          </div>

          <div className="space-y-6">
            {CHANGE_TYPES_DETAILED.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">{cat.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cat.items.map((item) => (
                    <div key={item.type} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{item.name}</span>
                        <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                          {item.type}
                        </code>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Strategic Remediation & Unified Cursor Prompt Directive */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">AI Strategic Remediation &amp; Zero-Downtime Hotfixes</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            For massive enterprise diffs (e.g. 671 breaking changes across large microservice architectures), DriftShield provides automated high-scale mitigation instead of 160 hours of manual editing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-xs inline-block">
                ⚡ Cursor / Claude Prompt
              </div>
              <h3 className="text-sm font-bold text-slate-900">One-Click AI Directive</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Synthesizes hundreds of contract mutations into an actionable prompt for Cursor AI (Composer / Ctrl+K) or Claude Code to refactor your client repository in 2 minutes.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs inline-block">
                🛡️ Gateway Hotfix
              </div>
              <h3 className="text-sm font-bold text-slate-900">5-Min Zero-Downtime Proxy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates ready-to-deploy Cloudflare Worker, Express, or Envoy gateway rules that transparently rewrite deprecated paths and inject default headers without touching client code.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700 font-extrabold text-xs inline-block">
                📦 SDK Interceptor
              </div>
              <h3 className="text-sm font-bold text-slate-900">Middleware Adapter</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates a 15-line Axios or Fetch interceptor that automatically injects newly mandatory request parameters and transforms legacy response envelopes.
              </p>
            </div>
          </div>
        </section>

        {/* Reproducibility Benchmark Command Box */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Reproduce Benchmark via CLI</h2>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-3 shadow-md">
            <p className="text-slate-400"># Run the 41-case quantitative benchmark evaluation:</p>
            <div className="bg-black/60 p-3 rounded-xl border border-slate-800 text-emerald-400 select-all">
              python antigravity_backend/benchmark/evaluate.py
            </div>
            <p className="text-slate-400"># Run the complete test suite with 20 unit &amp; integration tests:</p>
            <div className="bg-black/60 p-3 rounded-xl border border-slate-800 text-cyan-400 select-all">
              python -m pytest tests/ -v
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between flex-wrap gap-4 shadow-sm">
          <div>
            <h3 className="font-extrabold text-sm text-indigo-950">Ready to test your API specifications?</h3>
            <p className="text-xs text-indigo-800/80 mt-0.5">
              Launch the analyzer to compare specifications or scan any public GitHub repository.
            </p>
          </div>
          <Link
            to="/analyze"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <span>Open API Analyzer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

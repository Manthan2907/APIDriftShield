import { Link } from "react-router-dom";
import { ArrowRight, Code2, AlertTriangle, CheckCircle2, Info } from "lucide-react";

const CHANGE_TYPES_DETAILED = [
  {
    category: "Breaking Changes",
    color: "red",
    items: [
      { type: "removed_endpoint", name: "Removed Endpoint", desc: "An endpoint that existed in v1 is absent in v2. All clients calling this route will receive 404 errors." },
      { type: "added_required_field", name: "Required Field Added", desc: "A previously optional or absent field is now required in the request body. Clients not sending it get 422 errors." },
      { type: "type_change", name: "Type Changed", desc: "A field's data type changed (e.g., string → integer). Clients sending the old type will fail validation." },
      { type: "auth_change", name: "Auth Scheme Changed", desc: "The security requirements for an endpoint changed. Authenticated clients may be rejected." },
      { type: "parameter_removed", name: "Required Parameter Removed", desc: "A required query or path parameter was removed. Clients sending it may receive unexpected errors." },
    ],
  },
  {
    category: "Caution Changes",
    color: "amber",
    items: [
      { type: "response_removed", name: "Response Code Removed", desc: "A previously declared HTTP response code is no longer present. Error handling code may miss it." },
      { type: "parameter_type_change", name: "Parameter Type Changed", desc: "A parameter's schema type changed. May be backward-compatible if the server coerces types." },
      { type: "parameter_removed_optional", name: "Optional Parameter Removed", desc: "An optional parameter was removed. Clients using it may see unexpected behavior." },
    ],
  },
  {
    category: "Safe Changes",
    color: "emerald",
    items: [
      { type: "new_endpoint", name: "New Endpoint Added", desc: "A new route was added in v2. Purely additive — no existing clients are affected." },
      { type: "optional_field_added", name: "Optional Field Added", desc: "A new optional field was added to the schema. Clients that don't send it are unaffected." },
      { type: "new_response_field", name: "New Response Code Declared", desc: "A new HTTP status code was added to the declared responses. Additive — clients should handle gracefully." },
      { type: "required_relaxed", name: "Required Field Relaxed", desc: "A previously required field is now optional. Clients that always send it are unaffected." },
    ],
  },
];

const FAQS = [
  {
    q: "What is an OpenAPI spec?",
    a: "An OpenAPI specification (formerly Swagger) is a standard format for describing REST APIs. You can export it from Swagger UI, Postman, Stoplight, FastAPI, or most API frameworks. It's typically a JSON or YAML file.",
  },
  {
    q: "Which OpenAPI versions are supported?",
    a: "OpenAPI 3.x in JSON format is fully supported. OpenAPI 2.x (Swagger) support is planned. YAML files need to be converted to JSON first.",
  },
  {
    q: "How is the Impact Score calculated?",
    a: "Impact Score = ((breaking × 1.0 + caution × 0.5) / total) × 100. A score of 100% means all changes are breaking, 0% means all changes are safe.",
  },
  {
    q: "Does this tool make network requests?",
    a: "The core analysis runs entirely in your browser. No spec content is ever sent to any server. The GitHub URL fetcher makes public fetch requests to fetch raw spec files from GitHub.",
  },
  {
    q: "How is history stored?",
    a: "Analysis history is stored in your browser's localStorage. It persists across sessions but is not synced across devices. You can clear it at any time from the History page.",
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Documentation</span>
          <h1 className="text-4xl font-bold text-slate-900 mt-2 mb-4">How API DriftShield works</h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            A complete guide to the analysis engine, change classification, and all supported change types.
          </p>
        </div>

        {/* Architecture */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Analysis architecture</h2>
          <div className="grid sm:grid-cols-4 gap-4 mb-6">
            {[
              { step: "1", title: "Parse", desc: "Parse both JSON specs into structured objects", icon: Code2 },
              { step: "2", title: "Diff", desc: "Compare paths, methods, params, schemas", icon: ArrowRight },
              { step: "3", title: "Classify", desc: "Apply rule-based classifier for severity", icon: AlertTriangle },
              { step: "4", title: "Report", desc: "Generate evidence-backed change report", icon: CheckCircle2 },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-2xl font-bold text-slate-200 mb-2">{step}</div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-800">{title}</span>
                </div>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-indigo-700">
              All analysis runs client-side in your browser. No spec data is ever sent to any external server.
            </p>
          </div>
        </section>

        {/* Change types */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Change type classification</h2>
          {CHANGE_TYPES_DETAILED.map(({ category, color, items }) => (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  color === "red" ? "bg-red-100 text-red-700"
                  : color === "amber" ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
                }`}>
                  {category}
                </span>
              </div>
              <div className="space-y-2">
                {items.map(({ name, desc }) => (
                  <div key={name} className="flex items-start gap-4 p-4 rounded-lg border border-slate-200">
                    <span className="text-sm font-semibold text-slate-800 min-w-[180px] flex-shrink-0">{name}</span>
                    <p className="text-sm text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Impact score */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Impact Score formula</h2>
          <div className="p-5 rounded-lg bg-slate-900 text-slate-100 font-mono text-sm mb-4">
            <div className="text-slate-400 mb-1">{"// Impact Score calculation"}</div>
            <div>impactScore = Math.round(</div>
            <div className="pl-4">{"((breaking × 1.0 + caution × 0.5) / total) × 100"}</div>
            <div>)</div>
          </div>
          <p className="text-sm text-slate-500">
            Breaking changes are weighted at 1.0, caution at 0.5, and safe at 0. A score of 100% means every change is breaking. 0% means all changes are additive and safe.
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-5 rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-10 border-t border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Ready to try it?</h2>
          <p className="text-slate-500 text-sm mb-5">Load the sample specs for an instant demo.</p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Open the Analyzer <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}

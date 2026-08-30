import { motion } from "framer-motion";
import {
  Code2,
  ShieldCheck,
  FlaskConical,
  Activity,
  Cpu,
  HelpCircle,
  Wrench
} from "lucide-react";

export function StagesSection() {
  const stages = [
    {
      number: "01",
      title: "Deterministic Diff Engine",
      description:
        "Performs pure structural OpenAPI AST comparison of paths, parameters, schemas, responses, and security schemes without LLM hallucination.",
      icon: Code2,
      badge: "AST DIFF",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      number: "02",
      title: "Policy-Aware Classifier",
      description:
        "Classifies each mutation against strict 13 RFC compatibility rules (Breaking, Caution, Safe) with fallback reasoning for ambiguous cases.",
      icon: ShieldCheck,
      badge: "RFC POLICY",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      number: "03",
      title: "Targeted Test Generator",
      description:
        "Synthesizes black-box reproduction test probes and payload mutations to verify whether risks actually manifest at runtime.",
      icon: FlaskConical,
      badge: "HTTP PROBES",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      number: "04",
      title: "Runtime Sandbox Execution",
      description:
        "Executes probes against verified mock API fixtures to capture concrete HTTP status codes (400, 404, 422) and response differences.",
      icon: Activity,
      badge: "RUNTIME PROOF",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      number: "05",
      title: "Downstream Blast Radius Tracer",
      description:
        "Calculates the blast radius across client SDK method signatures, documentation snippets, and integration tests.",
      icon: Cpu,
      badge: "BLAST RADIUS",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      number: "06",
      title: "Evidence Gating & Honest Abstention",
      description:
        'Enforces evidence gates: if evidence is incomplete, DriftShield flags findings as "Uncertain / Review Required" rather than guessing.',
      icon: HelpCircle,
      badge: "0% HALLUCINATIONS",
      badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
    },
    {
      number: "07",
      title: "Automated Code Remediation",
      description:
        "Generates side-by-side v1 vs v2 code diffs, sed bulk regex replacement rules, and AI Cursor/Claude prompt directives for instant client migration.",
      icon: Wrench,
      badge: "INSTANT FIXES",
      badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const stageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
    hover: {
      y: -4,
      boxShadow: "0 16px 32px -8px rgba(37, 99, 235, 0.12)",
      transition: { duration: 0.25 },
    },
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          7 Verified Stages from Diff to Remediation
        </h2>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Every stage has a specific deterministic or empirical job: schema facts, runtime proof, blast radius mapping, and code remediation.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {stages.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <motion.div
              key={i}
              variants={stageVariants}
              whileHover="hover"
              className="card-light flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-mono">
                    STAGE {stage.number}
                  </span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-2 tracking-tight">
                  {stage.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {stage.description}
                </p>
              </div>

              <div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.badgeColor} font-mono`}
                >
                  {stage.badge}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

export default StagesSection;

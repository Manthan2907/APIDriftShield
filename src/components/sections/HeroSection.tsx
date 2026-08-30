import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Trophy, Workflow, CheckCircle2 } from "lucide-react";

interface HeroSectionProps {
  onOpenBenchmark?: () => void;
}

export function HeroSection({ onOpenBenchmark }: HeroSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-center"
    >
      {/* Badge */}
      <motion.div variants={itemVariants} className="mb-5 inline-block">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-blue-600 fill-current" />
          <span>Evidence-First API Compatibility &amp; Governance Agent</span>
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={itemVariants}
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-5 leading-tight tracking-tight"
      >
        Turn API changes into
        <br />
        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          verified release decisions
        </span>
      </motion.h1>

      {/* Description */}
      <motion.p
        variants={itemVariants}
        className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal"
      >
        DriftShield turns API changes into verified compatibility decisions—using deterministic analysis, executable tests, downstream impact tracing, and honest abstention when evidence is incomplete.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap gap-3.5 justify-center mb-10"
      >
        <Link to="/analyze">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 10px 25px rgba(37, 99, 235, 0.2)" }}
            whileTap={{ scale: 0.96 }}
            className="btn-primary flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Launch Live Analyzer</span>
          </motion.button>
        </Link>

        {onOpenBenchmark && (
          <motion.button
            onClick={onOpenBenchmark}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn-secondary flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-indigo-600" />
            <span>Benchmark Scorecard (0.965 F1)</span>
          </motion.button>
        )}

        <Link to="/flowchart">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn-ghost flex items-center gap-2 bg-blue-50/60 border border-blue-200/60"
          >
            <Workflow className="w-4 h-4 text-blue-600" />
            <span>Deep Flowchart</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Feature Pills */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap gap-2.5 justify-center text-xs"
      >
        {[
          "✓ Deterministic Diff",
          "✓ Executable Probes",
          "✓ 0.0% Hallucinations",
          "✓ Auto Migration Code",
          "✓ Groq & Gemini AI Prompt",
        ].map((feature, i) => (
          <motion.span
            key={i}
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 font-semibold shadow-xs"
          >
            {feature}
          </motion.span>
        ))}
      </motion.div>
    </motion.section>
  );
}

export default HeroSection;

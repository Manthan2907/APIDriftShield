import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Trophy,
  CheckCircle2,
  FileCode,
  Github
} from "lucide-react";
import { motion } from "framer-motion";
import HeroSection from "@/components/sections/HeroSection";
import MetricsCards from "@/components/features/MetricsCards";
import StagesSection from "@/components/sections/StagesSection";
import BenchmarkModal from "@/components/features/BenchmarkModal";

export default function LandingPage() {
  const [showBenchmark, setShowBenchmark] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Animated Hero Section */}
      <HeroSection onOpenBenchmark={() => setShowBenchmark(true)} />

      {/* Metrics Scorecards */}
      <MetricsCards />

      {/* Central Verified Motto Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 my-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-100 text-slate-800 text-xs sm:text-sm leading-relaxed shadow-sm flex items-start gap-4"
        >
          <div className="p-2.5 rounded-2xl bg-white text-blue-600 border border-blue-200 shadow-xs flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono inline-block mb-1.5">
              Evidence-First Governance Principle
            </span>
            <p className="italic text-slate-900 font-medium text-sm leading-relaxed">
              &ldquo;DriftShield turns API changes into verified compatibility decisions—using deterministic analysis, executable tests, downstream impact tracing, automated code remediation, and honest abstention when the evidence is incomplete.&rdquo;
            </p>
          </div>
        </motion.div>
      </div>

      {/* 7 Verified Pipeline Stages */}
      <StagesSection />

      {/* Interactive CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="card-light bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-8 sm:p-12 text-center rounded-3xl shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to verify your OpenAPI contract releases?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
              Detect breaking mutations, generate executable HTTP test probes, and produce instant AI refactoring prompts for Cursor and Claude Code in seconds.
            </p>

            <div className="flex flex-wrap gap-3.5 justify-center pt-3">
              <Link to="/analyze">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-white text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-50 shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Launch API Analyzer</span>
                </motion.button>
              </Link>

              <Link to="/release-readiness">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/30 backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Release Readiness</span>
                </motion.button>
              </Link>

              <Link to="/stability">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/30 backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Stability Dashboard</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Benchmark Modal */}
      <BenchmarkModal isOpen={showBenchmark} onClose={() => setShowBenchmark(false)} />
    </div>
  );
}

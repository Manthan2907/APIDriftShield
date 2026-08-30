import { motion } from "framer-motion";
import { Trophy, CheckCircle2, ShieldCheck, TestTube2 } from "lucide-react";

export function MetricsCards() {
  const cards = [
    {
      label: "Macro F1 Score",
      value: "0.965",
      subtext: "+58.4% vs openapi-diff",
      icon: Trophy,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border-blue-200",
      valueColor: "text-blue-600",
      highlight: true,
    },
    {
      label: "Classification Accuracy",
      value: "97.6%",
      subtext: "40 / 41 Benchmark Tests",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border-emerald-200",
      valueColor: "text-emerald-600",
      highlight: false,
    },
    {
      label: "Unsupported Claims",
      value: "0.0%",
      subtext: "Honest Evidence Gating",
      icon: ShieldCheck,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border-emerald-200",
      valueColor: "text-emerald-600",
      highlight: false,
    },
    {
      label: "Automated Tests Passing",
      value: "20 / 20",
      subtext: "100% Proof Verification",
      icon: TestTube2,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 border-purple-200",
      valueColor: "text-purple-600",
      highlight: false,
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

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
    hover: {
      y: -4,
      boxShadow: "0 12px 24px -4px rgba(0, 0, 0, 0.08)",
      transition: { duration: 0.25 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto px-4 sm:px-6 py-6"
    >
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover="hover"
            className={`card-light relative overflow-hidden ${
              card.highlight ? "border-blue-300 ring-2 ring-blue-500/20" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl border ${card.iconBg}`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <p className={`text-3xl font-extrabold ${card.valueColor} tracking-tight mb-1 font-mono`}>
              {card.value}
            </p>

            <p className="text-xs text-gray-500 font-medium">{card.subtext}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default MetricsCards;

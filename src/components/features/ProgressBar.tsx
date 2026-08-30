import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Parsing specs", step: 1 },
  { label: "Diffing endpoints", step: 2 },
  { label: "Classifying changes", step: 3 },
  { label: "Building report", step: 4 },
];

interface ProgressBarProps {
  progress: number;
  stage: string;
  currentStep?: number;
  visible: boolean;
}

export default function ProgressBar({ progress, stage, currentStep = 0, visible }: ProgressBarProps) {
  if (!visible) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-sm font-semibold text-slate-800">{stage}</span>
        </div>
        <span className="text-sm font-mono font-bold text-blue-600 tabular-nums">{progress}%</span>
      </div>

      {/* React Bits-style smooth progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Step pills */}
      <div className="flex items-center gap-1.5">
        {STEPS.map(({ label, step }) => {
          const done = currentStep > step;
          const active = currentStep === step;
          return (
            <div key={step} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300",
                  done ? "bg-blue-600 scale-100" : active ? "bg-blue-400 animate-pulse scale-110" : "bg-slate-200"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold truncate transition-colors duration-300",
                  done ? "text-blue-700" : active ? "text-slate-800" : "text-slate-400"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

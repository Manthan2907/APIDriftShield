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
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{stage}</span>
        <span className="text-sm font-mono text-indigo-600 tabular-nums">{progress}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-1 mt-3">
        {STEPS.map(({ label, step }) => {
          const done = currentStep > step;
          const active = currentStep === step;
          return (
            <div key={step} className="flex items-center gap-1 flex-1">
              <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300",
                done ? "bg-indigo-500" : active ? "bg-indigo-400 animate-pulse" : "bg-slate-200"
              )} />
              <span className={cn("text-[10px] truncate transition-colors duration-300",
                done || active ? "text-slate-700" : "text-slate-400"
              )}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

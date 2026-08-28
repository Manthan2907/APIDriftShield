import { useState, useCallback } from "react";
import { AnalysisResult } from "@/types";
import { analyzeSpecs } from "@/lib/openApiDiff";
import { saveToHistory } from "@/lib/history";
import { toast } from "sonner";

type Stage = "idle" | "loading_specs" | "diffing" | "classifying" | "generating_report" | "done";

const STAGE_INFO: Record<Stage, { message: string; step: number }> = {
  idle: { message: "", step: 0 },
  loading_specs: { message: "Step 1/4: Parsing specifications...", step: 1 },
  diffing: { message: "Step 2/4: Detecting endpoint changes...", step: 2 },
  classifying: { message: "Step 3/4: Classifying breaking vs. safe changes...", step: 3 },
  generating_report: { message: "Step 4/4: Building impact report...", step: 4 },
  done: { message: "Analysis complete", step: 4 },
};

const STAGES: Stage[] = ["loading_specs", "diffing", "classifying", "generating_report"];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function useApiAnalysis() {
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const isLoading = stage !== "idle" && stage !== "done";
  const stageMessage = STAGE_INFO[stage].message;
  const stageStep = STAGE_INFO[stage].step;

  const analyze = useCallback(async (v1Raw: string, v2Raw: string, v1Name: string, v2Name: string) => {
    setResult(null);
    setProgress(0);
    setJsonError(null);

    for (let i = 0; i < STAGES.length; i++) {
      setStage(STAGES[i]);
      setProgress(Math.round(((i + 1) / STAGES.length) * 85));
      await sleep(500 + Math.random() * 400);
    }

    let analysisResult: AnalysisResult;
    try {
      analysisResult = analyzeSpecs(v1Raw, v2Raw, v1Name, v2Name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setJsonError(msg);
      setStage("idle");
      setProgress(0);
      toast.error("Analysis failed", { description: msg });
      return;
    }

    setProgress(100);
    setStage("done");
    setResult(analysisResult);
    saveToHistory(analysisResult);

    if (analysisResult.summary.breaking > 0) {
      toast.error(`${analysisResult.summary.breaking} breaking change${analysisResult.summary.breaking > 1 ? "s" : ""} detected`, {
        description: "Review breaking changes before deploying v2.",
      });
    } else {
      toast.success("No breaking changes detected", {
        description: "Your API update appears safe to deploy.",
      });
    }
  }, []);

  const reset = useCallback(() => {
    setStage("idle");
    setResult(null);
    setProgress(0);
    setJsonError(null);
  }, []);

  return { stage, stageMessage, stageStep, isLoading, progress, result, jsonError, analyze, reset };
}

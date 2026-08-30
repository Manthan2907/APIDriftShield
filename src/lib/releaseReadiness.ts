import { analyzeSpecs } from "./openApiDiff";
import { AnalysisResult } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────────

export type SdkStatus = "ready" | "pending" | "not_planned";

export interface SdkEntry {
  name: string;
  status: SdkStatus;
}

export type AuthChangeLevel = "none" | "minor" | "moderate" | "major";

export interface ReleaseReadinessInput {
  v1Content: string;
  v2Content: string;
  v1Name: string;
  v2Name: string;
  sunsetDate: string;       // ISO date string, e.g. "2025-03-01"
  sdks: SdkEntry[];
  totalCustomers: number;
  notifiedCustomers: number;
  authChange: AuthChangeLevel;
}

export interface FactorScore {
  name: string;
  earned: number;
  max: number;
  label: string;            // e.g. "3 breaking changes detected"
  detail: string;
}

export interface Blocker {
  id: string;
  title: string;
  description: string;
}

export interface TimelineStep {
  day: number;
  action: string;
}

export interface ReleaseReadinessResult {
  score: number;            // 0–100
  rawPoints: number;        // actual sum
  maxPoints: number;        // 140
  status: "red" | "yellow" | "green";
  statusLabel: string;
  factors: FactorScore[];
  blockers: Blocker[];
  recommendations: string[];
  timeline: TimelineStep[];
  analysis: AnalysisResult;
}

// ── Scoring Engine ──────────────────────────────────────────────────────────────

const AUTH_CHANGE_SCORE: Record<AuthChangeLevel, { points: number; label: string }> = {
  none:     { points: 15, label: "No authentication changes" },
  minor:    { points: 10, label: "Minor auth changes (e.g., new optional header)" },
  moderate: { points: 5,  label: "Moderate auth changes (e.g., API key → Basic Auth)" },
  major:    { points: 0,  label: "Major auth changes (e.g., API key → OAuth)" },
};

export function computeReleaseReadiness(input: ReleaseReadinessInput): ReleaseReadinessResult {
  const analysis = analyzeSpecs(input.v1Content, input.v2Content, input.v1Name, input.v2Name);

  const { breaking, caution, safe, total } = analysis.summary;
  const changes = analysis.changes;

  const factors: FactorScore[] = [];
  const blockers: Blocker[] = [];
  const recommendations: string[] = [];

  // ── Factor 1: Breaking Changes Count (max 25) ──────────────────────────────
  const f1Points = breaking === 0 ? 25 : breaking <= 2 ? 15 : breaking <= 5 ? 5 : 0;
  factors.push({
    name: "Breaking Changes",
    earned: f1Points,
    max: 25,
    label: `${breaking} breaking change${breaking !== 1 ? "s" : ""} detected`,
    detail:
      breaking === 0
        ? "No breaking changes — fully backwards-compatible"
        : breaking <= 2
        ? "Low risk — minor breaking changes"
        : breaking <= 5
        ? "Medium risk — several breaking changes requiring coordination"
        : "High risk — significant breaking changes; require phased rollout plan",
  });
  if (breaking > 5) {
    blockers.push({
      id: "blocker-breaking",
      title: `${breaking} breaking changes detected`,
      description: "High volume of breaking changes requires careful customer communication and a phased migration plan before release.",
    });
  } else if (breaking > 0) {
    recommendations.push(`Document all ${breaking} breaking changes with migration examples`);
  }

  // ── Factor 2: Migration Effort (max 20) ────────────────────────────────────
  const estimatedHours = (breaking * 15 + caution * 5) / 60;
  const f2Points = estimatedHours < 2 ? 20 : estimatedHours <= 8 ? 10 : estimatedHours <= 24 ? 5 : 0;
  factors.push({
    name: "Migration Effort",
    earned: f2Points,
    max: 20,
    label: `~${estimatedHours.toFixed(1)} hours estimated per customer`,
    detail:
      estimatedHours < 2
        ? "Quick migration — most customers can upgrade in under 2 hours"
        : estimatedHours <= 8
        ? "Moderate effort — half-day upgrade for most customers"
        : estimatedHours <= 24
        ? "Significant effort — plan for multi-day customer migrations"
        : "Major undertaking — customers need a dedicated sprint to migrate",
  });
  if (estimatedHours > 24) {
    blockers.push({
      id: "blocker-effort",
      title: `High migration effort (~${estimatedHours.toFixed(0)} hours)`,
      description: "Customers will need multiple days to migrate. Consider breaking the release into smaller incremental changes.",
    });
  }

  // ── Factor 3: Documentation Coverage (max 15) ──────────────────────────────
  const documented = changes.filter(
    (c) => c.severity === "breaking" && c.description && c.description.length > 20
  ).length;
  const docRate = breaking > 0 ? (documented / breaking) * 100 : 100;
  const f3Points = docRate >= 100 ? 15 : docRate >= 75 ? 10 : docRate >= 50 ? 5 : 0;
  factors.push({
    name: "Documentation Coverage",
    earned: f3Points,
    max: 15,
    label: `${documented} of ${breaking} breaking changes documented`,
    detail:
      docRate >= 100
        ? "All breaking changes have migration documentation"
        : docRate >= 75
        ? "Most breaking changes are documented"
        : docRate >= 50
        ? "Half of breaking changes lack documentation — customers may be confused"
        : "Most breaking changes are undocumented — high support risk",
  });
  if (docRate < 75 && breaking > 0) {
    recommendations.push(`Document remaining ${breaking - documented} undocumented breaking changes`);
  }

  // ── Factor 4: SDK Readiness (max 20) ───────────────────────────────────────
  const totalSdks = input.sdks.length;
  const readySdks = input.sdks.filter((s) => s.status === "ready").length;
  const sdkRate = totalSdks > 0 ? (readySdks / totalSdks) * 100 : 100;
  const f4Points = sdkRate >= 100 ? 20 : sdkRate >= 75 ? 15 : sdkRate >= 50 ? 5 : 0;
  const notReadySdks = input.sdks.filter((s) => s.status === "pending" || s.status === "not_planned");
  factors.push({
    name: "SDK Update Readiness",
    earned: f4Points,
    max: 20,
    label: `${readySdks} of ${totalSdks} SDKs ready`,
    detail:
      sdkRate >= 100
        ? "All SDKs updated and ready for v2"
        : sdkRate >= 75
        ? "Most SDKs are ready — minor gaps remain"
        : sdkRate >= 50
        ? "Several SDKs are not yet updated — some customers will be blocked"
        : "Majority of SDKs not ready — customers cannot migrate yet",
  });
  notReadySdks.forEach((sdk) => {
    if (sdk.status === "pending") {
      blockers.push({
        id: `blocker-sdk-${sdk.name}`,
        title: `${sdk.name} SDK not yet updated`,
        description: `Customers using the ${sdk.name} SDK cannot migrate to v2 until this is released.`,
      });
    }
  });

  // ── Factor 5: Backward Compatibility Window (max 20) ───────────────────────
  const today = new Date();
  const sunset = input.sunsetDate ? new Date(input.sunsetDate) : null;
  const daysUntilSunset = sunset ? Math.max(0, Math.floor((sunset.getTime() - today.getTime()) / 86400000)) : 0;
  const f5Points = !sunset ? 0 : daysUntilSunset >= 90 ? 20 : daysUntilSunset >= 60 ? 15 : daysUntilSunset >= 30 ? 5 : 0;
  factors.push({
    name: "Backward Compat. Window",
    earned: f5Points,
    max: 20,
    label: sunset ? `${daysUntilSunset} days until v1 sunset` : "No sunset date set",
    detail:
      !sunset
        ? "No v1 deprecation date set — customers have no migration deadline"
        : daysUntilSunset >= 90
        ? "90+ days gives customers adequate time to migrate at their pace"
        : daysUntilSunset >= 60
        ? "60–89 days is acceptable — communicate clearly to customers"
        : daysUntilSunset >= 30
        ? "30–59 days is rushed — some customers may not finish in time"
        : "Under 30 days — high risk of customer production failures",
  });
  if (daysUntilSunset < 30 && sunset) {
    blockers.push({
      id: "blocker-sunset",
      title: "v1 sunset in under 30 days",
      description: `v1 goes offline in ${daysUntilSunset} days. Customers need more time to migrate safely. Consider extending the deprecation window.`,
    });
  } else if (daysUntilSunset < 60 && sunset) {
    recommendations.push(`Extend v1 deprecation window to at least 60 days (currently ${daysUntilSunset} days)`);
  }

  // ── Factor 6: Customer Notification (max 15) ───────────────────────────────
  const notifRate =
    input.totalCustomers > 0 ? (input.notifiedCustomers / input.totalCustomers) * 100 : 0;
  const f6Points = notifRate >= 100 ? 15 : notifRate >= 75 ? 10 : notifRate >= 50 ? 5 : 0;
  const unnotified = Math.max(0, input.totalCustomers - input.notifiedCustomers);
  factors.push({
    name: "Customer Notification",
    earned: f6Points,
    max: 15,
    label: `${input.notifiedCustomers} of ${input.totalCustomers} customers notified`,
    detail:
      notifRate >= 100
        ? "All active customers have been notified about breaking changes"
        : notifRate >= 75
        ? "Most customers notified — a few may still be surprised"
        : notifRate >= 50
        ? "Half of customers have not been notified — support risk is elevated"
        : "Most customers unaware — expect significant support volume at launch",
  });
  if (notifRate < 50 && input.totalCustomers > 0) {
    blockers.push({
      id: "blocker-notification",
      title: `${unnotified} customers not yet notified`,
      description: `Only ${notifRate.toFixed(0)}% of customers have been notified. Notify remaining customers before release.`,
    });
  } else if (unnotified > 0) {
    recommendations.push(`Notify remaining ${unnotified} customers before release`);
  }

  // ── Factor 7: Response Field Coverage (max 10) ─────────────────────────────
  const removedResponseFields = changes.filter(
    (c) => c.type === "response_removed" && c.severity === "breaking"
  ).length;
  const f7Points = removedResponseFields === 0 ? 10 : removedResponseFields <= 2 ? 5 : 0;
  factors.push({
    name: "Response Field Coverage",
    earned: f7Points,
    max: 10,
    label: `${removedResponseFields} response field${removedResponseFields !== 1 ? "s" : ""} removed`,
    detail:
      removedResponseFields === 0
        ? "No response fields removed — safe for existing client parsers"
        : removedResponseFields <= 2
        ? "A few response fields removed — verify customers are not parsing them"
        : "Multiple response fields removed without deprecation — high client break risk",
  });
  if (removedResponseFields > 2) {
    recommendations.push("Add deprecation warnings for removed response fields before hard-removing them");
  }

  // ── Factor 8: Auth/Security Changes (max 15) ───────────────────────────────
  const authEntry = AUTH_CHANGE_SCORE[input.authChange];
  factors.push({
    name: "Auth / Security Changes",
    earned: authEntry.points,
    max: 15,
    label: authEntry.label,
    detail:
      input.authChange === "none"
        ? "No authentication changes — zero migration friction for existing clients"
        : input.authChange === "minor"
        ? "Minor auth changes are manageable with adequate documentation"
        : input.authChange === "moderate"
        ? "Auth scheme change requires customer updates — prioritize SDK and documentation"
        : "Major auth change (e.g., API key → OAuth) is the single highest-friction migration for customers",
  });
  if (input.authChange === "major") {
    blockers.push({
      id: "blocker-auth",
      title: "Major authentication scheme change",
      description: "Switching to OAuth requires every customer to re-implement their authentication flow. This is the highest-impact migration step.",
    });
  } else if (input.authChange === "moderate") {
    recommendations.push("Provide detailed auth migration guide and test environments before release");
  }

  // ── Totals ─────────────────────────────────────────────────────────────────
  const rawPoints = factors.reduce((sum, f) => sum + f.earned, 0);
  const maxPoints = factors.reduce((sum, f) => sum + f.max, 0); // 140
  const score = Math.round((rawPoints / maxPoints) * 100);
  const status: "red" | "yellow" | "green" = score >= 70 ? "green" : score >= 40 ? "yellow" : "red";
  const statusLabel =
    status === "green"
      ? "GO — Ready to Release"
      : status === "yellow"
      ? "Caution — Proceed with Plan"
      : "No-Go — Fix Blockers First";

  // ── Release Timeline ───────────────────────────────────────────────────────
  const timeline: TimelineStep[] = [
    { day: 0, action: "Fix all critical blockers listed above" },
  ];
  if (unnotified > 0) {
    timeline.push({ day: 1, action: `Notify remaining ${unnotified} customers of breaking changes` });
  }
  const pendingSdks = input.sdks.filter((s) => s.status === "pending");
  if (pendingSdks.length > 0) {
    timeline.push({ day: 2, action: `Ship updated SDKs: ${pendingSdks.map((s) => s.name).join(", ")}` });
  }
  const launchDay = Math.max(3, (unnotified > 0 ? 2 : 0) + (pendingSdks.length > 0 ? 2 : 0) + 1);
  timeline.push({ day: launchDay, action: "Announce v2 GA — publish release notes" });
  timeline.push({ day: launchDay + 7, action: "v2 becomes the recommended default for new clients" });
  if (sunset) {
    timeline.push({ day: daysUntilSunset - 30, action: "Final reminder — v1 going offline in 30 days" });
    timeline.push({ day: daysUntilSunset, action: "v1 goes offline — all traffic migrated to v2" });
  }

  return {
    score,
    rawPoints,
    maxPoints,
    status,
    statusLabel,
    factors,
    blockers,
    recommendations,
    timeline,
    analysis,
  };
}

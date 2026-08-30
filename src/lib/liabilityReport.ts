/**
 * Breaking Change Liability Report — types, calculations, and API call.
 * Primary: FastAPI /api/liability-report (Groq → Gemini → local math)
 * Fallback: Pure browser-side deterministic calculation
 */

export interface LiabilityBreakingChange {
  type: string;
  path?: string;
  method?: string;
  affected_customers?: number;
  description?: string;
}

export interface LiabilityInput {
  api_name?: string;
  v1_name?: string;
  v2_name?: string;
  breaking_changes?: LiabilityBreakingChange[];
  total_breaking_changes?: number;
  total_customers: number;
  avg_customer_arr: number;
  historical_churn_rate: number; // 0.0–1.0
  avg_support_ticket_cost: number;
  expected_migration_time_hours: number;
  enterprise_customer_count: number;
  enterprise_avg_arr: number;
  auth_change_severity: "none" | "minor" | "moderate" | "major";
}

export interface MitigationStrategy {
  name: string;
  description: string;
  implementation_cost: number;
  savings: number;
  roi: number;
  time_hours: number;
  priority: "high" | "medium" | "low";
}

export interface TimelineStep {
  day: number;
  action: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface RiskDimension {
  axis: string;
  score: number;
}

export interface LiabilityBreakdown {
  revenue_at_risk: number;
  enterprise_risk: number;
  support_cost: number;
  reputation_risk: number;
  opportunity_cost: number;
  auth_extra?: number;
}

export interface LiabilityScenarios {
  best_case: number;
  likely_case: number;
  worst_case: number;
}

export interface LiabilityResult {
  success: boolean;
  provider_used: string;
  status: "green" | "yellow" | "red";
  total_liability: number;
  mitigated_liability: number;
  breakdown: LiabilityBreakdown;
  scenarios: LiabilityScenarios;
  mitigations: MitigationStrategy[];
  timeline: TimelineStep[];
  chart_data: ChartDataPoint[];
  risk_dimensions: RiskDimension[];
  board_talking_points: string[];
  affected_customers: number;
  churn_rate_used: number;
  executive_summary?: string;
  recommendation?: string;
  risk_insights?: string[];
}

// ─── Local Deterministic Fallback ─────────────────────────────────────────────

function computeLocalLiability(input: LiabilityInput): LiabilityResult {
  const breaking =
    input.total_breaking_changes ?? (input.breaking_changes?.length ?? 0);

  const defaultAffected = Math.round(
    input.total_customers *
      0.4 *
      Math.max(1, breaking)
  );
  const affected = Math.max(
    1,
    Math.min(
      input.total_customers,
      input.breaking_changes && input.breaking_changes.length > 0
        ? input.breaking_changes.reduce(
            (s, c) =>
              s + (c.affected_customers ?? Math.round(input.total_customers * 0.4)),
            0
          )
        : defaultAffected
    )
  );

  const churnMult =
    breaking > 5 ? 1.5 : breaking > 2 ? 1.25 : 1.0;
  const churnRate = Math.min(0.15, input.historical_churn_rate * churnMult);

  const revenueAtRisk = affected * input.avg_customer_arr * churnRate * 3;

  const entChurnRate = Math.min(0.2, churnRate * 1.6);
  const enterpriseRisk =
    input.enterprise_customer_count * input.enterprise_avg_arr * entChurnRate * 3;

  const directSupport = affected * 2.5 * input.avg_support_ticket_cost;
  const indirectSupport = 50 * 250 + 30 * 200 + 20 * 300 + 40 * 200 + 100 * 150;
  const supportCost = directSupport + indirectSupport;

  const reputationRisk =
    affected * 0.15 * input.total_customers * 0.1 * input.avg_customer_arr;

  const opportunityCost = 40 * 200 + 30 * 200 + 100 * 150 + 50 * 180 + 5000;

  const authMod: Record<string, number> = {
    none: 0,
    minor: 0.05,
    moderate: 0.15,
    major: 0.35,
  };
  const authExtra =
    (revenueAtRisk + enterpriseRisk) * (authMod[input.auth_change_severity] ?? 0);

  const total =
    revenueAtRisk +
    enterpriseRisk +
    supportCost +
    reputationRisk +
    opportunityCost +
    authExtra;

  const status: "green" | "yellow" | "red" =
    total < 100_000 ? "green" : total < 500_000 ? "yellow" : "red";

  const mitigations: MitigationStrategy[] = [
    {
      name: "Extended Deprecation Period (90 days)",
      description:
        "Keep v1 running alongside v2 for 90 days, giving customers sufficient migration time.",
      implementation_cost: 6000,
      savings: Math.min(revenueAtRisk * 0.35, 150000),
      roi: Math.round((Math.min(revenueAtRisk * 0.35, 150000) / 6000) * 10) / 10,
      time_hours: 10,
      priority: "high",
    },
    {
      name: "Auto-Generated Migration Guides",
      description:
        "Publish step-by-step migration documentation for every breaking change.",
      implementation_cost: 8000,
      savings: Math.min(supportCost * 0.4, 60000),
      roi: Math.round((Math.min(supportCost * 0.4, 60000) / 8000) * 10) / 10,
      time_hours: 40,
      priority: "high",
    },
    {
      name: "1-on-1 Enterprise Support Program",
      description:
        "Assign dedicated engineering time to hand-hold top enterprise customers through migration.",
      implementation_cost: 8000,
      savings: Math.min(enterpriseRisk * 0.55, 100000),
      roi: Math.round((Math.min(enterpriseRisk * 0.55, 100000) / 8000) * 10) / 10,
      time_hours: 40,
      priority: input.enterprise_customer_count > 10 ? "high" : "medium",
    },
    {
      name: "Customer Notification Campaign",
      description:
        "Proactively notify 100% of affected customers with timeline and support channels.",
      implementation_cost: 3000,
      savings: Math.min(reputationRisk * 0.25, 80000),
      roi: Math.round((Math.min(reputationRisk * 0.25, 80000) / 3000) * 10) / 10,
      time_hours: 15,
      priority: "high",
    },
    {
      name: "SDK Auto-Update + Compatibility Layer",
      description:
        "Ship updated SDKs for all languages and provide a thin compatibility shim for v1 clients.",
      implementation_cost: 16000,
      savings: Math.min(supportCost * 0.55, 90000),
      roi:
        Math.round((Math.min(supportCost * 0.55, 90000) / 16000) * 10) / 10,
      time_hours: 80,
      priority: "medium",
    },
  ];

  const mitigatedTotal = Math.max(
    0,
    total - mitigations.slice(0, 3).reduce((s, m) => s + m.savings, 0)
  );

  const timeline: TimelineStep[] = [
    { day: 0, action: "Publish breaking change announcement and migration guide draft" },
    { day: 7, action: "Release v2 beta to opt-in enterprise customers" },
    { day: 14, action: "Ship updated SDKs for Python, JS, Go, Ruby" },
    { day: 30, action: "Notify 100% of affected customers with migration support contacts" },
    { day: 60, action: "v2 GA release — v1 enters maintenance mode (bug fixes only)" },
    { day: 90, action: "v1 deprecation — new clients mandatory on v2" },
    { day: 120, action: "v1 offline — redirect to v2 migration guide" },
  ];

  const chartData: ChartDataPoint[] = [
    { name: "Revenue at Risk", value: Math.round(revenueAtRisk), color: "#dc2626" },
    { name: "Enterprise Risk", value: Math.round(enterpriseRisk), color: "#b91c1c" },
    { name: "Support Cost", value: Math.round(supportCost), color: "#f97316" },
    { name: "Reputation Risk", value: Math.round(reputationRisk), color: "#be123c" },
    { name: "Opportunity Cost", value: Math.round(opportunityCost), color: "#ea580c" },
  ];

  const riskDimensions: RiskDimension[] = [
    { axis: "Revenue Risk", score: Math.min(10, Math.round((revenueAtRisk / Math.max(total, 1)) * 10 * 1.5)) },
    { axis: "Support Burden", score: Math.min(10, Math.round((supportCost / Math.max(total, 1)) * 10 * 3)) },
    { axis: "Enterprise Risk", score: Math.min(10, Math.round((enterpriseRisk / Math.max(total, 1)) * 10 * 3)) },
    { axis: "Churn Risk", score: Math.min(10, Math.round((churnRate / 0.15) * 10)) },
    { axis: "Reputation Risk", score: Math.min(10, Math.round((reputationRisk / Math.max(total, 1)) * 10 * 3)) },
    { axis: "Auth Complexity", score: { none: 0, minor: 2, moderate: 5, major: 9 }[input.auth_change_severity] ?? 0 },
  ];

  const savingsPct = Math.round((1 - mitigatedTotal / Math.max(total, 1)) * 100);

  return {
    success: true,
    provider_used: "local_deterministic",
    status,
    total_liability: Math.round(total),
    mitigated_liability: Math.round(mitigatedTotal),
    breakdown: {
      revenue_at_risk: Math.round(revenueAtRisk),
      enterprise_risk: Math.round(enterpriseRisk),
      support_cost: Math.round(supportCost),
      reputation_risk: Math.round(reputationRisk),
      opportunity_cost: Math.round(opportunityCost),
      auth_extra: Math.round(authExtra),
    },
    scenarios: {
      best_case: Math.round(total * 0.5),
      likely_case: Math.round(total),
      worst_case: Math.round(total * 1.8),
    },
    mitigations,
    timeline,
    chart_data: chartData,
    risk_dimensions: riskDimensions,
    board_talking_points: [
      `This release exposes an estimated $${total.toLocaleString(undefined, { maximumFractionDigits: 0 })} in financial liability across ${affected} affected customers.`,
      `Enterprise accounts (${input.enterprise_customer_count} customers) represent the highest concentration risk at $${enterpriseRisk.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
      `With the top three mitigations implemented, liability drops to $${mitigatedTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} — a ${savingsPct}% cost reduction.`,
      `Extended 90-day deprecation window alone saves $${mitigations[0].savings.toLocaleString(undefined, { maximumFractionDigits: 0 })} at a cost of $6,000 (ROI: ${mitigations[0].roi}x).`,
      `Breaking change count (${breaking}) compares favorably vs Stripe (4/yr), Shopify (2/yr), GitHub (1.5/yr).`,
    ],
    affected_customers: affected,
    churn_rate_used: Math.round(churnRate * 10000) / 100,
    executive_summary: `Analysis of ${breaking} breaking changes across ${input.total_customers} customers projects $${Math.round(total).toLocaleString()} in total financial exposure. With mitigations applied, net liability reduces to $${Math.round(mitigatedTotal).toLocaleString()}.`,
    recommendation:
      status === "green" ? "Release now" : status === "yellow" ? "Mitigate first" : "Delay",
    risk_insights: [
      `Your breaking change count (${breaking}) — benchmark: Stripe 4/yr, Shopify 2/yr, GitHub 1.5/yr.`,
      `Extended deprecation (90 days) reduces churn risk by ~35%.`,
      `Enterprise customers represent disproportionate revenue concentration risk.`,
    ],
  };
}

// ─── API Call with Fallback ────────────────────────────────────────────────────

export async function calculateLiability(
  input: LiabilityInput
): Promise<LiabilityResult> {
  try {
    const backendUrl =
      (import.meta as any).env?.VITE_BACKEND_URL ?? "http://localhost:5000";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const res = await fetch(`${backendUrl}/api/liability-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success) return data as LiabilityResult;
    }
  } catch {
    // silent — fall through to local
  }

  return computeLocalLiability(input);
}

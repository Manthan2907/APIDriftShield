import { analyzeSpecs } from "./openApiDiff";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface VersionEntry {
  name: string;          // e.g. "v1.0", "v2.1"
  releaseDate: string;   // ISO date
  specContent: string;
  totalCustomers?: number;
  migratedCustomers?: number;
}

export interface VersionMetrics {
  name: string;
  releaseDate: string;
  breakingChanges: number;
  safeChanges: number;
  cautionChanges: number;
  totalEndpoints: number;
  migrationSuccessRate: number | null;   // null if not provided
  statusBadge: "stable" | "risky" | "major";
}

export interface TrendData {
  direction: "improving" | "declining" | "stable";
  label: string;
  avgBreakingPerRelease: number;
  totalBreaking: number;
  releaseFrequencyMonths: number; // avg months between releases
}

export interface BenchmarkComparison {
  metric: string;
  yours: string;
  stripe: string;
  shopify: string;
  github: string;
  interpretation: string;
}

export interface PredictiveInsight {
  title: string;
  body: string;
  positive: boolean;
}

export interface StabilityResult {
  versions: VersionMetrics[];
  trend: TrendData;
  benchmarks: BenchmarkComparison[];
  insights: PredictiveInsight[];
  predictedNextMajorDate: string | null;
}

// ── Industry Benchmarks (static, per spec) ────────────────────────────────────
const BENCHMARKS = {
  breakingPerYear: { stripe: 4.0, shopify: 2.0, github: 1.5 },
  deprecationDays: { stripe: 45, shopify: 75, github: 90 },
  migrationSuccessRate: { stripe: 87, shopify: 91, github: 89 },
  releasesPerYear: { stripe: 36, shopify: 12, github: 24 },
  monthsBetweenMajor: { stripe: 20, shopify: 15, github: 24 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function countEndpoints(specContent: string): number {
  try {
    const parsed = JSON.parse(specContent);
    const paths = parsed?.paths || {};
    let count = 0;
    for (const path of Object.values(paths)) {
      const methods = ["get", "post", "put", "patch", "delete", "options", "head"];
      for (const m of methods) {
        if ((path as Record<string, unknown>)[m]) count++;
      }
    }
    return count;
  } catch {
    // YAML or count from patterns
    const pathMatches = specContent.match(/^\s{2}\/[^:]+:/gm) || [];
    return pathMatches.length;
  }
}

function monthsBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.abs((db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth()));
}

function statusBadge(breaking: number): VersionMetrics["statusBadge"] {
  if (breaking === 0) return "stable";
  if (breaking <= 3) return "risky";
  return "major";
}

// ── Main Analysis Engine ───────────────────────────────────────────────────────

export function computeStabilityAnalysis(entries: VersionEntry[]): StabilityResult {
  if (entries.length < 2) {
    throw new Error("At least 2 versions are required for stability analysis.");
  }

  // Sort by release date ascending
  const sorted = [...entries].sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  // Build per-version metrics by diffing consecutive pairs
  const versions: VersionMetrics[] = [];

  // First version: no prior, so diffs = 0 (baseline)
  versions.push({
    name: sorted[0].name,
    releaseDate: sorted[0].releaseDate,
    breakingChanges: 0,
    safeChanges: 0,
    cautionChanges: 0,
    totalEndpoints: countEndpoints(sorted[0].specContent),
    migrationSuccessRate:
      sorted[0].totalCustomers && sorted[0].migratedCustomers != null
        ? Math.round((sorted[0].migratedCustomers / sorted[0].totalCustomers) * 100)
        : null,
    statusBadge: "stable",
  });

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    let result;
    try {
      result = analyzeSpecs(prev.specContent, curr.specContent, prev.name, curr.name);
    } catch {
      result = { summary: { breaking: 0, caution: 0, safe: 0, total: 0, impactScore: 0 }, changes: [] } as any;
    }
    const { breaking, caution, safe } = result.summary;

    versions.push({
      name: curr.name,
      releaseDate: curr.releaseDate,
      breakingChanges: breaking,
      safeChanges: safe,
      cautionChanges: caution,
      totalEndpoints: countEndpoints(curr.specContent),
      migrationSuccessRate:
        curr.totalCustomers && curr.migratedCustomers != null
          ? Math.round((curr.migratedCustomers / curr.totalCustomers) * 100)
          : null,
      statusBadge: statusBadge(breaking),
    });
  }

  // ── Trend Analysis ─────────────────────────────────────────────────────────
  const diffs = versions.slice(1); // versions with actual diff data
  const totalBreaking = diffs.reduce((s, v) => s + v.breakingChanges, 0);
  const avgBreakingPerRelease = diffs.length > 0 ? totalBreaking / diffs.length : 0;

  // Trend: compare first half vs second half of releases
  const half = Math.floor(diffs.length / 2);
  const firstHalfAvg =
    half > 0 ? diffs.slice(0, half).reduce((s, v) => s + v.breakingChanges, 0) / half : 0;
  const secondHalfAvg =
    half > 0 ? diffs.slice(half).reduce((s, v) => s + v.breakingChanges, 0) / (diffs.length - half) : 0;

  let trendDirection: TrendData["direction"] =
    secondHalfAvg < firstHalfAvg - 0.5
      ? "improving"
      : secondHalfAvg > firstHalfAvg + 0.5
      ? "declining"
      : "stable";

  const trendLabel =
    trendDirection === "improving"
      ? "Breaking change rate is decreasing — API stability is improving."
      : trendDirection === "declining"
      ? "Breaking change rate is increasing — consider a slower release cadence."
      : "Breaking change rate is stable across releases.";

  // Release frequency
  const totalMonths =
    sorted.length >= 2 ? monthsBetween(sorted[0].releaseDate, sorted[sorted.length - 1].releaseDate) : 1;
  const releaseFrequencyMonths = sorted.length > 1 ? totalMonths / (sorted.length - 1) : 1;

  const trend: TrendData = {
    direction: trendDirection,
    label: trendLabel,
    avgBreakingPerRelease: Math.round(avgBreakingPerRelease * 10) / 10,
    totalBreaking,
    releaseFrequencyMonths: Math.round(releaseFrequencyMonths * 10) / 10,
  };

  // ── Benchmark Comparisons ──────────────────────────────────────────────────
  const yourBreakingPerYear =
    totalMonths > 0 ? Math.round((totalBreaking / totalMonths) * 12 * 10) / 10 : 0;

  const avgMigration =
    versions.filter((v) => v.migrationSuccessRate !== null).length > 0
      ? Math.round(
          versions
            .filter((v) => v.migrationSuccessRate !== null)
            .reduce((s, v) => s + v.migrationSuccessRate!, 0) /
            versions.filter((v) => v.migrationSuccessRate !== null).length
        )
      : null;

  const releasesPerYear =
    totalMonths > 0 ? Math.round((sorted.length / totalMonths) * 12 * 10) / 10 : sorted.length;

  const benchmarks: BenchmarkComparison[] = [
    {
      metric: "Breaking changes / year",
      yours: `${yourBreakingPerYear}`,
      stripe: `${BENCHMARKS.breakingPerYear.stripe}`,
      shopify: `${BENCHMARKS.breakingPerYear.shopify}`,
      github: `${BENCHMARKS.breakingPerYear.github}`,
      interpretation:
        yourBreakingPerYear <= BENCHMARKS.breakingPerYear.github
          ? "Excellent — fewer breaking changes than GitHub, the industry gold standard."
          : yourBreakingPerYear <= BENCHMARKS.breakingPerYear.shopify
          ? "Good — more stable than Stripe, comparable to Shopify."
          : yourBreakingPerYear <= BENCHMARKS.breakingPerYear.stripe
          ? "Moderate — at Stripe level; consider reducing breaking change frequency."
          : "Above average — your breaking change rate exceeds all benchmarks; review your release process.",
    },
    {
      metric: "Releases / year",
      yours: `${releasesPerYear}`,
      stripe: `${BENCHMARKS.releasesPerYear.stripe}`,
      shopify: `${BENCHMARKS.releasesPerYear.shopify}`,
      github: `${BENCHMARKS.releasesPerYear.github}`,
      interpretation:
        releasesPerYear >= BENCHMARKS.releasesPerYear.github
          ? "Active shipping cadence — consistent with high-output API teams."
          : "Lower release frequency — predictable for customers but may slow feature delivery.",
    },
    {
      metric: "Avg time between releases",
      yours: `${releaseFrequencyMonths} mo`,
      stripe: "0.3 mo",
      shopify: "1 mo",
      github: "0.5 mo",
      interpretation: `You release every ${releaseFrequencyMonths} months on average.`,
    },
    ...(avgMigration !== null
      ? [
          {
            metric: "Migration success rate",
            yours: `${avgMigration}%`,
            stripe: `${BENCHMARKS.migrationSuccessRate.stripe}%`,
            shopify: `${BENCHMARKS.migrationSuccessRate.shopify}%`,
            github: `${BENCHMARKS.migrationSuccessRate.github}%`,
            interpretation:
              avgMigration >= 94
                ? "Exceptional — better than all industry benchmarks."
                : avgMigration >= 89
                ? "Strong — above Stripe and GitHub averages."
                : "Below average — review your migration documentation and tooling.",
          },
        ]
      : []),
  ];

  // ── Predictive Insights ────────────────────────────────────────────────────
  const insights: PredictiveInsight[] = [];

  // Major version gap
  const majorVersions = sorted.filter((v) => /^v\d+\.0/i.test(v.name));
  if (majorVersions.length >= 2) {
    const lastMajorGap = monthsBetween(
      majorVersions[majorVersions.length - 2].releaseDate,
      majorVersions[majorVersions.length - 1].releaseDate
    );
    const lastMajorDate = new Date(majorVersions[majorVersions.length - 1].releaseDate);
    const nextMajorDate = new Date(lastMajorDate);
    nextMajorDate.setMonth(nextMajorDate.getMonth() + lastMajorGap);
    insights.push({
      title: "Predicted Next Major Version",
      body: `Based on your ${lastMajorGap}-month major version cycle, the next major release is projected for ${nextMajorDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`,
      positive: true,
    });
  }

  if (trendDirection === "improving") {
    insights.push({
      title: "Stability Trend: Improving",
      body: "Your breaking change rate is declining across recent releases. This indicates your team is shipping more carefully — a positive sign for customer satisfaction.",
      positive: true,
    });
  } else if (trendDirection === "declining") {
    insights.push({
      title: "Stability Trend: Needs Attention",
      body: "Your breaking change rate is increasing across releases. Consider introducing more rigorous pre-release compatibility checks or extending your deprecation windows.",
      positive: false,
    });
  }

  if (avgMigration !== null && avgMigration >= 90) {
    insights.push({
      title: "Customer Migration: Strong",
      body: `A ${avgMigration}% migration success rate indicates your breaking changes are well-communicated and your migration tooling is effective.`,
      positive: true,
    });
  }

  insights.push({
    title: "Release Frequency",
    body: `You release approximately every ${releaseFrequencyMonths} months. This is ${
      releaseFrequencyMonths < 2
        ? "a fast cadence — ensure each release has adequate deprecation runway."
        : releaseFrequencyMonths < 6
        ? "a healthy cadence that balances feature delivery with customer stability."
        : "a conservative cadence — customers have ample time to plan for changes."
    }`,
    positive: releaseFrequencyMonths >= 2,
  });

  // Predicted next major date (for return value)
  const majorVers = sorted.filter((v) => /^v\d+\.0/i.test(v.name));
  let predictedNextMajorDate: string | null = null;
  if (majorVers.length >= 2) {
    const gap = monthsBetween(
      majorVers[majorVers.length - 2].releaseDate,
      majorVers[majorVers.length - 1].releaseDate
    );
    const last = new Date(majorVers[majorVers.length - 1].releaseDate);
    last.setMonth(last.getMonth() + gap);
    predictedNextMajorDate = last.toISOString().split("T")[0];
  }

  return { versions, trend, benchmarks, insights, predictedNextMajorDate };
}

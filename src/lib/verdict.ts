import type { Benchmark, VerdictBucket } from "./schemas";

export interface VerdictResult {
  verdict: VerdictBucket;
  adjustedLow: number;
  adjustedHigh: number;
}

export function computeVerdict(
  benchmark: Pick<Benchmark, "fairLow" | "fairHigh" | "redFlagAbovePct" | "factors">,
  price: number,
  checkedFactorIds: string[]
): VerdictResult {
  const checkedFactors = benchmark.factors.filter((f) =>
    checkedFactorIds.includes(f.id)
  );
  const adjustSum = checkedFactors.reduce((sum, f) => sum + f.adjustPct, 0);
  const multiplier = 1 + adjustSum / 100;

  const adjustedLow = Math.round(benchmark.fairLow * multiplier);
  const adjustedHigh = Math.round(benchmark.fairHigh * multiplier);
  const redFlagThreshold = adjustedHigh * (1 + benchmark.redFlagAbovePct / 100);

  let verdict: VerdictBucket;
  if (price < adjustedLow * 0.8) {
    verdict = "suspiciously-low";
  } else if (price <= adjustedHigh) {
    verdict = "fair";
  } else if (price <= redFlagThreshold) {
    verdict = "high";
  } else {
    verdict = "red-flag";
  }

  return { verdict, adjustedLow, adjustedHigh };
}

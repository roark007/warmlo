/**
 * Build or refresh data/quote-index.json from quote-benchmarks.json (v1 benchmark-only baseline).
 * Run: npx tsx scripts/seed-quote-index.ts
 * After real QuoteCheck volume exists, run scripts/aggregate-quotes.ts instead.
 */
import fs from "fs";
import path from "path";
import { quoteBenchmarksSchema, quoteIndexSchema } from "../src/lib/schemas";

const DATA_DIR = path.join(process.cwd(), "data");
const today = new Date();
const generatedAt = today.toISOString().split("T")[0];

const benchmarksData = quoteBenchmarksSchema.parse(
  JSON.parse(fs.readFileSync(path.join(DATA_DIR, "quote-benchmarks.json"), "utf-8"))
);

const index = quoteIndexSchema.parse({
  dataUpdated: benchmarksData.dataUpdated,
  generatedAt,
  methodologyVersion: "1.0",
  minimumSampleSize: 20,
  submissionStatsAvailable: false,
  methodology: {
    overview:
      "The Warmlo Quote Index publishes national fair-price ranges for common HVAC jobs and, as QuoteCheck submission volume grows, anonymized statistics from real homeowner quotes. No personally identifiable information is included in published aggregates.",
    fairRangeMethod:
      "Fair ranges are researched national benchmarks for standard installations in typical residential conditions. Each range spans fairLow (competitive quote in an average market) to fairHigh (upper end of fair before red-flag territory). typicalMid is the midpoint. Ranges exclude unusual scope (major duct rework, asbestos abatement, commercial equipment). QuoteCheck applies optional adjustment factors (access difficulty, premium brand, high-cost metro) at check time — the Index table shows unadjusted national ranges for comparability.",
    aggregationMethod:
      "Submission statistics are computed from anonymized QuoteCheck leads that include a quoted price and job type. For each job type, we require at least 20 quotes before publishing median price or percent-above-fair-range figures. Median uses the 50th percentile of submitted amounts. Percent above fair range counts quotes strictly above the national fairHigh for that job type. Raw leads never leave the database; only aggregates are written to quote-index.json.",
    citationGuidance:
      "Cite as: Warmlo HVAC Quote Index, warmlo.com/data/hvac-quote-index, accessed [date]. Include the dataUpdated month shown on the page. Link back to the Index when quoting ranges or submission statistics.",
  },
  jobs: benchmarksData.benchmarks.map((b) => ({
    jobType: b.jobType,
    label: b.label,
    fairLow: b.fairLow,
    fairHigh: b.fairHigh,
    typicalMid: b.typicalMid,
    quoteCount: 0,
    medianQuotedPrice: null,
    pctAboveFairRange: null,
    dataStatus: "benchmark-only" as const,
    notes: b.notes,
  })),
});

fs.writeFileSync(path.join(DATA_DIR, "quote-index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf-8");
console.log(`Wrote quote-index.json — ${index.jobs.length} jobs (benchmark-only v1).`);

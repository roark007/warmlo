/**
 * Aggregate anonymized quote statistics from Supabase into data/quote-index.json.
 *
 * Requires env: SUPABASE_URL, SUPABASE_SERVICE_KEY (same as /api/lead).
 * Fair ranges always come from data/quote-benchmarks.json.
 *
 * Usage:
 *   npx tsx scripts/aggregate-quotes.ts
 *
 * Privacy: only job_type + quoted_price are read. No names, emails, phones, or ZIPs
 * are written to the output file. Job types with fewer than 20 quotes publish
 * benchmark-only rows (no median / pct-above stats).
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { quoteBenchmarksSchema, quoteIndexSchema } from "../src/lib/schemas";

const DATA_DIR = path.join(process.cwd(), "data");
const MIN_SAMPLE = 20;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

function pctAbove(values: number[], threshold: number): number {
  if (values.length === 0) return 0;
  const above = values.filter((v) => v > threshold).length;
  return Math.round((above / values.length) * 100);
}

async function main() {
  const benchmarksData = quoteBenchmarksSchema.parse(
    JSON.parse(fs.readFileSync(path.join(DATA_DIR, "quote-benchmarks.json"), "utf-8"))
  );

  const quotesByJob = new Map<string, number[]>();
  for (const b of benchmarksData.benchmarks) {
    quotesByJob.set(b.jobType, []);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("leads")
      .select("job_type, quoted_price")
      .not("quoted_price", "is", null);

    if (error) {
      console.error("Supabase query failed:", error.message);
      process.exit(1);
    }

    for (const row of data ?? []) {
      const jobType = row.job_type as string;
      const price = Number(row.quoted_price);
      if (!quotesByJob.has(jobType) || !Number.isFinite(price) || price <= 0) continue;
      quotesByJob.get(jobType)!.push(Math.round(price));
    }
    console.log(`Loaded ${data?.length ?? 0} lead rows with quoted prices from Supabase.`);
  } else {
    console.warn("SUPABASE_URL / SUPABASE_SERVICE_KEY not set — keeping quote counts at 0.");
  }

  let submissionStatsAvailable = false;
  const jobs = benchmarksData.benchmarks.map((b) => {
    const prices = quotesByJob.get(b.jobType) ?? [];
    const quoteCount = prices.length;

    if (quoteCount >= MIN_SAMPLE) {
      submissionStatsAvailable = true;
      const med = median(prices);
      const pct = pctAbove(prices, b.fairHigh);
      return {
        jobType: b.jobType,
        label: b.label,
        fairLow: b.fairLow,
        fairHigh: b.fairHigh,
        typicalMid: b.typicalMid,
        quoteCount,
        medianQuotedPrice: med,
        pctAboveFairRange: pct,
        dataStatus: "live" as const,
        notes: b.notes,
      };
    }

    return {
      jobType: b.jobType,
      label: b.label,
      fairLow: b.fairLow,
      fairHigh: b.fairHigh,
      typicalMid: b.typicalMid,
      quoteCount,
      medianQuotedPrice: null,
      pctAboveFairRange: null,
      dataStatus: quoteCount > 0 ? ("insufficient" as const) : ("benchmark-only" as const),
      notes: b.notes,
    };
  });

  const generatedAt = new Date().toISOString().split("T")[0];
  const index = quoteIndexSchema.parse({
    dataUpdated: benchmarksData.dataUpdated,
    generatedAt,
    methodologyVersion: "1.0",
    minimumSampleSize: MIN_SAMPLE,
    submissionStatsAvailable,
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
    jobs,
  });

  const outPath = path.join(DATA_DIR, "quote-index.json");
  fs.writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`, "utf-8");

  const liveCount = jobs.filter((j) => j.dataStatus === "live").length;
  console.log(
    `Wrote ${outPath} — ${liveCount}/${jobs.length} job types with live submission stats (n≥${MIN_SAMPLE}).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import type { QuoteIndex, QuoteIndexJob } from "@/lib/schemas";
import { formatDataUpdated } from "@/lib/format";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warmlo.com";
const INDEX_PATH = "/data/hvac-quote-index";

export function getQuoteIndexPageUrl(): string {
  return `${BASE_URL}${INDEX_PATH}`;
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export function buildQuoteIndexCitation(index: QuoteIndex, accessedDate = new Date()): string {
  const accessed = accessedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updated = formatDataUpdated(index.dataUpdated);
  return `Warmlo HVAC Quote Index (${updated}). ${getQuoteIndexPageUrl()}. Accessed ${accessed}.`;
}

export function buildQuoteIndexAttributionLine(job: QuoteIndexJob, index: QuoteIndex): string {
  const updated = formatDataUpdated(index.dataUpdated);
  if (job.dataStatus === "live" && job.medianQuotedPrice !== null && job.pctAboveFairRange !== null) {
    return `Source: Warmlo HVAC Quote Index (${updated}). Median quoted price for ${job.label.toLowerCase()}: ${formatUsd(job.medianQuotedPrice)} (n=${job.quoteCount}). ${job.pctAboveFairRange}% of quotes were above the fair national range. ${getQuoteIndexPageUrl()}`;
  }
  return `Source: Warmlo HVAC Quote Index (${updated}). Fair national range for ${job.label.toLowerCase()}: ${formatUsd(job.fairLow)}–${formatUsd(job.fairHigh)} (typical ${formatUsd(job.typicalMid)}). ${getQuoteIndexPageUrl()}`;
}

export function submissionStatLabel(job: QuoteIndexJob, index: QuoteIndex): string {
  if (job.dataStatus === "live" && job.medianQuotedPrice !== null && job.pctAboveFairRange !== null) {
    return `${job.pctAboveFairRange}% of ${job.label.toLowerCase()} quotes submitted to Warmlo were above the fair national range (median ${formatUsd(job.medianQuotedPrice)}, n=${job.quoteCount}).`;
  }
  if (job.quoteCount > 0) {
    return `Insufficient data (n=${job.quoteCount}, need ${index.minimumSampleSize}) — showing benchmark range only.`;
  }
  return "Submission statistics will publish when enough anonymized quotes are collected.";
}

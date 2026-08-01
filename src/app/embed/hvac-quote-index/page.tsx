import { notFound } from "next/navigation";
import { getQuoteIndex } from "@/lib/data";
import { formatUsd } from "@/lib/quote-index";
import { StaticLink } from "@/components/StaticLink";

export const metadata = {
  robots: { index: false, follow: true },
};

export default async function EmbedQuoteIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { job: jobParam } = await searchParams;
  const index = getQuoteIndex();
  const job = jobParam
    ? index.jobs.find((j) => j.jobType === jobParam) ?? index.jobs[0]
    : index.jobs[0];
  if (!job) notFound();

  return (
    <div className="min-h-screen bg-paper px-4 py-5 text-text-body">
      <div className="mx-auto max-w-[420px] rounded-[16px] border border-[var(--line-on-paper)] bg-paper-2 p-5 shadow-[var(--shadow-card)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">Fair price range</div>
        <div className="mt-1 font-display text-lg font-bold text-text-strong">{job.label}</div>
        <div className="mt-3 font-display text-[clamp(28px,6vw,36px)] font-bold tracking-[-0.02em] text-ember-deeper [font-feature-settings:'tnum']">
          {formatUsd(job.fairLow)}–{formatUsd(job.fairHigh)}
        </div>
        <p className="mt-2 text-sm text-text-muted">Typical mid: {formatUsd(job.typicalMid)}</p>
        {job.dataStatus === "live" && job.medianQuotedPrice !== null && (
          <p className="mt-2 text-sm text-text-body">
            Median quoted: {formatUsd(job.medianQuotedPrice)} (n={job.quoteCount})
          </p>
        )}
        <p className="mt-4 border-t border-[var(--line-on-paper)] pt-3 text-[12.5px] leading-[1.5] text-text-muted">
          Source:{" "}
          <StaticLink href="/data/hvac-quote-index" className="font-semibold text-ember-deeper">
            Warmlo HVAC Quote Index
          </StaticLink>
        </p>
      </div>
    </div>
  );
}

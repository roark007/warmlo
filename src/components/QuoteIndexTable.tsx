import { StaticLink } from "@/components/StaticLink";
import { formatUsd, submissionStatLabel } from "@/lib/quote-index";
import type { QuoteIndex, QuoteIndexJob } from "@/lib/schemas";

interface QuoteIndexTableProps {
  index: QuoteIndex;
}

function StatCell({ job, index }: { job: QuoteIndexJob; index: QuoteIndex }) {
  if (job.dataStatus === "live" && job.medianQuotedPrice !== null) {
    return (
      <span className="[font-feature-settings:'tnum']">
        {formatUsd(job.medianQuotedPrice)}
        {job.pctAboveFairRange !== null && (
          <span className="block text-[12.5px] text-text-muted">{job.pctAboveFairRange}% above fair</span>
        )}
      </span>
    );
  }
  if (job.quoteCount > 0) {
    return <span className="text-text-muted">n={job.quoteCount} (need {index.minimumSampleSize})</span>;
  }
  return <span className="text-text-muted">Benchmark only</span>;
}

export function QuoteIndexTable({ index }: QuoteIndexTableProps) {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-[var(--line-on-paper)] bg-paper-2 shadow-[var(--shadow-card)]">
      <table className="w-full min-w-[640px] border-collapse text-left text-[14.5px]">
        <thead>
          <tr className="border-b border-[var(--line-on-paper)] bg-[rgba(23,18,14,0.03)]">
            <th className="px-5 py-4 font-semibold text-text-strong">Job type</th>
            <th className="px-5 py-4 font-semibold text-text-strong">Fair range</th>
            <th className="px-5 py-4 font-semibold text-text-strong">Typical mid</th>
            <th className="px-5 py-4 font-semibold text-text-strong">Submissions</th>
            <th className="px-5 py-4 font-semibold text-text-strong">Quoted stats</th>
          </tr>
        </thead>
        <tbody>
          {index.jobs.map((job) => (
            <tr key={job.jobType} className="border-b border-[var(--line-on-paper)] last:border-b-0">
              <td className="px-5 py-4 align-top">
                <div className="font-semibold text-text-strong">{job.label}</div>
                <div className="mt-1 text-[12.5px] leading-snug text-text-muted">{job.notes}</div>
                <StaticLink
                  href={`/quote-check?job=${job.jobType}`}
                  className="mt-2 inline-block text-[12.5px] font-semibold text-ember-deeper hover:text-ember"
                >
                  Check a quote →
                </StaticLink>
              </td>
              <td className="px-5 py-4 align-top [font-feature-settings:'tnum']">
                {formatUsd(job.fairLow)}–{formatUsd(job.fairHigh)}
              </td>
              <td className="px-5 py-4 align-top [font-feature-settings:'tnum']">{formatUsd(job.typicalMid)}</td>
              <td className="px-5 py-4 align-top">{job.quoteCount.toLocaleString("en-US")}</td>
              <td className="px-5 py-4 align-top">
                <StatCell job={job} index={index} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-[var(--line-on-paper)] px-5 py-4 text-[13px] leading-[1.6] text-text-muted">
        {index.submissionStatsAvailable
          ? "Live submission statistics shown where sample size meets the minimum threshold."
          : "V1 Index: fair-range benchmarks are published now; anonymized quote medians publish when each job type reaches 20+ submissions."}
      </div>
    </div>
  );
}

export function QuoteIndexHighlightCards({ index }: QuoteIndexTableProps) {
  const liveJobs = index.jobs.filter((j) => j.dataStatus === "live");
  if (liveJobs.length === 0) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3.5">
      {liveJobs.slice(0, 3).map((job) => (
        <div
          key={job.jobType}
          className="rounded-[16px] border border-[var(--line-on-paper)] bg-paper-2 p-5 shadow-[var(--shadow-card)]"
        >
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-muted">From submissions</div>
          <p className="mt-2 text-[15px] leading-[1.55] text-text-body">{submissionStatLabel(job, index)}</p>
        </div>
      ))}
    </div>
  );
}

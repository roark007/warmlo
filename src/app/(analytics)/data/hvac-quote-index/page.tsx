import { Breadcrumb } from "@/components/Breadcrumb";
import { CiteBlock } from "@/components/CiteBlock";
import { FreshnessStamp } from "@/components/FreshnessStamp";
import { QuoteIndexHighlightCards, QuoteIndexTable } from "@/components/QuoteIndexTable";
import { StaticLink } from "@/components/StaticLink";
import { getQuoteIndex } from "@/lib/data";
import { formatDataUpdated } from "@/lib/format";
import { buildQuoteIndexCitation } from "@/lib/quote-index";
import {
  buildQuoteIndexDatasetJsonLd,
  buildQuoteIndexDescription,
  buildQuoteIndexTitle,
} from "@/lib/seo";

export function generateMetadata() {
  const index = getQuoteIndex();
  return {
    title: buildQuoteIndexTitle(index),
    description: buildQuoteIndexDescription(index),
    alternates: { canonical: "/data/hvac-quote-index" },
    openGraph: {
      title: buildQuoteIndexTitle(index),
      description: buildQuoteIndexDescription(index),
    },
  };
}

export default function HvacQuoteIndexPage() {
  const index = getQuoteIndex();
  const year = index.dataUpdated.split("-")[0];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warmlo.com";
  const datasetJsonLd = buildQuoteIndexDatasetJsonLd(index, baseUrl);
  const citation = buildQuoteIndexCitation(index);

  return (
    <div className="min-h-screen text-text-on-dark">
      <section className="relative overflow-hidden px-[var(--pad-page-x)] pb-[clamp(40px,6vw,72px)] pt-[clamp(28px,4vw,48px)]">
        <div className="hero-glow-field" aria-hidden="true">
          <div className="hero-glow-primary" />
        </div>

        <div className="relative z-[1] mx-auto max-w-[1040px]">
          <Breadcrumb
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Data" },
              { label: "HVAC Quote Index" },
            ]}
          />

          <div className="mt-[clamp(22px,3vw,32px)]">
            <div className="mb-3.5 text-eyebrow font-semibold uppercase tracking-eyebrow text-[#ff9a4d]">
              Warmlo Quote Index
            </div>
            <h1 className="max-w-[22ch] font-display text-h1 font-bold leading-[1.02] tracking-[-0.03em] text-text-on-dark">
              What HVAC work should cost in {year}
            </h1>
            <p className="mt-[18px] max-w-[52ch] text-lead leading-[1.6] text-text-on-dark-3">
              National fair-price ranges for {index.jobs.length} common jobs — plus anonymized quote statistics from
              Warmlo QuoteCheck as submission volume grows. Free to read and cite.
            </p>
            <div className="mt-6">
              <FreshnessStamp dataUpdated={index.dataUpdated} label="reviewed" />
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="paper-sheet">
        <article className="mx-auto max-w-[960px] px-[var(--pad-page-x)] py-[clamp(40px,5vw,68px)]">
          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              Fair-price ranges & quote statistics
            </h2>
            <p className="mt-3 max-w-[68ch] text-base leading-[1.65] text-text-body">
              {index.submissionStatsAvailable
                ? "Live submission medians appear below where sample size is large enough. All rows include researched fair ranges for comparison."
                : "V1 publishes researched fair ranges today. When homeowners submit quotes through QuoteCheck, anonymized medians and “above fair range” percentages will appear here automatically — no paywall, no signup."}
            </p>
            <div className="mt-6">
              <QuoteIndexHighlightCards index={index} />
            </div>
            <div className="mt-6">
              <QuoteIndexTable index={index} />
            </div>
          </section>

          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">Methodology</h2>
            <div className="mt-5 space-y-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-text-strong">Overview</h3>
                <p className="mt-2 max-w-[68ch] text-base leading-[1.65] text-text-body">
                  {index.methodology.overview}
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-text-strong">How fair ranges are set</h3>
                <p className="mt-2 max-w-[68ch] text-base leading-[1.65] text-text-body">
                  {index.methodology.fairRangeMethod}
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-text-strong">How submission stats are computed</h3>
                <p className="mt-2 max-w-[68ch] text-base leading-[1.65] text-text-body">
                  {index.methodology.aggregationMethod}
                </p>
                <p className="mt-3 text-sm text-text-muted">
                  Minimum sample size: {index.minimumSampleSize} quotes per job type. Last generated{" "}
                  {index.generatedAt}. Pricing data updated {formatDataUpdated(index.dataUpdated)}.
                </p>
              </div>
            </div>
          </section>

          <div className="mb-[clamp(32px,4vw,48px)]">
            <CiteBlock citation={citation} />
          </div>

          <section className="rounded-[18px] border border-[var(--line-on-paper)] bg-paper-2 p-6 text-[15px] leading-[1.6] text-text-body">
            <p>
              Have a contractor quote?{" "}
              <StaticLink href="/quote-check" className="font-semibold text-ember-deeper hover:text-ember">
                Run it through QuoteCheck
              </StaticLink>{" "}
              — free, instant, no signup. Your anonymized price helps improve this Index for everyone.
            </p>
            <p className="mt-3 text-sm text-text-muted">
              Embed a fair-range card:{" "}
              <StaticLink
                href="/embed/hvac-quote-index"
                className="font-semibold text-ember-deeper hover:text-ember"
              >
                /embed/hvac-quote-index
              </StaticLink>
            </p>
          </section>
        </article>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
    </div>
  );
}

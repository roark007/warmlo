import { Breadcrumb } from "@/components/Breadcrumb";
import { FreshnessStamp } from "@/components/FreshnessStamp";
import { StaticLink } from "@/components/StaticLink";
import { getBenchmarks } from "@/lib/data";
import { CODE_PAGE_DISCLAIMER } from "@/lib/seo";

export const metadata = {
  title: "About Warmlo — Methodology & Editorial Standards",
  description:
    "How Warmlo compiles furnace error codes, fair-price benchmarks, and the HVAC Quote Index. Independent, free, built for homeowners.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const { dataUpdated } = getBenchmarks();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warmlo.com";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Warmlo",
    url: baseUrl,
    description:
      "Free consumer resource for HVAC error codes, repair cost guides, and fair-price quote checking.",
    sameAs: baseUrl,
  };

  return (
    <div className="min-h-screen text-text-on-dark">
      <section className="relative overflow-hidden px-[var(--pad-page-x)] pb-[clamp(38px,5vw,60px)] pt-[clamp(28px,4vw,48px)]">
        <div className="hero-glow-field" aria-hidden="true">
          <div className="hero-glow-primary" />
        </div>
        <div className="relative z-[1] mx-auto max-w-[920px]">
          <Breadcrumb
            variant="dark"
            items={[{ label: "Home", href: "/" }, { label: "About" }]}
          />
          <h1 className="mt-4 font-display text-h1 font-bold leading-[1.02] tracking-[-0.03em] text-text-on-dark">
            About Warmlo
          </h1>
          <p className="mt-4 max-w-[52ch] text-lead leading-[1.6] text-text-on-dark-3">
            Independent, free tools for homeowners — not a contractor, not a lead farm. Here is
            how we build and maintain what you read on this site.
          </p>
          <div className="mt-6">
            <FreshnessStamp dataUpdated={dataUpdated} label="reviewed" />
          </div>
        </div>
      </section>

      <main id="main-content" className="paper-sheet">
        <article className="mx-auto max-w-[820px] px-[var(--pad-page-x)] py-[clamp(40px,5vw,68px)]">
          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              What Warmlo is
            </h2>
            <p className="mt-3.5 max-w-[68ch] text-base leading-[1.65] text-text-body">
              Warmlo helps homeowners answer three questions when something goes wrong with heat or
              cooling: what the problem likely is, what a fair repair should cost, and when to call a
              licensed professional. FixCode covers furnace error codes by brand. QuoteCheck compares
              contractor quotes against national benchmarks. The{" "}
              <StaticLink href="/data/hvac-quote-index" className="font-semibold text-ember-deeper">
                HVAC Quote Index
              </StaticLink>{" "}
              publishes those benchmarks — and, as volume grows, anonymized statistics from real
              quotes submitted through QuoteCheck.
            </p>
            <p className="mt-3 max-w-[68ch] text-base leading-[1.65] text-text-body">
              Visitors never pay. Warmlo may earn a fee when you request quotes through partner
              networks; see our{" "}
              <StaticLink href="/disclosure" className="font-semibold text-ember-deeper">
                affiliate disclosure
              </StaticLink>
              . Editorial content is researched independently of those relationships.
            </p>
          </section>

          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              How FixCode content is compiled
            </h2>
            <ul className="mt-4 space-y-3 text-base leading-[1.65] text-text-body">
              <li>
                <strong className="text-text-strong">Structured data, not a CMS.</strong> Each error
                code lives as a validated JSON object in the repository (`data/codes/`). Every field
                — meaning, severity, DIY steps, cost range, related repair — is schema-checked on
                every deploy.
              </li>
              <li>
                <strong className="text-text-strong">Accuracy over volume.</strong> We publish a
                dedicated page only when a code can be verified against manufacturer diagnostics or
                widely documented service literature. Unverifiable codes are omitted, not guessed.
              </li>
              <li>
                <strong className="text-text-strong">No auto-generated prose.</strong> Meaning text
                and snippet answers are written to plain-language standards and composed from
                validated fields — not bulk-generated without human review.
              </li>
              <li>
                <strong className="text-text-strong">Symptom layer.</strong>{" "}
                <StaticLink href="/symptom/furnace-clicks-but-wont-ignite" className="font-semibold text-ember-deeper">
                  Symptom guides
                </StaticLink>{" "}
                connect everyday problems (“furnace won&apos;t ignite”) to brand-specific code pages
                so homeowners who do not yet know their code can still find a path forward.
              </li>
              <li>
                <strong className="text-text-strong">Permanent URLs.</strong> Code and symptom URLs
                do not change. Updates happen in place when data is corrected or refreshed.
              </li>
            </ul>
          </section>

          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              How fair-price ranges are calculated
            </h2>
            <p className="mt-3.5 max-w-[68ch] text-base leading-[1.65] text-text-body">
              QuoteCheck and the Quote Index use national fair ranges stored in{" "}
              <code className="rounded bg-[rgba(23,18,14,0.06)] px-1.5 py-0.5 text-[14px]">data/quote-benchmarks.json</code>
              . Each job type has a fair low, fair high, and typical midpoint for a standard
              residential install in an average U.S. market — not the cheapest possible quote and
              not the top of market.
            </p>
            <p className="mt-3 max-w-[68ch] text-base leading-[1.65] text-text-body">
              Ranges exclude unusual scope (major duct reconstruction, asbestos, commercial
              equipment). QuoteCheck can apply adjustment factors you select (tight access, premium
              brand, high-cost metro) at check time; the Index table shows unadjusted national
              ranges for apples-to-apples comparison.
            </p>
            <p className="mt-3 max-w-[68ch] text-base leading-[1.65] text-text-body">
              Repair cost guides on{" "}
              <StaticLink href="/cost/ignitor-replacement" className="font-semibold text-ember-deeper">
                /cost/*
              </StaticLink>{" "}
              pages use separate part/labor research for individual repairs (ignitor, limit switch,
              etc.) and are cross-linked from code pages.
            </p>
          </section>

          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              How the Quote Index works
            </h2>
            <p className="mt-3.5 max-w-[68ch] text-base leading-[1.65] text-text-body">
              The{" "}
              <StaticLink href="/data/hvac-quote-index" className="font-semibold text-ember-deeper">
                Warmlo HVAC Quote Index
              </StaticLink>{" "}
              is a public statistics page. V1 publishes fair-range benchmarks for twelve common job
              types. As homeowners submit quoted prices through QuoteCheck, anonymized aggregates
              (median price, percent above fair range) publish automatically when a job type reaches
              at least 20 submissions — no names, emails, phones, or ZIP codes in the published
              data.
            </p>
            <p className="mt-3 max-w-[68ch] text-base leading-[1.65] text-text-body">
              Full methodology and a copy-paste citation line are on the Index page. Journalists and
              researchers are encouraged to link back when citing ranges or statistics.
            </p>
          </section>

          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              Editorial guardrails
            </h2>
            <ul className="mt-4 space-y-3 text-base leading-[1.65] text-text-body">
              <li>
                <strong className="text-text-strong">No doorway pages</strong> — no city, ZIP, or
                “near me” landing pages; no bulk cross-products of brand × symptom without real
                content.
              </li>
              <li>
                <strong className="text-text-strong">Safety first</strong> — emergency severity
                codes never include DIY HowTo structured data; gas and combustion warnings stay
                verbatim-locked.
              </li>
              <li>
                <strong className="text-text-strong">Not professional advice</strong> — every code
                page includes a general-information disclaimer. When in doubt, call a licensed
                technician.
              </li>
              <li>
                <strong className="text-text-strong">Verification harness</strong> —{" "}
                <code className="rounded bg-[rgba(23,18,14,0.06)] px-1.5 py-0.5 text-[14px]">npm run verify</code>{" "}
                runs on every change: lint, types, tests, data validation, build, and post-build site
                checks. Deploys do not ship with weakened tests.
              </li>
            </ul>
          </section>

          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              Who runs Warmlo
            </h2>
            <p className="mt-3.5 max-w-[68ch] text-base leading-[1.65] text-text-body">
              Warmlo is an independent consumer project focused on honest HVAC information. We are
              not a licensed contractor and do not perform installations or repairs. Partner
              networks may connect you with local pros when you choose to request quotes — that is
              optional and separate from reading our code and cost content.
            </p>
            <p className="mt-3 max-w-[68ch] text-base leading-[1.65] text-text-body">
              Questions or corrections:{" "}
              <a href="mailto:hello@warmlo.com" className="font-semibold text-ember-deeper hover:text-ember">
                hello@warmlo.com
              </a>
              .               Privacy inquiries:{" "}
              <a href="mailto:privacy@warmlo.com" className="font-semibold text-ember-deeper hover:text-ember">
                privacy@warmlo.com
              </a>
              .
            </p>
          </section>

          <p className="rounded-[14px] border border-[rgba(23,18,14,0.08)] bg-[rgba(23,18,14,0.04)] p-[18px_20px] text-[13.5px] leading-[1.6] text-text-faint">
            {CODE_PAGE_DISCLAIMER}
          </p>
        </article>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </div>
  );
}

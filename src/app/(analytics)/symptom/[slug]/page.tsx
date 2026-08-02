import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CostRangeDisplay } from "@/components/CostRangeDisplay";
import { CtaBlock } from "@/components/CtaBlock";
import { DangerAlert } from "@/components/DangerAlert";
import { FreshnessStamp } from "@/components/FreshnessStamp";
import { NumberedStepList } from "@/components/NumberedStepList";
import { SeverityBadge } from "@/components/SeverityBadge";
import { SymptomCodeFinder } from "@/components/SymptomCodeFinder";
import { StaticLink } from "@/components/StaticLink";
import { OnThisPageNav } from "@/components/OnThisPageNav";
import { getBenchmarks, getRepairBySlug, getSymptom, getSymptoms } from "@/lib/data";
import {
  buildRepairCostProse,
  buildSymptomPageDescription,
  buildSymptomPageJsonLd,
  buildSymptomPageTitle,
  CODE_PAGE_DISCLAIMER,
} from "@/lib/seo";

export function generateStaticParams() {
  return getSymptoms().map((symptom) => ({ slug: symptom.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const symptom = getSymptom(slug);
  if (!symptom) return { title: "Symptom Not Found" };

  return {
    title: buildSymptomPageTitle(symptom),
    description: buildSymptomPageDescription(symptom),
    alternates: { canonical: `/symptom/${slug}` },
    openGraph: {
      title: symptom.title,
      description: buildSymptomPageDescription(symptom),
    },
  };
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export default async function SymptomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const symptom = getSymptom(slug);
  if (!symptom) notFound();

  const primaryRepairSlug = symptom.likelyCauses[0]?.repairSlug ?? "filter-replacement";
  const repair = getRepairBySlug(primaryRepairSlug);
  const { dataUpdated } = getBenchmarks();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warmlo.com";
  const jsonLd = buildSymptomPageJsonLd(symptom, baseUrl, dataUpdated);
  const costProse = repair
    ? buildRepairCostProse(repair.name, repair.costLow, repair.costHigh)
    : null;
  const symptomLabel = symptom.title.toLowerCase();
  const pageSections = [
    { href: "#meaning", label: "Meaning" },
    { href: "#likely-causes", label: "Likely causes" },
    { href: "#exact-code", label: "Find your exact code" },
    { href: "#first-steps", label: "First steps" },
    ...(repair ? [{ href: "#repair-cost", label: "Repair cost" }] : []),
  ];

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
              { label: "Symptoms", href: "/fix" },
              { label: symptom.title },
            ]}
          />

          <div className="mt-[clamp(22px,3vw,32px)]">
            <div className="mb-5">
              <SeverityBadge severity={symptom.severityCeiling} size="dark" />
            </div>

            <h1 className="max-w-[20ch] font-display text-h1 font-bold leading-[1.02] tracking-[-0.03em] text-text-on-dark">
              {symptom.title}
            </h1>

            <p className="mt-[18px] max-w-[48ch] text-lead leading-[1.6] text-text-on-dark-3">
              {symptom.snippetAnswer}
            </p>

            <div className="mt-6">
              <FreshnessStamp dataUpdated={dataUpdated} label="reviewed" />
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="paper-sheet">
        <article className="mx-auto max-w-[820px] px-[var(--pad-page-x)] py-[clamp(40px,5vw,68px)]">
          {symptom.dangerNote && (
            <div className="mb-[clamp(32px,4vw,48px)]">
              <DangerAlert message={symptom.dangerNote} />
            </div>
          )}

          <OnThisPageNav items={pageSections} />

          <section id="meaning" className="mb-[clamp(32px,4vw,48px)] scroll-mt-24">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              What does {symptomLabel} mean?
            </h2>
            <p className="mt-3.5 max-w-[68ch] text-base leading-[1.65] text-text-body">
              {symptom.plainExplanation}
            </p>
          </section>

          <section id="likely-causes" className="mb-[clamp(32px,4vw,48px)] scroll-mt-24">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              What usually causes {symptomLabel}?
            </h2>
            <div className="mt-4 grid gap-3">
              {symptom.likelyCauses.map((item) => {
                const causeRepair = getRepairBySlug(item.repairSlug);
                return (
                  <div
                    key={item.cause}
                    className="rounded-[16px] border border-[var(--line-on-paper)] bg-paper-2 p-[18px_20px] shadow-[var(--shadow-card)]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-text-strong">{item.cause}</span>
                      <span className="rounded-pill bg-[var(--pro-wash)] px-2.5 py-1 text-[12px] font-semibold capitalize text-pro-ink">
                        {item.likelihood}
                      </span>
                    </div>
                    {causeRepair && (
                      <p className="mt-2 text-sm text-text-body">
                        Typical repair:{" "}
                        <StaticLink href={`/cost/${causeRepair.slug}`} className="font-semibold text-ember-deeper">
                          {formatCurrency(causeRepair.costLow)}–{formatCurrency(causeRepair.costHigh)}
                        </StaticLink>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <SymptomCodeFinder symptom={symptom} />

          <section id="first-steps" className="mb-[clamp(32px,4vw,48px)] scroll-mt-24">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              What should I check first when {symptomLabel}?
            </h2>
            <div className="mt-4">
              {symptom.severityCeiling === "emergency" && symptom.dangerNote ? (
                <DangerAlert message={symptom.dangerNote} />
              ) : (
                <NumberedStepList steps={symptom.checkFirst} severity={symptom.severityCeiling} />
              )}
            </div>
          </section>

          {repair && (
            <section id="repair-cost" className="mb-[clamp(32px,4vw,48px)] scroll-mt-24">
              <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
                What a repair costs
              </h2>
              <div className="mt-4">
                {costProse && (
                  <p className="mb-4 max-w-[68ch] text-base leading-[1.65] text-text-body">{costProse}</p>
                )}
                <CostRangeDisplay
                  costLow={repair.costLow}
                  costHigh={repair.costHigh}
                  repairSlug={repair.slug}
                  repairName={repair.name}
                  dataUpdated={dataUpdated}
                  partCostLow={repair.partCostLow}
                  partCostHigh={repair.partCostHigh}
                  laborHours={repair.laborHours}
                />
              </div>
            </section>
          )}

          <div className="mb-[clamp(32px,4vw,48px)]">
            <CtaBlock repairSlug={primaryRepairSlug} />
          </div>

          <p className="mt-[clamp(24px,3vw,36px)] rounded-[14px] border border-[rgba(23,18,14,0.08)] bg-[rgba(23,18,14,0.04)] p-[18px_20px] text-[13.5px] leading-[1.6] text-text-faint">
            {CODE_PAGE_DISCLAIMER}
          </p>
        </article>
      </main>

      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </div>
  );
}

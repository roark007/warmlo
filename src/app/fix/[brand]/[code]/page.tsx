import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CodeTableRow } from "@/components/CodeTableRow";
import { CostRangeDisplay } from "@/components/CostRangeDisplay";
import { CtaBlock } from "@/components/CtaBlock";
import { DangerAlert } from "@/components/DangerAlert";
import { FreshnessStamp } from "@/components/FreshnessStamp";
import { FurnaceReadout } from "@/components/FurnaceReadout";
import { NumberedStepList } from "@/components/NumberedStepList";
import { SeverityBadge } from "@/components/SeverityBadge";
import {
  getBenchmarks,
  getBrand,
  getBrands,
  getCode,
  getCodesForBrand,
  getRelatedCodes,
  getRepairBySlug,
  getSymptomsForCode,
} from "@/lib/data";
import {
  buildCodePageDescription,
  buildCodePageHeadline,
  buildCodePageJsonLd,
  buildCodePageTitle,
  buildRepairCostProse,
  CODE_PAGE_DISCLAIMER,
} from "@/lib/seo";
import { StaticLink } from "@/components/StaticLink";
import { CodePageAnalyticsScript } from "@/components/CodePageAnalyticsScript";

export function generateStaticParams() {
  return getBrands().flatMap((brand) =>
    getCodesForBrand(brand.slug).map((code) => ({
      brand: brand.slug,
      code: code.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; code: string }>;
}) {
  const { brand: brandSlug, code: codeSlug } = await params;
  const brand = getBrand(brandSlug);
  const code = getCode(brandSlug, codeSlug);
  if (!brand || !code) return { title: "Code Not Found" };

  const shortMeaning = code.title.includes(":")
    ? code.title.split(":").slice(1).join(":").trim()
    : code.meaning;

  return {
    title: buildCodePageTitle(brand, code),
    description: buildCodePageDescription(brand, code),
    alternates: {
      canonical: `/fix/${brandSlug}/${codeSlug}`,
    },
    openGraph: {
      title: `${brand.name} Code ${code.code}: ${shortMeaning}`,
      description: buildCodePageDescription(brand, code),
    },
  };
}

function readoutLabel(code: { title: string; meaning: string }): string {
  const short = code.title.includes(":")
    ? code.title.split(":").slice(1).join(":").trim()
    : code.meaning;
  const words = short.split(/\s+/).slice(0, 2);
  return words.join(" ");
}

export default async function CodePage({
  params,
}: {
  params: Promise<{ brand: string; code: string }>;
}) {
  const { brand: brandSlug, code: codeSlug } = await params;
  const brand = getBrand(brandSlug);
  const code = getCode(brandSlug, codeSlug);
  if (!brand || !code) notFound();

  const repair = getRepairBySlug(code.relatedRepairSlug);
  const { dataUpdated } = getBenchmarks();
  const relatedCodes = getRelatedCodes(brandSlug, codeSlug, 6);
  const relatedSymptoms = getSymptomsForCode(brandSlug, codeSlug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warmlo.com";
  const jsonLd = buildCodePageJsonLd(brand, code, baseUrl, dataUpdated);
  const costProse = repair
    ? buildRepairCostProse(repair.name, code.repairCostLow, code.repairCostHigh)
    : null;

  const shortMeaning = code.title.includes(":")
    ? code.title.split(":").slice(1).join(":").trim()
    : code.meaning;

  return (
    <div className="min-h-screen text-text-on-dark">
      <section className="relative overflow-hidden px-[var(--pad-page-x)] pb-[clamp(40px,6vw,72px)] pt-[clamp(28px,4vw,48px)]">
        <div className="hero-glow-field" aria-hidden="true">
          <div
            className="hero-glow-primary"
            style={{
              background:
                "radial-gradient(ellipse 50% 50% at 50% 40%, rgba(224,135,26,0.26), rgba(214,74,18,0.10) 44%, rgba(20,16,12,0) 72%)",
            }}
          />
        </div>

        <div className="relative z-[1] mx-auto max-w-[1040px]">
          <Breadcrumb
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Fix", href: "/fix" },
              { label: brand.name, href: `/fix/${brand.slug}` },
              { label: code.code },
            ]}
          />

          <div className="mt-[clamp(22px,3vw,32px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-center gap-[clamp(28px,4vw,56px)]">
            <div>
              <div className="mb-5">
                <SeverityBadge severity={code.severity} size="dark" />
              </div>

              <h1 className="font-display text-h1 font-bold leading-[1.02] tracking-[-0.03em] text-text-on-dark">
                {buildCodePageHeadline(brand, code, shortMeaning)}
              </h1>

              <p className="mt-[18px] max-w-[44ch] text-lead leading-[1.6] text-text-on-dark-3">
                {code.snippetAnswer ?? code.meaning}
              </p>

              <div className="mt-6">
                <FreshnessStamp dataUpdated={dataUpdated} label="reviewed" />
              </div>
            </div>

            <div className="justify-self-center">
              <FurnaceReadout
                code={code.code}
                label={readoutLabel(code)}
                brandName={brand.name}
                series={brand.codeFormat}
                severity={code.severity}
              />
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="paper-sheet">
        <article className="mx-auto max-w-[820px] px-[var(--pad-page-x)] py-[clamp(40px,5vw,68px)]">
          {code.dangerNote && (
            <div className="mb-[clamp(32px,4vw,48px)]">
              <DangerAlert message={code.dangerNote} />
            </div>
          )}

          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              What it means
            </h2>
            <p className="mt-3.5 max-w-[68ch] text-base leading-[1.65] text-text-body">
              {code.snippetAnswer ?? code.meaning}
            </p>
          </section>

          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              Try this first
            </h2>
            <div className="mt-4">
              {code.severity === "emergency" && code.dangerNote ? (
                <DangerAlert message={code.dangerNote} />
              ) : (
                <NumberedStepList steps={code.diySteps} severity={code.severity} />
              )}
            </div>
          </section>

          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              What a repair costs
            </h2>
            <div className="mt-4">
              {costProse && (
                <p className="mb-4 max-w-[68ch] text-base leading-[1.65] text-text-body">{costProse}</p>
              )}
              <CostRangeDisplay
                costLow={code.repairCostLow}
                costHigh={code.repairCostHigh}
                repairSlug={code.relatedRepairSlug}
                repairName={repair?.name ?? code.relatedRepairSlug}
                dataUpdated={dataUpdated}
                partCostLow={repair?.partCostLow}
                partCostHigh={repair?.partCostHigh}
                laborHours={repair?.laborHours}
              />
            </div>
          </section>

          <div className="mb-[clamp(32px,4vw,48px)]">
            <CtaBlock repairSlug={code.relatedRepairSlug} />
          </div>

          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              When to call a pro
            </h2>
            <p className="mt-4 max-w-[68ch] text-base leading-[1.65] text-text-body">
              {code.whenToCallPro}
            </p>
          </section>

          {relatedSymptoms.length > 0 && (
            <section className="mb-[clamp(32px,4vw,48px)]">
              <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
                Symptoms this code causes
              </h2>
              <ul className="mt-4 space-y-2 text-base text-text-body">
                {relatedSymptoms.map((symptom) => (
                  <li key={symptom.slug}>
                    <StaticLink
                      href={`/symptom/${symptom.slug}`}
                      className="font-semibold text-ember-deeper hover:text-ember"
                    >
                      {symptom.title}
                    </StaticLink>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {relatedCodes.length > 0 && (
            <section className="mb-[clamp(24px,3vw,36px)]">
              <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
                Related codes
              </h2>
              <div className="mt-[18px] grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-[11px]">
                {relatedCodes.map((related) => (
                  <CodeTableRow
                    key={related.slug}
                    brandSlug={brandSlug}
                    code={related}
                    compact
                  />
                ))}
              </div>
            </section>
          )}

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
      <CodePageAnalyticsScript brand={brand.slug} code={code.code} />
    </div>
  );
}

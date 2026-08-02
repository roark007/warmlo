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
  getSourcesForCode,
  getSymptomsForCode,
  isVerifiedCode,
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
import { OnThisPageNav } from "@/components/OnThisPageNav";
import type { Brand, BrandSource, Code } from "@/lib/schemas";

const CODE_REVIEWED_MONTH = "2026-08";
const MODEL_SCOPE_WARNING =
  "Fault codes vary by model and control board. Confirm the diagnostic chart inside your furnace panel or the official manual before acting.";

function CodeSources({ code, sources }: { code: Code; sources: BrandSource[] }) {
  return (
    <section id="sources" className="mb-[clamp(24px,3vw,36px)] scroll-mt-24">
      <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
        Sources and model scope
      </h2>
      <p className="mt-3 max-w-[68ch] text-base leading-[1.65] text-text-body">
        {MODEL_SCOPE_WARNING}
      </p>
      <p className="mt-3 max-w-[68ch] text-sm leading-[1.65] text-text-muted">
        Scope used here: {code.modelScope}
      </p>
      <ul className="mt-4 space-y-3">
        {code.verificationStatus === "model-specific-unverified" && (
          <li className="text-sm font-semibold text-text-muted">
            Model-finding reference only — this does not validate a universal meaning for the code.
          </li>
        )}
        {sources.map((source) => (
          <li key={source.id} className="rounded-[14px] border border-[var(--line-on-paper)] bg-paper-2 p-4">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ember-deeper underline decoration-[rgba(181,67,11,0.28)] underline-offset-2 hover:text-ember"
            >
              {source.publisher}: {source.title}
            </a>
            <p className="mt-1 text-sm leading-[1.6] text-text-muted">
              {source.documentId} · {source.appliesTo}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-[1.6] text-text-muted">
        Compiled by{" "}
        <StaticLink href="/about" className="font-semibold text-ember-deeper hover:text-ember">
          Warmlo Editorial
        </StaticLink>{" "}
        · Reviewed August 2026
      </p>
    </section>
  );
}

function UnverifiedCodePage({ brand, code, sources }: { brand: Brand; code: Code; sources: BrandSource[] }) {
  return (
    <div className="min-h-screen text-text-on-dark">
      <section className="relative overflow-hidden px-[var(--pad-page-x)] pb-[clamp(40px,6vw,72px)] pt-[clamp(28px,4vw,48px)]">
        <div className="relative z-[1] mx-auto max-w-[820px]">
          <Breadcrumb
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Fix", href: "/fix" },
              { label: brand.name, href: `/fix/${brand.slug}` },
              { label: code.code },
            ]}
          />
          <h1 className="mt-6 font-display text-h1 font-bold leading-[1.02] tracking-[-0.03em] text-text-on-dark">
            {brand.name} furnace code {code.code}: check your model chart
          </h1>
          <p className="mt-4 max-w-[60ch] text-lead leading-[1.6] text-text-on-dark-3">
            This code does not have one safe meaning across every {brand.name} furnace. We will not guess and risk
            sending you toward the wrong repair.
          </p>
        </div>
      </section>
      <main id="main-content" className="paper-sheet">
        <article className="mx-auto max-w-[820px] px-[var(--pad-page-x)] py-[clamp(40px,5vw,68px)]">
          <section className="mb-[clamp(32px,4vw,48px)]">
            <h2 className="font-display text-h2 font-bold text-text-strong">What to do next</h2>
            <ol className="mt-4 space-y-3 text-base leading-[1.65] text-text-body">
              <li>1. Photograph the full model number on the furnace rating plate.</li>
              <li>2. Read the diagnostic chart printed inside the removable furnace panel.</li>
              <li>3. Match both the code and model before resetting the furnace or ordering a part.</li>
            </ol>
            <p className="mt-4 rounded-[14px] border border-[rgba(181,67,11,0.18)] bg-[rgba(224,135,26,0.08)] p-4 leading-[1.65] text-text-body">
              {MODEL_SCOPE_WARNING}
            </p>
          </section>
          <CodeSources code={code} sources={sources} />
          <p className="rounded-[14px] border border-[rgba(23,18,14,0.08)] bg-[rgba(23,18,14,0.04)] p-[18px_20px] text-[13.5px] leading-[1.6] text-text-faint">
            {CODE_PAGE_DISCLAIMER}
          </p>
        </article>
      </main>
      <CodePageAnalyticsScript brand={brand.slug} code={code.code} />
    </div>
  );
}

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

  if (!isVerifiedCode(code)) {
    return {
      title: `${brand.name} Furnace Code ${code.code}: Check Your Model Chart`,
      description: `${brand.name} code ${code.code} varies by furnace model and control board. Use the panel chart or exact manufacturer manual before troubleshooting.`,
      alternates: { canonical: `/fix/${brandSlug}/${codeSlug}` },
      robots: { index: false, follow: true },
    };
  }

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

  const sources = getSourcesForCode(code);
  if (!isVerifiedCode(code)) {
    return <UnverifiedCodePage brand={brand} code={code} sources={sources} />;
  }

  const repair = getRepairBySlug(code.relatedRepairSlug);
  const { dataUpdated } = getBenchmarks();
  const relatedCodes = getRelatedCodes(brandSlug, codeSlug, 6);
  const relatedSymptoms = getSymptomsForCode(brandSlug, codeSlug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warmlo.com";
  const jsonLd = buildCodePageJsonLd(brand, code, baseUrl);
  const costProse = repair
    ? buildRepairCostProse(repair.name, code.repairCostLow, code.repairCostHigh)
    : null;

  const shortMeaning = code.title.includes(":")
    ? code.title.split(":").slice(1).join(":").trim()
    : code.meaning;

  const pageSections = [
    { href: "#meaning", label: "Meaning" },
    { href: "#causes", label: "Common causes" },
    { href: "#first-steps", label: "First steps" },
    { href: "#repair-cost", label: "Repair cost" },
    { href: "#call-a-pro", label: "When to call a pro" },
    ...(relatedSymptoms.length > 0 ? [{ href: "#symptoms", label: "Symptoms" }] : []),
    ...(relatedCodes.length > 0 ? [{ href: "#related-codes", label: "Related codes" }] : []),
    { href: "#sources", label: "Sources" },
  ];

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
                <FreshnessStamp dataUpdated={CODE_REVIEWED_MONTH} label="reviewed" />
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

          <OnThisPageNav items={pageSections} />

          <section id="meaning" className="mb-[clamp(32px,4vw,48px)] scroll-mt-24">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              What does {brand.name} code {code.code} mean?
            </h2>
            <p className="mt-3.5 max-w-[68ch] text-base leading-[1.65] text-text-body">
              {code.snippetAnswer ?? code.meaning}
            </p>
          </section>

          <section id="causes" className="mb-[clamp(32px,4vw,48px)] scroll-mt-24">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              What causes {brand.name} code {code.code}?
            </h2>
            <ul className="mt-4 grid gap-2.5 text-base leading-[1.65] text-text-body">
              {code.commonCauses.map((cause) => (
                <li key={cause} className="flex items-start gap-3">
                  <span className="mt-[0.65em] h-2 w-2 shrink-0 rounded-full bg-ember" aria-hidden="true" />
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="first-steps" className="mb-[clamp(32px,4vw,48px)] scroll-mt-24">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              Can I troubleshoot {brand.name} code {code.code}?
            </h2>
            <div className="mt-4">
              {code.severity === "emergency" && code.dangerNote ? (
                <DangerAlert message={code.dangerNote} />
              ) : (
                <NumberedStepList steps={code.diySteps} severity={code.severity} />
              )}
            </div>
          </section>

          <section id="repair-cost" className="mb-[clamp(32px,4vw,48px)] scroll-mt-24">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              How much does {brand.name} code {code.code} cost to fix?
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

          <section id="call-a-pro" className="mb-[clamp(32px,4vw,48px)] scroll-mt-24">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              When should I call a technician?
            </h2>
            <p className="mt-4 max-w-[68ch] text-base leading-[1.65] text-text-body">
              {code.whenToCallPro}
            </p>
          </section>

          {relatedSymptoms.length > 0 && (
            <section id="symptoms" className="mb-[clamp(32px,4vw,48px)] scroll-mt-24">
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
            <section id="related-codes" className="mb-[clamp(24px,3vw,36px)] scroll-mt-24">
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

          <CodeSources code={code} sources={sources} />

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

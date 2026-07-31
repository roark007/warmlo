import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CodeCard } from "@/components/CodeCard";
import { CostRangeDisplay } from "@/components/CostRangeDisplay";
import { CtaBlock } from "@/components/CtaBlock";
import { DangerAlert } from "@/components/DangerAlert";
import { LedChip } from "@/components/LedChip";
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
} from "@/lib/data";
import { buildCodePageJsonLd, CODE_PAGE_DISCLAIMER } from "@/lib/seo";
import { CodePageAnalytics } from "@/components/CodePageAnalytics";

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

  const description =
    code.meaning.length <= 155 ? code.meaning : `${code.meaning.slice(0, 152)}...`;

  return {
    title: `${brand.name} Furnace Code ${code.code} — Meaning, Fix & Repair Cost`,
    description,
    alternates: {
      canonical: `/fix/${brandSlug}/${codeSlug}`,
    },
    openGraph: {
      title: `${brand.name} Furnace Code ${code.code}: ${shortMeaning}`,
      description,
    },
  };
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warmlo.com";
  const jsonLd = buildCodePageJsonLd(brand, code, baseUrl);

  const shortMeaning = code.title.includes(":")
    ? code.title.split(":").slice(1).join(":").trim()
    : code.meaning;

  return (
    <article className="mx-auto max-w-[720px] px-5 pb-16 md:px-8">
      <CodePageAnalytics brand={brand.slug} code={code.code} />
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Fix", href: "/fix" },
          { label: brand.name, href: `/fix/${brand.slug}` },
          { label: code.code },
        ]}
      />

      <h1 className="mt-2 font-serif text-[30px] font-bold leading-9 text-ink-900 md:text-[40px] md:leading-[44px]">
        {brand.name} Furnace Code {code.code}: {shortMeaning}
      </h1>

      <div className="mt-4 flex items-center gap-3">
        <LedChip>{code.code}</LedChip>
        <SeverityBadge severity={code.severity} />
      </div>

      {code.dangerNote && (
        <div className="mt-5">
          <DangerAlert message={code.dangerNote} />
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold text-ink-900 md:text-[30px] md:leading-9">
          What it means
        </h2>
        <p className="mt-4 max-w-[68ch] text-base text-ink-700">{code.meaning}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold text-ink-900 md:text-[30px] md:leading-9">
          Try this first
        </h2>
        <div className="mt-4">
          {code.severity === "emergency" && code.dangerNote ? (
            <div className="rounded-md border border-[#FECACA] border-l-4 border-l-[#DC2626] bg-[#FEF2F2] p-4">
              <p className="text-[15px] font-semibold leading-[22px] text-[#7F1D1D]">
                {code.dangerNote}
              </p>
            </div>
          ) : (
            <NumberedStepList steps={code.diySteps} />
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold text-ink-900 md:text-[30px] md:leading-9">
          What a repair costs
        </h2>
        <div className="mt-4">
          <CostRangeDisplay
            costLow={code.repairCostLow}
            costHigh={code.repairCostHigh}
            repairSlug={code.relatedRepairSlug}
            repairName={repair?.name ?? code.relatedRepairSlug}
            dataUpdated={dataUpdated}
          />
        </div>
      </section>

      <div className="mt-10">
        <CtaBlock repairSlug={code.relatedRepairSlug} />
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold text-ink-900 md:text-[30px] md:leading-9">
          When to call a pro
        </h2>
        <p className="mt-4 max-w-[68ch] text-base text-ink-700">{code.whenToCallPro}</p>
      </section>

      {relatedCodes.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold text-ink-900 md:text-[30px] md:leading-9">
            Related codes
          </h2>
          <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
            {relatedCodes.map((related) => (
              <div
                key={related.slug}
                className="w-[200px] shrink-0 snap-start md:w-auto"
              >
                <CodeCard brandSlug={brandSlug} code={related} />
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-12 max-w-[68ch] border-t border-line pt-5 text-[13px] leading-5 text-ink-600">
        {CODE_PAGE_DISCLAIMER}
      </p>
    </article>
  );
}

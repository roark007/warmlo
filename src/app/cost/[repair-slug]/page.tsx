import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CostRangeDisplay } from "@/components/CostRangeDisplay";
import { CtaBlock } from "@/components/CtaBlock";
import { FreshnessStamp } from "@/components/FreshnessStamp";
import { CodeTableRow } from "@/components/CodeTableRow";
import {
  getBenchmarks,
  getCodesForRepair,
  getRepairs,
  getRepairBySlug,
} from "@/lib/data";
import { CODE_PAGE_DISCLAIMER } from "@/lib/seo";

export function generateStaticParams() {
  return getRepairs().map((repair) => ({ "repair-slug": repair.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "repair-slug": string }>;
}) {
  const { "repair-slug": slug } = await params;
  const repair = getRepairBySlug(slug);
  if (!repair) return { title: "Cost Guide Not Found" };
  const year = new Date().getFullYear();
  return {
    title: `${repair.name} Cost (${year})`,
    description: repair.description,
    alternates: { canonical: `/cost/${slug}` },
  };
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export default async function CostPage({
  params,
}: {
  params: Promise<{ "repair-slug": string }>;
}) {
  const { "repair-slug": slug } = await params;
  const repair = getRepairBySlug(slug);
  if (!repair) notFound();

  const { dataUpdated } = getBenchmarks();
  const relatedCodes = getCodesForRepair(slug);
  const year = new Date().getFullYear();

  const partMid = (repair.partCostLow + repair.partCostHigh) / 2;
  const costMid = (repair.costLow + repair.costHigh) / 2;
  const partShare = Math.min(100, Math.max(0, (partMid / costMid) * 100));
  const laborLow = Math.max(0, repair.costLow - repair.partCostHigh);
  const laborHigh = Math.max(0, repair.costHigh - repair.partCostLow);

  return (
    <article className="mx-auto max-w-[720px] px-5 pb-16 md:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Costs" },
          { label: repair.name },
        ]}
      />

      <h1 className="mt-4 font-serif text-[30px] font-bold leading-9 text-ink-900 md:text-[40px] md:leading-[44px]">
        {repair.name} Cost ({year})
      </h1>

      <div className="mt-6">
        <CostRangeDisplay
          costLow={repair.costLow}
          costHigh={repair.costHigh}
          repairSlug={repair.slug}
          repairName={repair.name}
          dataUpdated={dataUpdated}
          variant="large"
        />
      </div>

      <div className="mt-5 rounded-md border border-line bg-surface p-5">
        <h3 className="font-serif text-xl font-semibold text-ink-900">
          Where the money goes
        </h3>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full">
          <div className="bg-ink-400" style={{ width: `${partShare}%` }} />
          <div className="bg-ink-700" style={{ width: `${100 - partShare}%` }} />
        </div>
        <div className="mt-2.5 flex flex-col gap-4 sm:flex-row sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-ink-400" />
            <span className="text-sm font-medium text-ink-900">Part</span>
            <span className="text-sm text-ink-600 [font-feature-settings:'tnum']">
              {formatCurrency(repair.partCostLow)}–{formatCurrency(repair.partCostHigh)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-ink-700" />
            <span className="text-sm font-medium text-ink-900">Labor</span>
            <span className="text-sm text-ink-600 [font-feature-settings:'tnum']">
              {formatCurrency(laborLow)}–{formatCurrency(laborHigh)}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[13px] text-ink-600">
          Typical labor time: {repair.laborHours} hrs
        </p>
      </div>

      <p className="mt-8 max-w-[68ch] text-base text-ink-700">{repair.description}</p>

      <section className="mt-8">
        <h3 className="font-serif text-xl font-semibold text-ink-900">
          You might need this if…
        </h3>
        <ul className="mt-4 space-y-4">
          {repair.signals.map((signal) => (
            <li key={signal} className="flex gap-4 text-[15px] leading-[22px] text-ink-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-[2px] bg-ink-900" />
              {signal}
            </li>
          ))}
        </ul>
      </section>

      <span className="mt-6 inline-flex rounded-full border-[1.5px] border-line-strong bg-surface px-3 py-1 text-xs font-semibold text-ink-700">
        DIY difficulty: {repair.diyDifficulty}
      </span>

      <div className="mt-10">
        <CtaBlock repairSlug={repair.slug} />
      </div>

      {relatedCodes.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold text-ink-900">Related error codes</h2>
          <div className="mt-4 overflow-hidden rounded-md border border-line bg-surface">
            {relatedCodes.map(({ brand, code }) => (
              <CodeTableRow key={`${brand.slug}-${code.slug}`} brandSlug={brand.slug} code={code} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-8">
        <FreshnessStamp dataUpdated={dataUpdated} />
      </div>

      <p className="mt-12 max-w-[68ch] border-t border-line pt-5 text-[13px] leading-5 text-ink-600">
        {CODE_PAGE_DISCLAIMER}
      </p>
    </article>
  );
}

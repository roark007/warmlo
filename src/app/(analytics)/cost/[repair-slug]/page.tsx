import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
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
    openGraph: {
      title: `${repair.name} Cost (${year})`,
      description: repair.description,
    },
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
    <div className="min-h-screen text-text-on-dark">
      <section className="relative overflow-hidden px-[var(--pad-page-x)] pb-[clamp(38px,5vw,60px)] pt-[clamp(28px,4vw,48px)]">
        <div className="hero-glow-field" aria-hidden="true">
          <div className="hero-glow-primary" />
        </div>
        <div className="relative z-[1] mx-auto max-w-[920px]">
          <Breadcrumb
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Costs" },
              { label: repair.name },
            ]}
          />

          <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] items-center gap-[clamp(24px,4vw,48px)]">
            <div>
              <div className="mb-3.5 text-eyebrow font-semibold uppercase tracking-eyebrow text-[#ff9a4d]">
                Typical repair cost
              </div>
              <h1 className="font-display text-[clamp(30px,4.6vw,46px)] font-bold leading-[1.02] tracking-[-0.03em] text-text-on-dark">
                {repair.name} Cost{" "}
                <span className="text-text-on-dark-4">({year})</span>
              </h1>
              <p className="mt-4 max-w-[46ch] text-lead leading-[1.6] text-text-on-dark-3">
                {repair.description}
              </p>
            </div>

            <div
              className="mx-auto w-[min(360px,90vw)] justify-self-center rounded-[22px] border border-[rgba(255,170,84,0.18)] p-[26px]"
              style={{
                background: "var(--grad-panel-dark)",
                boxShadow: "var(--shadow-panel)",
              }}
            >
              <div className="mb-2.5 text-[11px] uppercase tracking-[0.22em] text-[#7a6c5c]">
                National range
              </div>
              <div className="font-display text-[clamp(44px,7vw,60px)] font-bold leading-none tracking-[-0.02em] text-text-on-dark [font-feature-settings:'tnum']">
                {formatCurrency(repair.costLow)}
                <span className="text-[#ff9a4d]">–</span>
                {formatCurrency(repair.costHigh)}
              </div>
              <div className="mt-5">
                <div className="bar-grow flex h-2.5 overflow-hidden rounded-pill bg-[rgba(239,231,219,0.1)]">
                  <div className="bg-[#c99a5e]" style={{ width: `${partShare}%` }} />
                  <div
                    className="bg-[linear-gradient(90deg,#ff8a3c,#ec5d1a)]"
                    style={{ width: `${100 - partShare}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-[12.5px] text-text-on-dark-3 [font-feature-settings:'tnum']">
                  <span>
                    Part {formatCurrency(repair.partCostLow)}–{formatCurrency(repair.partCostHigh)}
                  </span>
                  <span>
                    Labor {formatCurrency(laborLow)}–{formatCurrency(laborHigh)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-[var(--line-on-dark)] pt-3.5 text-[12.5px] text-text-on-dark-4">
                <FreshnessStamp dataUpdated={dataUpdated} />
                <span>· labor {repair.laborHours} hrs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="paper-sheet">
        <article className="mx-auto max-w-[820px] px-[var(--pad-page-x)] py-[clamp(40px,5vw,64px)]">
          <section className="reveal mb-[clamp(32px,4vw,48px)] rounded-[20px] border border-[var(--line-on-paper)] bg-paper-2 p-[clamp(22px,3vw,30px)] shadow-[var(--shadow-card)]">
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              Where the money goes
            </h2>
            <div className="mt-[18px] flex h-3.5 overflow-hidden rounded-pill bg-[#efe7db]">
              <div className="bg-[#c99a5e]" style={{ width: `${partShare}%` }} />
              <div className="bg-ember-deeper" style={{ width: `${100 - partShare}%` }} />
            </div>
            <div className="mt-3.5 flex flex-wrap gap-6 text-sm text-text-body">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-[3px] bg-[#c99a5e]" />
                Part{" "}
                <strong className="text-text-strong [font-feature-settings:'tnum']">
                  {formatCurrency(repair.partCostLow)}–{formatCurrency(repair.partCostHigh)}
                </strong>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-[3px] bg-ember-deeper" />
                Labor{" "}
                <strong className="text-text-strong [font-feature-settings:'tnum']">
                  {formatCurrency(laborLow)}–{formatCurrency(laborHigh)}
                </strong>
              </span>
              <span className="text-text-muted">Typical labor time: {repair.laborHours} hrs</span>
            </div>
          </section>

          <section className="reveal mb-[clamp(32px,4vw,48px)]">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
                You might need this if…
              </h2>
              <span className="inline-flex items-center gap-2 rounded-pill bg-[var(--pro-wash)] px-3 py-1.5 text-[12.5px] font-semibold text-pro-ink">
                <span className="h-[7px] w-[7px] rounded-full bg-pro-solid" />
                DIY difficulty: {repair.diyDifficulty}
              </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3">
              {repair.signals.map((signal) => (
                <div
                  key={signal}
                  className="flex items-center gap-3 rounded-[16px] border border-[var(--line-on-paper)] bg-paper-2 p-[18px_20px] text-[15.5px] text-[#2f2a24]"
                >
                  <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-[rgba(255,122,45,0.12)] text-base text-ember-deeper">
                    •
                  </span>
                  {signal}
                </div>
              ))}
            </div>
          </section>

          <section className="reveal mb-[clamp(32px,4vw,48px)]">
            <div className="section-eyebrow mb-3">The part</div>
            <p className="max-w-[68ch] text-base leading-[1.65] text-text-body">{repair.description}</p>
          </section>

          <div className="reveal mb-[clamp(32px,4vw,48px)]">
            <CtaBlock repairSlug={repair.slug} />
          </div>

          {relatedCodes.length > 0 && (
            <section className="reveal mb-[clamp(32px,4vw,48px)]">
              <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
                Related error codes
              </h2>
              <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-[11px]">
                {relatedCodes.map(({ brand, code }) => (
                  <CodeTableRow
                    key={`${brand.slug}-${code.slug}`}
                    brandSlug={brand.slug}
                    code={code}
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
    </div>
  );
}

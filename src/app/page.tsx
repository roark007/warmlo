import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { CodeSearchBox, type CodeSearchEntry } from "@/components/CodeSearchBox";
import { CodeCard } from "@/components/CodeCard";
import { FreshnessStamp } from "@/components/FreshnessStamp";
import { featuredRepairs } from "@/config/featuredRepairs";
import { getAllCodes, getBenchmarks, getRepairBySlug } from "@/lib/data";
import { ChevronRightIcon } from "@/components/icons";

export default function HomePage() {
  const { dataUpdated } = getBenchmarks();
  const allCodes = getAllCodes();
  const searchEntries: CodeSearchEntry[] = allCodes.map(({ brand, code }) => ({
    brandSlug: brand.slug,
    brandName: brand.name,
    code,
  }));

  const popularCodes = allCodes.slice(0, 6);
  const costGuides = featuredRepairs
    .map((slug) => getRepairBySlug(slug))
    .filter((r): r is NonNullable<typeof r> => r !== undefined)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-[1120px] px-5 md:px-8">
      <section className="pt-12 md:pt-20">
        <FreshnessStamp dataUpdated={dataUpdated} />
        <h1 className="mt-4 max-w-[22ch] font-serif text-[30px] font-bold leading-9 text-ink-900 md:text-[40px] md:leading-[44px]">
          Know what&apos;s wrong. Know what it should cost. Know who to call.
        </h1>
        <div className="mt-7">
          <CodeSearchBox entries={searchEntries} />
        </div>
        <div className="mt-3 max-w-[560px]">
          <Link
            href="/quote-check"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-md border-[1.5px] border-line-strong bg-surface text-base font-semibold text-ink-900 hover:border-ink-500 hover:bg-paper"
          >
            Check a quote
            <ArrowRightIcon size={16} />
          </Link>
        </div>
        <p className="mt-5 text-[13px] font-medium text-ink-700">
          Free <span className="text-ink-500">·</span> No signup{" "}
          <span className="text-ink-500">·</span> Independent
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl font-bold text-ink-900 md:text-[30px] md:leading-9">
          Popular error codes
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {popularCodes.map(({ brand, code }) => (
            <CodeCard key={`${brand.slug}-${code.slug}`} brandSlug={brand.slug} code={code} />
          ))}
        </div>
      </section>

      <section className="mt-16 pb-16">
        <h2 className="font-serif text-2xl font-bold text-ink-900 md:text-[30px] md:leading-9">
          Repair cost guides
        </h2>
        <div className="mt-4 overflow-hidden rounded-md border border-line bg-surface lg:grid lg:grid-cols-2 lg:gap-4 lg:border-0 lg:bg-transparent">
          {costGuides.map((repair, index) => (
            <Link
              key={repair.slug}
              href={`/cost/${repair.slug}`}
              className={`flex items-center justify-between px-4 py-4 transition-colors hover:bg-paper lg:rounded-md lg:border lg:border-line lg:bg-surface ${index < costGuides.length - 1 ? "border-b border-line lg:border-b" : ""}`}
            >
              <span className="text-[15px] font-medium text-ink-900">{repair.name}</span>
              <span className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-ink-900 [font-feature-settings:'tnum']">
                  ${repair.costLow}–${repair.costHigh}
                </span>
                <ChevronRightIcon size={16} className="text-ink-500" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

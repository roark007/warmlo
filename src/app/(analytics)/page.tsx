import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { CodeSearchBox, type CodeSearchEntry } from "@/components/CodeSearchBox";
import { CodeCard } from "@/components/CodeCard";
import { FreshnessStamp } from "@/components/FreshnessStamp";
import { featuredCodes } from "@/config/featuredCodes";
import { featuredRepairs } from "@/config/featuredRepairs";
import { getAllCodes, getBenchmarks, getBrand, getCode, getRepairBySlug } from "@/lib/data";

function revealDelay(step: number): CSSProperties {
  return { "--reveal-delay": `${step}ms` } as CSSProperties;
}

export default function HomePage() {
  const { dataUpdated } = getBenchmarks();
  const allCodes = getAllCodes();
  const searchEntries: CodeSearchEntry[] = allCodes.map(({ brand, code }) => ({
    brandSlug: brand.slug,
    brandName: brand.name,
    code,
  }));

  const popularCodes = featuredCodes
    .map(({ brandSlug, codeSlug }) => {
      const brand = getBrand(brandSlug);
      const code = getCode(brandSlug, codeSlug);
      return brand && code ? { brand, code } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  const costGuides = featuredRepairs
    .map((slug) => getRepairBySlug(slug))
    .filter((r): r is NonNullable<typeof r> => r !== undefined)
    .slice(0, 4);

  return (
    <div className="min-h-screen text-text-on-dark">
      {/* Dark hero */}
      <section className="relative overflow-hidden px-[var(--pad-page-x)] pb-[clamp(40px,7vw,90px)] pt-[clamp(56px,9vw,120px)]">
        <div className="hero-glow-field" aria-hidden="true">
          <div className="hero-glow-primary" />
          <div className="hero-glow-secondary" />
        </div>

        <div className="relative z-[1] mx-auto max-w-[1160px]">
          <FreshnessStamp
            dataUpdated={dataUpdated}
            className="reveal mb-[clamp(22px,3.4vw,34px)] inline-flex rounded-pill border border-[var(--line-on-dark)] bg-[rgba(239,231,219,0.04)] px-3.5 py-1.5 text-[12.5px] tracking-[0.02em] text-text-on-dark-2"
          />

          <h1 className="font-display text-hero font-bold leading-[0.98] tracking-[-0.035em]">
            <span className="reveal hero-line text-text-on-dark" style={revealDelay(50)}>
              Know what&apos;s <span className="text-ember-hot">wrong</span>.
            </span>
            <span className="reveal hero-line text-text-on-dark" style={revealDelay(130)}>
              Know what it should <span className="grad-ember-text">cost</span>.
            </span>
            <span className="reveal hero-line text-text-on-dark-4" style={revealDelay(210)}>
              Know who to <span className="text-text-on-dark">call</span>.
            </span>
          </h1>

          <p
            className="reveal mt-[clamp(22px,3vw,30px)] max-w-[44ch] text-lead leading-[1.55] text-text-on-dark-3"
            style={revealDelay(280)}
          >
            Decode any furnace error code and check whether a contractor&apos;s quote is actually
            fair — before you sign anything.
          </p>

          <div
            className="reveal mt-[clamp(28px,4vw,44px)] flex max-w-[720px] flex-wrap items-stretch gap-3.5"
            style={revealDelay(340)}
          >
            <CodeSearchBox entries={searchEntries} variant="dark" />
            <Link href="/quote-check" className="btn-ember-lg shrink-0 whitespace-nowrap px-7 py-[19px]">
              Check a quote
              <ArrowRightIcon size={18} />
            </Link>
          </div>

          <div
            className="reveal mt-4 flex gap-5 text-[13.5px] tracking-[0.02em] text-text-on-dark-4"
            style={revealDelay(400)}
          >
            <span>Free</span>
            <span className="opacity-40">·</span>
            <span>No signup</span>
            <span className="opacity-40">·</span>
            <span>Independent</span>
          </div>
        </div>
      </section>

      {/* Paper sheet body */}
      <main id="main-content" className="paper-sheet flex-1">
        <div className="mx-auto max-w-[1160px] px-[var(--pad-page-x)] py-[clamp(36px,4vw,56px)]">
          <section>
            <div className="mb-[clamp(14px,1.6vw,20px)] flex flex-wrap items-baseline justify-between gap-5">
              <h2 className="font-display text-[clamp(23px,2.5vw,30px)] font-bold tracking-[-0.025em] text-text-strong">
                Most looked-up codes this season
              </h2>
              <Link
                href="/fix"
                className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-ember-deeper hover:text-ember"
              >
                Browse all brands <span className="text-[17px]">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-[var(--gap-grid)]">
              {popularCodes.map(({ brand, code }, index) => (
                <div key={`${brand.slug}-${code.slug}`} className="reveal" style={revealDelay((index % 3) * 70)}>
                  <CodeCard brandSlug={brand.slug} brandName={brand.name} code={code} />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-[clamp(40px,4.5vw,60px)]">
            <h2 className="mb-[clamp(14px,1.6vw,20px)] font-display text-[clamp(23px,2.5vw,30px)] font-bold tracking-[-0.025em] text-text-strong">
              Repair cost guides
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-[var(--gap-grid)]">
              {costGuides.map((repair, index) => (
                <Link
                  key={repair.slug}
                  href={`/cost/${repair.slug}`}
                  style={revealDelay((index % 2) * 70)}
                  className="reveal card-cost"
                >
                  <div>
                    <div className="font-display text-base font-semibold text-text-strong">
                      {repair.name}
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-text-muted">
                      {repair.laborHours} hrs typical labor
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <span className="font-ui text-base font-bold text-ember-deeper [font-feature-settings:'tnum']">
                      ${repair.costLow}–${repair.costHigh}
                    </span>
                    <span className="text-xl text-text-on-dark-2">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="cta-dark-panel mt-[clamp(40px,4.5vw,60px)]">
            <div
              className="pointer-events-none absolute right-[-8%] top-[-30%] h-[460px] w-[460px] bg-[radial-gradient(circle,rgba(255,122,45,0.28),rgba(20,16,12,0)_66%)]"
              aria-hidden="true"
            />
            <div className="relative z-[1] max-w-[560px]">
              <div className="mb-4 text-small font-semibold uppercase tracking-eyebrow text-[#ff9a4d]">
                QuoteCheck
              </div>
              <h2 className="font-display text-[clamp(26px,4vw,42px)] font-bold leading-[1.05] tracking-[-0.025em] text-text-on-dark">
                Got a quote? See exactly where it lands.
              </h2>
              <p className="mt-[18px] text-lead leading-[1.55] text-text-on-dark-3">
                Compare your contractor&apos;s price against national fair-range data and get an
                instant verdict — suspiciously low, fair, high, or a red flag.
              </p>
              <Link href="/quote-check" className="btn-ember-lg mt-7">
                Check your quote <span>→</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

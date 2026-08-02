import type { CSSProperties } from "react";
import { BrandCard } from "@/components/Breadcrumb";
import { CodeSearchBox, type CodeSearchEntry } from "@/components/CodeSearchBox";
import { getAllVerifiedCodes, getBrands, getVerifiedCodesForBrand } from "@/lib/data";

export const metadata = {
  title: "Furnace Error Codes by Brand",
  description:
    "Manufacturer-sourced furnace error-code lookup with model scope, safe first checks, repair costs, and direct links to official technical literature.",
  alternates: { canonical: "/fix" },
};

export default function FixIndexPage() {
  const brands = getBrands();
  const allCodes = getAllVerifiedCodes();
  const searchEntries: CodeSearchEntry[] = allCodes.map(({ brand, code }) => ({
    brandSlug: brand.slug,
    brandName: brand.name,
    code,
  }));

  const brandsWithCounts = brands
    .map((brand) => ({
      brand,
      codeCount: getVerifiedCodesForBrand(brand.slug).length,
    }))
    .filter(({ codeCount }) => codeCount > 0)
    .sort((a, b) => a.brand.name.localeCompare(b.brand.name));

  return (
    <div className="min-h-screen text-text-on-dark">
      <section className="relative overflow-hidden px-[var(--pad-page-x)] pb-[clamp(30px,4vw,44px)] pt-[clamp(36px,5vw,64px)]">
        <div className="hero-glow-field" aria-hidden="true">
          <div className="hero-glow-primary" />
        </div>
        <div className="relative z-[1] mx-auto max-w-[960px]">
          <h1 className="font-display text-h1 font-bold leading-[1.02] tracking-[-0.03em] text-text-on-dark">
            Furnace error codes
          </h1>
          <p className="mt-3 max-w-[68ch] text-lead leading-[1.6] text-text-on-dark-3">
            Look up any brand and code — meanings, severity, and what a repair should cost.
          </p>
          <div className="mt-6">
            <CodeSearchBox entries={searchEntries} variant="dark" />
          </div>
        </div>
      </section>

      <main id="main-content" className="paper-sheet">
        <div className="mx-auto max-w-[1120px] px-[var(--pad-page-x)] py-[clamp(36px,5vw,64px)]">
          <section>
            <p className="text-micro font-semibold uppercase tracking-eyebrow text-text-muted">
              Browse by brand
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
              {brandsWithCounts.map(({ brand, codeCount }, index) => (
                <div
                  key={brand.slug}
                  className="reveal"
                  style={{ "--reveal-delay": `${(index % 4) * 60}ms` } as CSSProperties}
                >
                  <BrandCard slug={brand.slug} name={brand.name} codeCount={codeCount} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

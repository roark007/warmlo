import { BrandCard } from "@/components/Breadcrumb";
import { CodeSearchBox, type CodeSearchEntry } from "@/components/CodeSearchBox";
import { getAllCodes, getBrands, getCodesForBrand } from "@/lib/data";

export const metadata = {
  title: "Furnace Error Codes",
  description: "Look up furnace and HVAC error codes by brand.",
};

export default function FixIndexPage() {
  const brands = getBrands();
  const allCodes = getAllCodes();
  const searchEntries: CodeSearchEntry[] = allCodes.map(({ brand, code }) => ({
    brandSlug: brand.slug,
    brandName: brand.name,
    code,
  }));

  const brandsWithCounts = brands
    .map((brand) => ({
      brand,
      codeCount: getCodesForBrand(brand.slug).length,
    }))
    .sort((a, b) => a.brand.name.localeCompare(b.brand.name));

  return (
    <div className="mx-auto max-w-[1120px] px-5 md:px-8">
      <div className="mx-auto max-w-[720px] lg:max-w-none">
        <h1 className="font-serif text-[30px] font-bold leading-9 text-ink-900 md:text-[40px] md:leading-[44px]">
          Furnace error codes
        </h1>
        <div className="mt-6">
          <CodeSearchBox entries={searchEntries} />
        </div>
      </div>
      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-600">
          Browse by brand
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {brandsWithCounts.map(({ brand, codeCount }) => (
            <BrandCard
              key={brand.slug}
              slug={brand.slug}
              name={brand.name}
              codeCount={codeCount}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

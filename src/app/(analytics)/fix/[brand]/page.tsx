import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CodeFilterTable } from "@/components/CodeFilterTable";
import { getBrand, getBrands, getCodesForBrand } from "@/lib/data";

export function generateStaticParams() {
  return getBrands().map((brand) => ({ brand: brand.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  return params.then(({ brand: brandSlug }) => {
    const brand = getBrand(brandSlug);
    if (!brand) return { title: "Brand Not Found" };
    return {
      title: `${brand.name} Furnace Error Codes`,
      description: `Complete list of ${brand.name} furnace error codes with meanings and repair guidance.`,
    };
  });
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandSlug } = await params;
  const brand = getBrand(brandSlug);
  if (!brand) notFound();

  const codes = getCodesForBrand(brandSlug);

  return (
    <div className="min-h-screen text-text-on-dark">
      <section className="relative overflow-hidden px-[var(--pad-page-x)] pb-[clamp(30px,4vw,44px)] pt-[clamp(36px,5vw,64px)]">
        <div className="hero-glow-field" aria-hidden="true">
          <div className="hero-glow-primary" />
        </div>
        <div className="relative z-[1] mx-auto max-w-[960px]">
          <Breadcrumb
            variant="dark"
            items={[
              { label: "Fix", href: "/fix" },
              { label: brand.name },
            ]}
          />
          <h1 className="mt-4 font-display text-h1 font-bold leading-[1.02] tracking-[-0.03em] text-text-on-dark">
            {brand.name} Furnace Error Codes
          </h1>
          <p className="mt-3 max-w-[68ch] text-lead leading-[1.6] text-text-on-dark-3">
            {brand.notes} {brand.codeFormat}
          </p>
        </div>
      </section>

      <main id="main-content" className="paper-sheet">
        <article className="mx-auto max-w-[960px] px-[var(--pad-page-x)] py-[clamp(36px,5vw,64px)]">
          <div className="reveal">
            <CodeFilterTable brandSlug={brandSlug} codes={codes} />
          </div>
        </article>
      </main>
    </div>
  );
}

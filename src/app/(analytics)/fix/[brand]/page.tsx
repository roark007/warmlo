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
    <article className="mx-auto max-w-[960px] px-5 md:px-8">
      <Breadcrumb
        items={[
          { label: "Fix", href: "/fix" },
          { label: brand.name },
        ]}
      />
      <h1 className="mt-4 font-serif text-[30px] font-bold leading-9 text-ink-900 md:text-[40px] md:leading-[44px]">
        {brand.name} Furnace Error Codes
      </h1>
      <p className="mt-3 max-w-[68ch] text-base text-ink-700">
        {brand.notes} {brand.codeFormat}
      </p>
      <div className="mt-6">
        <CodeFilterTable brandSlug={brandSlug} codes={codes} />
      </div>
    </article>
  );
}

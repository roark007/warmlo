import Link from "next/link";
import { getBrands, resolveSymptomCodeRef } from "@/lib/data";
import type { Symptom } from "@/lib/schemas";

interface SymptomCodeFinderProps {
  symptom: Symptom;
}

export function SymptomCodeFinder({ symptom }: SymptomCodeFinderProps) {
  const brands = getBrands();
  const brandName = new Map(brands.map((b) => [b.slug, b.name]));

  const entries = symptom.relatedCodes
    .map((ref) => resolveSymptomCodeRef(ref))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (entries.length === 0) return null;

  return (
    <section className="mb-[clamp(32px,4vw,48px)]">
      <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
        Find your exact error code
      </h2>
      <p className="mt-3 max-w-[68ch] text-base leading-[1.65] text-text-body">
        Select your furnace brand to jump to the code page for this symptom.
      </p>
      <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-3">
        {entries.map(({ brand, code }) => (
          <Link
            key={`${brand.slug}-${code.slug}`}
            href={`/fix/${brand.slug}/${code.slug}`}
            className="flex flex-col gap-1 rounded-[16px] border border-[var(--line-on-paper)] bg-paper-2 p-[18px_20px] shadow-[var(--shadow-card)] transition-transform duration-[var(--dur)] hover:-translate-y-0.5"
          >
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-text-muted">
              {brand.name}
            </span>
            <span className="font-display text-lg font-bold text-text-strong">{code.code}</span>
            <span className="text-[13.5px] leading-snug text-text-body line-clamp-2">
              {code.title.includes(":") ? code.title.split(":").slice(1).join(":").trim() : code.meaning}
            </span>
          </Link>
        ))}
      </div>
      {!entries.some((e) => brandName.has(e.brand.slug)) && (
        <p className="mt-3 text-sm text-text-muted">Brand not listed? Browse all codes on the Fix page.</p>
      )}
    </section>
  );
}

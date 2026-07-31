import Link from "next/link";
import { getActiveAffiliate } from "@/config/affiliates";

interface CtaBlockProps {
  repairSlug: string;
}

export function CtaBlock({ repairSlug }: CtaBlockProps) {
  const activeAffiliate = getActiveAffiliate();
  const quoteCheckHref = `/quote-check?job=${repairSlug}`;

  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href={quoteCheckHref}
          className="flex min-h-[52px] flex-1 items-center justify-center rounded-md border-[1.5px] border-line-strong bg-surface px-6 text-base font-semibold text-ink-900 transition-colors hover:border-ink-500 hover:bg-paper"
        >
          Got a repair quote already? See if the price is fair →
        </Link>
        {activeAffiliate ? (
          <a
            href={activeAffiliate.baseUrl}
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-md bg-pilot-700 px-6 text-base font-semibold text-white transition-colors hover:bg-pilot-800"
          >
            Get quotes from local pros
          </a>
        ) : (
          <Link
            href={quoteCheckHref}
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-md bg-pilot-700 px-6 text-base font-semibold text-white transition-colors hover:bg-pilot-800"
          >
            Get quotes from local pros
          </Link>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-ink-600">
        Free · No signup · No obligation
      </p>
    </div>
  );
}

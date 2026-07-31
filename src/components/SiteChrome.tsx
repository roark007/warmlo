import Link from "next/link";
import { featuredRepairs } from "@/config/featuredRepairs";

export function Header() {
  const costGuideSlug = featuredRepairs[0];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-5 md:h-16 md:px-8">
        <Link href="/" className="flex items-center gap-2.5" prefetch={false}>
          <span className="h-2 w-2 rounded-[4px] bg-pilot-600" aria-hidden="true" />
          <span className="font-serif text-xl font-bold text-ink-900">Warmlo</span>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/fix"
              prefetch={false}
              className="text-[15px] font-medium text-ink-700 hover:text-ink-900 hover:underline hover:underline-offset-4"
            >
              Fix codes
            </Link>
            {costGuideSlug && (
              <Link
                href={`/cost/${costGuideSlug}`}
                prefetch={false}
                className="text-[15px] font-medium text-ink-700 hover:text-ink-900 hover:underline hover:underline-offset-4"
              >
                Cost guides
              </Link>
            )}
          </nav>
          <Link
            href="/quote-check"
            prefetch={false}
            className="flex h-10 items-center rounded-md bg-pilot-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-pilot-800"
          >
            Check a quote
          </Link>
        </div>
      </div>
    </header>
  );
}

export const AFFILIATE_DISCLOSURE =
  "Warmlo may earn a fee when you request quotes through our partners.";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink-900 text-paper md:mt-24">
      <div className="mx-auto max-w-[1120px] px-5 py-12 md:px-8 md:py-16">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-[4px] bg-pilot-600" aria-hidden="true" />
          <span className="font-serif text-lg font-bold text-paper">Warmlo</span>
        </div>
        <p className="mt-2 max-w-[40ch] text-sm text-ink-400">
          Know what&apos;s wrong. Know what it should cost. Know who to call.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:flex md:gap-12">
          <div className="flex flex-col gap-3">
            <Link href="/privacy" className="text-sm font-medium text-[#E7E2D9] hover:text-white hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm font-medium text-[#E7E2D9] hover:text-white hover:underline">
              Terms
            </Link>
            <Link href="/disclosure" className="text-sm font-medium text-[#E7E2D9] hover:text-white hover:underline">
              Disclosure
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/fix" className="text-sm font-medium text-[#E7E2D9] hover:text-white hover:underline">
              Fix codes
            </Link>
            <Link href="/quote-check" className="text-sm font-medium text-[#E7E2D9] hover:text-white hover:underline">
              Check a quote
            </Link>
          </div>
        </div>
        <hr className="my-8 border-[#44403C]" />
        <p className="text-xs leading-[18px] text-ink-400">{AFFILIATE_DISCLOSURE}</p>
      </div>
    </footer>
  );
}

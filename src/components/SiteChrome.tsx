import { featuredRepairs } from "@/config/featuredRepairs";
import { StaticLink } from "@/components/StaticLink";

export function Header() {
  const costGuideSlug = featuredRepairs[0];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-5 md:h-16 md:px-8">
        <StaticLink href="/" className="flex items-center gap-2.5">
          <span className="pilot-mark h-2 w-2 rounded-[3px]" aria-hidden="true" />
          <span className="font-serif text-[22px] font-bold leading-none tracking-[-0.01em] text-ink-900 md:text-2xl">
            Warmlo
          </span>
        </StaticLink>
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 md:flex">
            <StaticLink
              href="/fix"
              className="text-[15px] font-medium text-ink-700 hover:text-ink-900 hover:underline hover:underline-offset-4"
            >
              Fix codes
            </StaticLink>
            {costGuideSlug && (
              <StaticLink
                href={`/cost/${costGuideSlug}`}
                className="text-[15px] font-medium text-ink-700 hover:text-ink-900 hover:underline hover:underline-offset-4"
              >
                Cost guides
              </StaticLink>
            )}
          </nav>
          <StaticLink
            href="/quote-check"
            className="btn-primary flex h-10 items-center rounded-md bg-pilot-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-pilot-800"
          >
            Check a quote
          </StaticLink>
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
        <div className="flex items-center gap-3 md:gap-3.5">
          <span
            className="pilot-mark-on-dark h-3 w-3 rounded-[4px] md:h-3.5 md:w-3.5"
            aria-hidden="true"
          />
          <span className="font-serif text-[42px] font-bold leading-[0.95] tracking-[-0.02em] text-paper md:text-[64px]">
            Warmlo
          </span>
        </div>
        <p className="mt-3 max-w-[40ch] text-sm text-ink-400 md:mt-4">
          Know what&apos;s wrong. Know what it should cost. Know who to call.
        </p>
        <div className="mt-9 grid grid-cols-2 gap-4 md:mt-10 md:flex md:gap-12">
          <div className="flex flex-col gap-3">
            <StaticLink href="/privacy" className="text-sm font-medium text-[#E7E2D9] hover:text-white hover:underline hover:underline-offset-4">
              Privacy
            </StaticLink>
            <StaticLink href="/terms" className="text-sm font-medium text-[#E7E2D9] hover:text-white hover:underline hover:underline-offset-4">
              Terms
            </StaticLink>
            <StaticLink href="/disclosure" className="text-sm font-medium text-[#E7E2D9] hover:text-white hover:underline hover:underline-offset-4">
              Disclosure
            </StaticLink>
          </div>
          <div className="flex flex-col gap-3">
            <StaticLink href="/fix" className="text-sm font-medium text-[#E7E2D9] hover:text-white hover:underline hover:underline-offset-4">
              Fix codes
            </StaticLink>
            <StaticLink href="/quote-check" className="text-sm font-medium text-[#E7E2D9] hover:text-white hover:underline hover:underline-offset-4">
              Check a quote
            </StaticLink>
          </div>
        </div>
        <hr className="my-8 border-[#44403C]" />
        <p className="text-xs leading-[18px] text-ink-400">{AFFILIATE_DISCLOSURE}</p>
      </div>
    </footer>
  );
}

import { featuredRepairs } from "@/config/featuredRepairs";
import { StaticLink } from "@/components/StaticLink";
import { Wordmark } from "@/components/Wordmark";

export function Header() {
  const costGuideSlug = featuredRepairs[0];

  return (
    <header className="site-header">
      <StaticLink href="/" aria-label="Warmlo home">
        <Wordmark size="header" pulse />
      </StaticLink>
      <nav className="flex items-center gap-[clamp(11px,2.2vw,30px)] text-ui font-medium">
        <span className="wm-navlinks contents">
          <StaticLink
            href="/fix"
            className="text-text-on-dark-2 tracking-[0.01em] hover:text-ember"
          >
            Fix codes
          </StaticLink>
          {costGuideSlug && (
            <StaticLink
              href={`/cost/${costGuideSlug}`}
              className="text-text-on-dark-2 tracking-[0.01em] hover:text-ember"
            >
              Cost guides
            </StaticLink>
          )}
        </span>
        <StaticLink href="/quote-check" className="btn-ember text-ui">
          Check a quote
        </StaticLink>
      </nav>
    </header>
  );
}

export const AFFILIATE_DISCLOSURE =
  "Warmlo may earn a fee when you request quotes through our partners.";

export function Footer() {
  return (
    <footer className="bg-ink text-text-on-dark-2">
      <div
        className="mx-auto max-w-[1160px] px-[var(--pad-page-x)] pb-16 pt-[clamp(48px,6vw,80px)]"
      >
        <Wordmark size="footer" />
        <p className="mt-[22px] max-w-[34ch] text-[clamp(16px,1.8vw,20px)] text-text-on-dark-4">
          Know what&apos;s wrong. Know what it should cost. Know who to call.
        </p>
        <div className="mt-10 flex flex-wrap gap-9 border-t border-[var(--line-on-dark)] pt-8 text-[15px]">
          <StaticLink href="/privacy" className="hover:text-ember">
            Privacy
          </StaticLink>
          <StaticLink href="/terms" className="hover:text-ember">
            Terms
          </StaticLink>
          <StaticLink href="/disclosure" className="hover:text-ember">
            Disclosure
          </StaticLink>
          <StaticLink href="/fix" className="hover:text-ember">
            Fix codes
          </StaticLink>
          <StaticLink href="/quote-check" className="hover:text-ember">
            Check a quote
          </StaticLink>
        </div>
        <p className="mt-9 text-small leading-[1.6] text-text-faint">{AFFILIATE_DISCLOSURE}</p>
      </div>
    </footer>
  );
}

import { buildAffiliateUrl, getActiveAffiliate } from "@/config/affiliates";
import { StaticLink } from "./StaticLink";

interface CtaBlockProps {
  repairSlug: string;
}

export function CtaBlock({ repairSlug }: CtaBlockProps) {
  const activeAffiliate = getActiveAffiliate();
  const quoteCheckHref = `/quote-check?job=${repairSlug}`;

  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3.5">
        <StaticLink
          href={quoteCheckHref}
          className="card-paper flex flex-col justify-between gap-[18px] p-6"
        >
          <div>
            <div className="font-display text-[19px] font-bold text-text-strong">
              Already got a repair quote?
            </div>
            <div className="mt-1.5 text-sm leading-[1.5] text-text-muted">
              See if the price is fair before you say yes.
            </div>
          </div>
          <span className="inline-flex items-center gap-2 font-semibold text-ember-deeper">
            Check your quote <span>→</span>
          </span>
        </StaticLink>

        {activeAffiliate ? (
          <a
            href={buildAffiliateUrl(activeAffiliate)}
            className="relative flex flex-col justify-between gap-[18px] overflow-hidden rounded-[18px] border border-[rgba(255,170,84,0.2)] p-6 text-text-on-dark transition-transform duration-[var(--dur)] [background:var(--grad-cta-dark)] hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-22px_rgba(255,122,45,0.5)]"
          >
            <div
              className="pointer-events-none absolute right-[-20%] top-[-40%] h-[280px] w-[280px] bg-[radial-gradient(circle,rgba(255,122,45,0.3),transparent_66%)]"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="font-display text-[19px] font-bold">Get quotes from local pros</div>
              <div className="mt-1.5 text-sm leading-[1.5] text-text-on-dark-3">
                Up to 3 competing bids from licensed techs.
              </div>
            </div>
            <span className="relative btn-ember justify-center py-3">Get quotes →</span>
          </a>
        ) : (
          <StaticLink
            href={quoteCheckHref}
            className="relative flex flex-col justify-between gap-[18px] overflow-hidden rounded-[18px] border border-[rgba(255,170,84,0.2)] p-6 text-text-on-dark [background:var(--grad-cta-dark)] hover:-translate-y-0.5"
          >
            <div
              className="pointer-events-none absolute right-[-20%] top-[-40%] h-[280px] w-[280px] bg-[radial-gradient(circle,rgba(255,122,45,0.3),transparent_66%)]"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="font-display text-[19px] font-bold">Get quotes from local pros</div>
              <div className="mt-1.5 text-sm leading-[1.5] text-text-on-dark-3">
                Up to 3 competing bids from licensed techs.
              </div>
            </div>
            <span className="relative btn-ember justify-center py-3">Get quotes →</span>
          </StaticLink>
        )}
      </div>
      <p className="mt-3.5 text-center text-small text-text-muted">
        Free · No signup · No obligation
      </p>
    </div>
  );
}

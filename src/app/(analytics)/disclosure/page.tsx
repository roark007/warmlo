import { AFFILIATE_DISCLOSURE } from "@/components/SiteChrome";

export const metadata = {
  title: "Affiliate Disclosure",
  description: "Warmlo affiliate and partner disclosure.",
  alternates: { canonical: "/disclosure" },
};

export default function DisclosurePage() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-12 md:px-8">
      <h1 className="font-serif text-[30px] font-bold text-ink-900 md:text-[40px]">
        Affiliate Disclosure
      </h1>
      <div className="mt-8 space-y-4 text-base text-ink-700">
        <p>Last updated: July 2026</p>
        <p>{AFFILIATE_DISCLOSURE}</p>
        <p>
          Warmlo participates in affiliate and lead-generation programs with home-improvement
          contractor networks including Networx, Modernize, Profitise, and others. When you
          click &quot;Get quotes from local pros&quot; or submit a lead form, we may receive
          compensation if you are connected with a contractor.
        </p>
        <p>
          This compensation helps us keep Warmlo free for homeowners. Our error code explanations
          and price benchmarks are researched independently and are not influenced by affiliate
          relationships.
        </p>
        <p>
          For questions about our partnerships, contact{" "}
          <a href="mailto:disclosure@warmlo.com" className="text-pilot-600 underline">
            disclosure@warmlo.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

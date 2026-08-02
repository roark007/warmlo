import { Suspense } from "react";
import { QuoteCheckFlow } from "@/components/QuoteCheckFlow";
import { getBenchmarks } from "@/lib/data";

export const metadata = {
  title: "HVAC Quote Check",
  description: "Check if your HVAC contractor quote is fair. Free, no signup required.",
  alternates: { canonical: "/quote-check" },
};

export default function QuoteCheckPage() {
  const { dataUpdated, benchmarks } = getBenchmarks();

  return (
    <div className="min-h-screen text-text-on-dark">
      <section className="relative overflow-hidden px-[var(--pad-page-x)] pb-[clamp(30px,4vw,44px)] pt-[clamp(36px,5vw,64px)]">
        <div className="hero-glow-field" aria-hidden="true">
          <div className="hero-glow-primary" />
        </div>
        <div className="relative z-[1] mx-auto max-w-[860px]">
          <div className="mb-[18px] inline-flex items-center gap-2 rounded-pill border border-[var(--line-on-dark)] bg-[rgba(239,231,219,0.04)] px-3.5 py-1.5 text-[12.5px] text-text-on-dark-2">
            <span className="h-2 w-2 rounded-full bg-status-fresh shadow-[0_0_10px_rgba(56,208,127,0.8)]" />
            QuoteCheck · independent price data
          </div>
          <h1 className="font-display text-[clamp(34px,5.5vw,58px)] font-bold leading-[1.02] tracking-[-0.03em] text-text-on-dark">
            Is your quote actually fair?
          </h1>
          <p className="mt-4 max-w-[52ch] text-lead leading-[1.6] text-text-on-dark-3">
            Compare your contractor&apos;s number against national fair-price ranges and get an
            instant, no-nonsense verdict — in three steps.
          </p>
        </div>
      </section>

      <main id="main-content" className="paper-sheet">
        <div className="mx-auto max-w-[860px] px-[var(--pad-page-x)] py-[clamp(36px,5vw,64px)]">
          <Suspense
            fallback={
              <div
                className="h-40 rounded-[20px] border border-[var(--line-on-paper)] bg-paper-2"
                aria-hidden="true"
              />
            }
          >
            <QuoteCheckFlow benchmarks={benchmarks} dataUpdated={dataUpdated} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

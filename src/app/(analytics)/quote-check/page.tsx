import { Suspense } from "react";
import { QuoteCheckFlow } from "@/components/QuoteCheckFlow";
import { getBenchmarks } from "@/lib/data";

export const metadata = {
  title: "HVAC Quote Check",
  description: "Check if your HVAC contractor quote is fair. Free, no signup required.",
};

export default function QuoteCheckPage() {
  const { dataUpdated, benchmarks } = getBenchmarks();

  return (
    <div className="mx-auto max-w-[720px] px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-[560px]">
        <h1 className="font-serif text-[30px] font-bold leading-9 text-ink-900 md:text-[40px] md:leading-[44px]">
          Check your HVAC quote
        </h1>
        <p className="mt-3 text-lg text-ink-700">
          Compare your contractor quote against national fair-price ranges.
        </p>
        <Suspense fallback={<div className="mt-5 h-40 rounded-md border border-line bg-surface" aria-hidden="true" />}>
          <QuoteCheckFlow benchmarks={benchmarks} dataUpdated={dataUpdated} />
        </Suspense>
      </div>
    </div>
  );
}

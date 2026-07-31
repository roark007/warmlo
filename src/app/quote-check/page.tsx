import Link from "next/link";

export const metadata = {
  title: "HVAC Quote Check",
  description: "Check if your HVAC contractor quote is fair. Free, no signup required.",
};

export default function QuoteCheckPage() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-[560px]">
        <h1 className="font-serif text-[30px] font-bold leading-9 text-ink-900 md:text-[40px] md:leading-[44px]">
          Check your HVAC quote
        </h1>
        <p className="mt-3 text-lg text-ink-700">
          Compare your contractor quote against national fair-price ranges. Coming in Phase 3.
        </p>
        <div className="mt-6 rounded-md border border-line bg-surface p-5 md:p-7">
          <p className="text-base text-ink-700">
            The 3-step QuoteCheck flow will be available in a future release. For now, browse{" "}
            <Link href="/fix" className="text-pilot-600 underline">
              furnace error codes
            </Link>{" "}
            or explore{" "}
            <Link href="/cost/ignitor-replacement" className="text-pilot-600 underline">
              repair cost guides
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

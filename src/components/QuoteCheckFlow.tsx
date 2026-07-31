"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon, ChevronDownIcon } from "./icons";
import { FreshnessStamp } from "./FreshnessStamp";
import { LeadForm } from "./LeadForm";
import { QuoteCheckStepper } from "./QuoteCheckStepper";
import { VerdictBar } from "./VerdictBar";
import { buildAffiliateUrl, getActiveAffiliate } from "@/config/affiliates";
import { repairSlugToJobType } from "@/config/jobMap";
import { trackEvent } from "@/lib/analytics";
import type { Benchmark } from "@/lib/schemas";
import { computeVerdict } from "@/lib/verdict";
import { VERDICT_DOT_COLORS, VERDICT_HEADLINES, formatUsd } from "@/lib/verdictCopy";

interface QuoteCheckFlowProps {
  benchmarks: Benchmark[];
  dataUpdated: string;
}

export function QuoteCheckFlow({ benchmarks, dataUpdated }: QuoteCheckFlowProps) {
  const searchParams = useSearchParams();
  const startedRef = useRef(false);

  const initialJob = useMemo(() => {
    const param = searchParams.get("job");
    if (!param) return benchmarks[0]?.jobType ?? "";
    if (benchmarks.some((b) => b.jobType === param)) return param;
    return repairSlugToJobType(param);
  }, [searchParams, benchmarks]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [jobType, setJobType] = useState(initialJob);
  const [priceInput, setPriceInput] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [checkedFactors, setCheckedFactors] = useState<string[]>([]);
  const [priceError, setPriceError] = useState<string | null>(null);

  const benchmark = benchmarks.find((b) => b.jobType === jobType) ?? benchmarks[0];
  const parsedPrice = parseFloat(priceInput.replace(/,/g, ""));

  const verdictResult = useMemo(() => {
    if (!benchmark || !Number.isFinite(parsedPrice) || parsedPrice <= 0) return null;
    return computeVerdict(benchmark, parsedPrice, checkedFactors);
  }, [benchmark, parsedPrice, checkedFactors]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("quotecheck_start");
    }
  }, []);

  useEffect(() => {
    if (step === 3 && verdictResult) {
      trackEvent("quotecheck_verdict", { bucket: verdictResult.verdict });
    }
  }, [step, verdictResult]);

  const toggleFactor = useCallback((id: string) => {
    setCheckedFactors((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }, []);

  function goToStep2() {
    setStep(2);
  }

  function goToVerdict() {
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setPriceError("Enter a valid quote amount.");
      return;
    }
    setPriceError(null);
    setStep(3);
  }

  function resetFlow() {
    setStep(1);
    setPriceInput("");
    setZipInput("");
    setCheckedFactors([]);
    setPriceError(null);
  }

  const activeAffiliate = getActiveAffiliate();
  const checkedFactorLabels = benchmark.factors
    .filter((f) => checkedFactors.includes(f.id))
    .map((f) => f.label);

  return (
    <div>
      <QuoteCheckStepper currentStep={step} />

      <div className="relative mt-4">
        {step === 1 && (
          <div className="rounded-md border border-line bg-surface p-5 md:p-7">
            <label htmlFor="job-type" className="mb-1.5 block text-sm font-semibold text-ink-900">
              What&apos;s the job?
            </label>
            <div className="relative">
              <select
                id="job-type"
                value={jobType}
                onChange={(e) => {
                  setJobType(e.target.value);
                  setCheckedFactors([]);
                }}
                className="h-[52px] w-full appearance-none rounded-md border-[1.5px] border-line-strong bg-surface py-0 pl-3.5 pr-10 text-base font-medium text-ink-900 hover:border-ink-500 focus:border-pilot-600 focus:outline-none"
              >
                {benchmarks.map((b) => (
                  <option key={b.jobType} value={b.jobType}>
                    {b.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500"
              />
            </div>
            <button
              type="button"
              onClick={goToStep2}
              className="mt-5 flex h-[52px] w-full items-center justify-center rounded-md bg-pilot-700 text-base font-semibold text-white transition-colors hover:bg-pilot-800"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && benchmark && (
          <div className="rounded-md border border-line bg-surface p-5 md:p-7">
            <p className="text-sm font-semibold text-ink-900">The quote</p>

            <div className="mt-4">
              <label htmlFor="quote-price" className="mb-1.5 block text-sm font-semibold text-ink-900">
                Quoted price
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-ink-500">
                  $
                </span>
                <input
                  id="quote-price"
                  type="text"
                  inputMode="decimal"
                  value={priceInput}
                  onChange={(e) => {
                    setPriceInput(e.target.value.replace(/[^\d.]/g, ""));
                    setPriceError(null);
                  }}
                  className={`h-14 w-full rounded-md border-[1.5px] bg-surface pl-8 pr-3.5 text-xl font-semibold text-ink-900 [font-feature-settings:'tnum'] hover:border-ink-500 focus:border-pilot-600 focus:outline-none ${
                    priceError ? "border-[#DC2626]" : "border-line-strong"
                  }`}
                  aria-invalid={!!priceError}
                />
              </div>
              {priceError && (
                <p className="mt-1.5 text-sm font-medium text-[#B91C1C]">{priceError}</p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="quote-zip" className="mb-1.5 block text-sm font-semibold text-ink-900">
                ZIP code
              </label>
              <input
                id="quote-zip"
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="h-[52px] w-full rounded-md border-[1.5px] border-line-strong bg-surface px-3.5 text-base [font-feature-settings:'tnum'] hover:border-ink-500 focus:border-pilot-600 focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-ink-600">
                Optional — only used to match you with local pros.
              </p>
            </div>

            {benchmark.factors.length > 0 && (
              <div className="mt-5 flex flex-col gap-2">
                {benchmark.factors.map((factor) => {
                  const checked = checkedFactors.includes(factor.id);
                  return (
                    <label
                      key={factor.id}
                      className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-md border-[1.5px] px-3 py-2.5 ${
                        checked
                          ? "border-pilot-600 bg-pilot-50"
                          : "border-line-strong bg-surface hover:border-ink-500"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFactor(factor.id)}
                        className="mt-0.5 h-5 w-5 shrink-0 rounded-sm border-[1.5px] border-line-strong accent-pilot-700"
                      />
                      <span className="text-[15px] font-medium text-ink-900">{factor.label}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex h-11 min-w-[44px] items-center gap-1.5 text-[15px] font-semibold text-pilot-600 hover:underline"
              >
                <ArrowLeftIcon size={16} />
                Back
              </button>
              <button
                type="button"
                onClick={goToVerdict}
                className="flex h-[52px] flex-1 items-center justify-center rounded-md bg-pilot-700 text-base font-semibold text-white transition-colors hover:bg-pilot-800"
              >
                Check my quote
              </button>
            </div>
          </div>
        )}

        {step === 3 && benchmark && verdictResult && (
          <div className="rounded-md border border-line bg-surface p-5 md:p-7">
            <div className="flex items-start gap-2.5">
              <span
                className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: VERDICT_DOT_COLORS[verdictResult.verdict] }}
              />
              <h2 className="font-serif text-[22px] font-bold leading-7 text-ink-900">
                {VERDICT_HEADLINES[verdictResult.verdict]}
              </h2>
            </div>

            <div className="mt-5">
              <VerdictBar
                adjustedLow={verdictResult.adjustedLow}
                adjustedHigh={verdictResult.adjustedHigh}
                redFlagAbovePct={benchmark.redFlagAbovePct}
                price={parsedPrice}
                verdict={verdictResult.verdict}
              />
            </div>

            <p className="mt-5 text-base text-ink-700">
              Fair range for this job:{" "}
              <span className="font-semibold text-ink-900 [font-feature-settings:'tnum']">
                {formatUsd(verdictResult.adjustedLow)}–{formatUsd(verdictResult.adjustedHigh)}
              </span>
            </p>
            <p className="mt-2 text-sm text-ink-600">
              {checkedFactorLabels.length > 0
                ? `Adjustments applied: ${checkedFactorLabels.join(", ")}`
                : "No adjustments applied"}
            </p>
            <FreshnessStamp dataUpdated={dataUpdated} className="mt-2" />

            <div className="mt-7">
              <p className="text-base font-semibold text-ink-900">
                Get up to 3 competing quotes from licensed local pros — free, no obligation.
              </p>
              {(verdictResult.verdict === "high" || verdictResult.verdict === "red-flag") && (
                <p className="mt-2 text-base text-ink-700">
                  Homeowners who compare 3 quotes save an average of 15–25% on HVAC work.
                </p>
              )}
              {activeAffiliate ? (
                <a
                  href={buildAffiliateUrl(activeAffiliate)}
                  onClick={() => trackEvent("affiliate_click", { network: activeAffiliate.id })}
                  className="mt-4 flex h-[52px] w-full items-center justify-center rounded-md bg-pilot-700 text-base font-semibold text-white transition-colors hover:bg-pilot-800"
                >
                  Get quotes from local pros
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })}
                    className="mt-4 flex h-[52px] w-full items-center justify-center rounded-md bg-pilot-700 text-base font-semibold text-white transition-colors hover:bg-pilot-800"
                  >
                    Get quotes from local pros
                  </button>
                  <div id="lead-form">
                    <LeadForm
                    jobType={benchmark.jobType}
                    jobLabel={benchmark.label}
                    quotedPrice={parsedPrice}
                    zipPrefill={zipInput}
                  />
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={resetFlow}
              className="mt-6 text-sm text-pilot-600 hover:underline"
            >
              Check another quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

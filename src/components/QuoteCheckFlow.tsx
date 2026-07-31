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
import {
  VERDICT_DOT_COLORS,
  VERDICT_HEADLINES,
  VERDICT_INK_COLORS,
  VERDICT_LABELS,
  VERDICT_PANEL_STYLES,
  formatUsd,
} from "@/lib/verdictCopy";

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

  const cardClass =
    "rounded-[20px] border border-[var(--line-on-paper)] bg-paper-2 p-[clamp(22px,3vw,30px)] shadow-[var(--shadow-card)]";

  return (
    <div>
      <QuoteCheckStepper currentStep={step} />

      <div className="relative">
        {step === 1 && (
          <div className={`step-enter ${cardClass}`}>
            <div className="section-eyebrow mb-1.5">Step 1</div>
            <label htmlFor="job-type" className="mb-4 block font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
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
                className="input-light h-[52px] appearance-none pr-10 font-semibold"
              >
                {benchmarks.map((b) => (
                  <option key={b.jobType} value={b.jobType}>
                    {b.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
            </div>
            <button type="button" onClick={goToStep2} className="btn-ember-lg mt-5 w-full">
              Continue
            </button>
          </div>
        )}

        {step === 2 && benchmark && (
          <div className={`step-enter ${cardClass}`}>
            <div className="section-eyebrow mb-1.5">Step 2</div>
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              The quote
            </h2>

            <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
              <label className="block">
                <span className="mb-1.5 block text-small font-semibold text-text-body">
                  Quoted price
                </span>
                <span className="relative flex items-center">
                  <span className="absolute left-4 font-bold text-text-muted">$</span>
                  <input
                    id="quote-price"
                    type="text"
                    inputMode="decimal"
                    value={priceInput}
                    onChange={(e) => {
                      setPriceInput(e.target.value.replace(/[^\d.]/g, ""));
                      setPriceError(null);
                    }}
                    className={`input-light pl-8 text-base font-semibold [font-feature-settings:'tnum'] ${
                      priceError ? "border-emerg-solid" : ""
                    }`}
                    aria-invalid={!!priceError}
                  />
                </span>
                {priceError && (
                  <p className="mt-1.5 text-sm font-medium text-emerg-ink">{priceError}</p>
                )}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-small font-semibold text-text-body">
                  ZIP code
                </span>
                <input
                  id="quote-zip"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  className="input-light font-semibold [font-feature-settings:'tnum']"
                />
                <p className="mt-1.5 text-micro text-text-muted">
                  Optional — only used to match you with local pros.
                </p>
              </label>
            </div>

            {benchmark.factors.length > 0 && (
              <div className="mt-4">
                <span className="mb-2 block text-small font-semibold text-text-body">
                  What&apos;s included? (adjusts the fair range)
                </span>
                <div className="flex flex-wrap gap-2">
                  {benchmark.factors.map((factor) => {
                    const checked = checkedFactors.includes(factor.id);
                    return (
                      <button
                        key={factor.id}
                        type="button"
                        onClick={() => toggleFactor(factor.id)}
                        className={`inline-flex items-center gap-2 rounded-pill px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${
                          checked
                            ? "border border-[rgba(31,157,99,0.3)] bg-[var(--safe-wash)] text-safe-ink"
                            : "border border-[var(--line-on-paper-strong)] bg-paper-sink text-text-muted"
                        }`}
                      >
                        <span
                          className={`grid h-[15px] w-[15px] place-items-center rounded-[5px] text-[10px] ${
                            checked
                              ? "bg-safe-solid text-white"
                              : "border border-[var(--line-on-paper-strong)] bg-[#d9cdbd]"
                          }`}
                        >
                          {checked ? "✓" : ""}
                        </span>
                        {factor.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex h-11 min-w-[44px] items-center gap-1.5 text-[15px] font-semibold text-ember-deeper hover:text-ember"
              >
                <ArrowLeftIcon size={16} />
                Back
              </button>
              <button type="button" onClick={goToVerdict} className="btn-ember-lg flex-1">
                Check my quote
              </button>
            </div>
          </div>
        )}

        {step === 3 && benchmark && verdictResult && (
          <div className={`step-enter ${cardClass}`}>
            <div className="section-eyebrow mb-1.5">Step 3</div>
            <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">
              Your verdict
            </h2>

            <div
              className="relative mt-5 overflow-hidden rounded-[18px] border p-[clamp(18px,2.4vw,26px)]"
              style={{
                background: VERDICT_PANEL_STYLES[verdictResult.verdict].bg,
                borderColor: VERDICT_PANEL_STYLES[verdictResult.verdict].border,
                boxShadow:
                  verdictResult.verdict === "fair"
                    ? "0 0 0 1px rgba(31,157,99,0.08), 0 18px 40px -28px rgba(31,157,99,0.5)"
                    : undefined,
              }}
            >
              {verdictResult.verdict === "red-flag" && (
                <div
                  className="pointer-events-none absolute right-[-10%] top-[-40%] h-[280px] w-[280px] bg-[radial-gradient(circle,rgba(224,73,46,0.16),transparent_66%)]"
                  aria-hidden="true"
                />
              )}
              <div className="relative mb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="verdict-dot-pulse h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor: VERDICT_DOT_COLORS[verdictResult.verdict],
                      boxShadow: `0 0 12px ${VERDICT_DOT_COLORS[verdictResult.verdict]}`,
                    }}
                  />
                  <span
                    className="font-display text-[clamp(17px,2.1vw,21px)] font-bold"
                    style={{ color: VERDICT_INK_COLORS[verdictResult.verdict] }}
                  >
                    {VERDICT_LABELS[verdictResult.verdict]}
                  </span>
                </div>
              </div>

              <VerdictBar
                adjustedLow={verdictResult.adjustedLow}
                adjustedHigh={verdictResult.adjustedHigh}
                redFlagAbovePct={benchmark.redFlagAbovePct}
                price={parsedPrice}
                verdict={verdictResult.verdict}
              />
            </div>

            <p className="mt-5 text-base text-text-body">{VERDICT_HEADLINES[verdictResult.verdict]}</p>

            <p className="mt-3 text-base text-text-body">
              Fair range for this job:{" "}
              <span className="font-semibold text-text-strong [font-feature-settings:'tnum']">
                {formatUsd(verdictResult.adjustedLow)}–{formatUsd(verdictResult.adjustedHigh)}
              </span>
            </p>
            <p className="mt-2 text-sm text-text-muted">
              {checkedFactorLabels.length > 0
                ? `Adjustments applied: ${checkedFactorLabels.join(", ")}`
                : "No adjustments applied"}
            </p>
            <FreshnessStamp dataUpdated={dataUpdated} variant="light" className="mt-2" />

            <div className="cta-dark-panel mt-7">
              <div
                className="pointer-events-none absolute right-[-10%] top-[-50%] h-[320px] w-[320px] bg-[radial-gradient(circle,rgba(255,122,45,0.28),transparent_66%)]"
                aria-hidden="true"
              />
              <div className="relative">
                <p className="font-display text-[clamp(19px,2.4vw,24px)] font-bold text-text-on-dark">
                  Get up to 3 competing quotes from licensed local pros — free, no obligation.
                </p>
                {(verdictResult.verdict === "high" || verdictResult.verdict === "red-flag") && (
                  <p className="mt-2 text-sm text-text-on-dark-3">
                    Homeowners who compare 3 quotes save an average of 15–25% on HVAC work.
                  </p>
                )}
                {activeAffiliate ? (
                  <a
                    href={buildAffiliateUrl(activeAffiliate)}
                    onClick={() => trackEvent("affiliate_click", { network: activeAffiliate.id })}
                    className="btn-ember-lg mt-4 w-full"
                  >
                    Get quotes from local pros
                  </a>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="btn-ember-lg mt-4 w-full"
                    >
                      Get quotes from local pros
                    </button>
                    <div id="lead-form">
                      <LeadForm
                        jobType={benchmark.jobType}
                        jobLabel={benchmark.label}
                        quotedPrice={parsedPrice}
                        zipPrefill={zipInput}
                        variant="dark"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={resetFlow}
              className="mt-6 text-sm text-ember-deeper hover:text-ember"
            >
              Check another quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

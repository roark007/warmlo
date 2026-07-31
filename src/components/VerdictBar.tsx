"use client";

import { useEffect, useState } from "react";
import type { VerdictBucket } from "@/lib/schemas";
import { VERDICT_DOT_COLORS, formatUsd } from "@/lib/verdictCopy";
import { LedChip } from "./LedChip";

interface VerdictBarProps {
  adjustedLow: number;
  adjustedHigh: number;
  redFlagAbovePct: number;
  price: number;
  verdict: VerdictBucket;
}

function scaleBounds(adjustedLow: number, adjustedHigh: number, redFlagAbovePct: number, price: number) {
  const scaleMin = Math.floor((0.6 * adjustedLow) / 500) * 500;
  const redFlagAt = adjustedHigh * (1 + redFlagAbovePct / 100);
  const scaleMax = Math.ceil(Math.max(redFlagAt * 1.15, price * 1.1) / 500) * 500;
  return { scaleMin, redFlagAt, scaleMax };
}

function toPct(value: number, scaleMin: number, scaleMax: number): number {
  if (scaleMax <= scaleMin) return 50;
  return ((value - scaleMin) / (scaleMax - scaleMin)) * 100;
}

function zoneStyle(start: number, end: number, scaleMin: number, scaleMax: number) {
  const left = toPct(start, scaleMin, scaleMax);
  const right = toPct(end, scaleMin, scaleMax);
  return { left: `${left}%`, width: `${Math.max(0, right - left)}%` };
}

function formatTickLabel(n: number): string {
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n}`;
}

/** Needle sweep: 550ms expo-out from the scale's left edge to the quote. */
const NEEDLE_TRANSITION = "left 550ms cubic-bezier(0.22, 1, 0.36, 1)";
const FLAG_TRANSITION =
  "left 550ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease-out 120ms, translate 300ms ease-out 120ms";

export function VerdictBar({
  adjustedLow,
  adjustedHigh,
  redFlagAbovePct,
  price,
  verdict,
}: VerdictBarProps) {
  // Reduced-motion users start revealed: the bar renders final and static.
  const [revealed, setRevealed] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  const { scaleMin, redFlagAt, scaleMax } = scaleBounds(
    adjustedLow,
    adjustedHigh,
    redFlagAbovePct,
    price
  );

  const needlePct = Math.min(98, Math.max(2, toPct(price, scaleMin, scaleMax)));
  const fairLeft = toPct(adjustedLow, scaleMin, scaleMax);
  const fairWidth = toPct(adjustedHigh, scaleMin, scaleMax) - fairLeft;
  const fairCenter = fairLeft + fairWidth / 2;
  const needleNearFairCenter =
    Math.abs(needlePct - fairCenter) < 12 ||
    (needlePct >= fairLeft && needlePct <= fairLeft + fairWidth);

  useEffect(() => {
    if (revealed) return;
    const t = window.setTimeout(() => setRevealed(true), 80);
    return () => window.clearTimeout(t);
  }, [revealed]);

  // Pre-reveal, the needle rests at the left edge of the scale; the sweep
  // to the quote happens once when `revealed` flips.
  const pos = revealed ? needlePct : 2;

  const ticks: number[] = [];
  for (let t = scaleMin; t <= scaleMax; t += 500) ticks.push(t);

  const summary = `Your quote of ${formatUsd(price)} is ${
    verdict === "fair" ? "within" : verdict === "high" ? "above" : "outside"
  } the fair range of ${formatUsd(adjustedLow)} to ${formatUsd(adjustedHigh)} for this job.`;

  const dotColor = VERDICT_DOT_COLORS[verdict];

  return (
    <figure role="img" aria-label={summary} className="mx-auto w-full max-w-[600px]">
      <div className="relative h-[34px]">
        {!needleNearFairCenter && (
          <span
            className="pointer-events-none absolute top-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#166534]"
            style={{
              left: `${fairCenter}%`,
              transform: "translateX(-50%)",
            }}
          >
            Fair range
          </span>
        )}
        <div
          className={`absolute top-0 -translate-x-1/2 ${
            revealed ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
          style={{ left: `${pos}%`, transition: FLAG_TRANSITION }}
        >
          <LedChip>{formatUsd(price)}</LedChip>
        </div>
      </div>

      <div
        className="mx-auto h-2 w-3 -translate-x-1/2 bg-ink-900"
        style={{ left: `${pos}%`, width: "1.5px", height: "8px", transition: NEEDLE_TRANSITION }}
      />

      <div className="relative mx-auto mt-0 h-[30px] w-full">
        <div
          className="absolute left-1/2 top-1/2 h-[30px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-ink-900 md:w-[3.5px]"
          style={{ left: `${pos}%`, transition: NEEDLE_TRANSITION }}
        />
        <div
          className={`absolute top-1/2 h-2 w-2.5 -translate-x-1/2 translate-y-[10px] rounded-full ring-2 ring-surface md:h-2.5 md:w-2.5 ${
            revealed ? "vb-dot-in" : ""
          }`}
          style={{
            left: `${pos}%`,
            backgroundColor: dotColor,
            color: dotColor,
            scale: revealed ? undefined : "0",
            transition: NEEDLE_TRANSITION,
          }}
        />
      </div>

      <div className="relative mt-0 h-2 w-full overflow-hidden rounded-full bg-track md:h-2.5">
        <div
          className="absolute inset-y-0 bg-[#FEE2E2]"
          style={zoneStyle(scaleMin, adjustedLow * 0.8, scaleMin, scaleMax)}
        />
        <div
          className="absolute inset-y-0 bg-[#DCFCE7]"
          style={zoneStyle(adjustedLow * 0.8, adjustedLow, scaleMin, scaleMax)}
        />
        <div
          className={`absolute -top-0.5 bottom-[-2px] origin-left rounded-full bg-[#16A34A] transition-[scale] duration-[450ms] ease-expo delay-[120ms] md:-top-0.5 md:bottom-[-3px] ${
            revealed ? "scale-x-100" : "scale-x-0"
          }`}
          style={{
            left: `${fairLeft}%`,
            width: `${fairWidth}%`,
            height: "12px",
          }}
        />
        <div
          className="absolute inset-y-0 bg-[#FDE68A]"
          style={zoneStyle(adjustedHigh, redFlagAt, scaleMin, scaleMax)}
        />
        <div
          className="absolute inset-y-0 bg-[#FEE2E2]"
          style={zoneStyle(redFlagAt, scaleMax, scaleMin, scaleMax)}
        />
      </div>

      <div className="relative mt-1 h-5 w-full">
        {ticks.map((t) => {
          const pctVal = toPct(t, scaleMin, scaleMax);
          const showLabel = t % 2000 === 0;
          return (
            <div
              key={t}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${pctVal}%` }}
            >
              <div className="mx-auto h-[5px] w-px bg-line-strong" />
              {showLabel && (
                <span className="mt-0.5 block text-xs text-ink-600 [font-feature-settings:'tnum']">
                  {formatTickLabel(t)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex justify-between text-xs text-ink-600 [font-feature-settings:'tnum']">
        <span>{formatTickLabel(scaleMin)}</span>
        <span>{formatTickLabel(scaleMax)}</span>
      </div>

      {needleNearFairCenter && (
        <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[#166534]">
          Fair range
        </p>
      )}
    </figure>
  );
}

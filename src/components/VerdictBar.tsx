"use client";

import { useEffect, useRef, useState } from "react";
import type { VerdictBucket } from "@/lib/schemas";
import { VERDICT_INK_COLORS, formatUsd } from "@/lib/verdictCopy";

interface VerdictBarProps {
  adjustedLow: number;
  adjustedHigh: number;
  redFlagAbovePct: number;
  price: number;
  verdict: VerdictBucket;
}

function scaleBounds(
  adjustedLow: number,
  adjustedHigh: number,
  redFlagAbovePct: number,
  price: number
) {
  const scaleMin = 0;
  const redFlagAt = adjustedHigh * (1 + redFlagAbovePct / 100);
  const scaleMax = Math.ceil(Math.max(redFlagAt * 1.15, price * 1.1) / 500) * 500;
  return { scaleMin, redFlagAt, scaleMax };
}

function toPct(value: number, scaleMin: number, scaleMax: number): number {
  if (scaleMax <= scaleMin) return 50;
  return ((value - scaleMin) / (scaleMax - scaleMin)) * 100;
}

function formatTickLabel(n: number): string {
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n}`;
}

export function VerdictBar({
  adjustedLow,
  adjustedHigh,
  redFlagAbovePct,
  price,
  verdict,
}: VerdictBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const { scaleMin, scaleMax } = scaleBounds(
    adjustedLow,
    adjustedHigh,
    redFlagAbovePct,
    price
  );

  const needlePct = Math.min(97, Math.max(3, toPct(price, scaleMin, scaleMax)));
  const fairLeft = toPct(adjustedLow, scaleMin, scaleMax);
  const fairWidth = toPct(adjustedHigh, scaleMin, scaleMax) - fairLeft;
  const ink = VERDICT_INK_COLORS[verdict];

  useEffect(() => {
    if (reducedMotion || revealed) return;
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion, revealed]);

  const showNeedle = revealed || reducedMotion;
  const animateNeedle = showNeedle && !reducedMotion;

  const summary = `Your quote of ${formatUsd(price)} is compared against a fair range of ${formatUsd(adjustedLow)} to ${formatUsd(adjustedHigh)}.`;

  return (
    <figure ref={containerRef} role="img" aria-label={summary} className="w-full">
      <div className="relative pt-11">
        <div
          className={`absolute bottom-full ${showNeedle ? (animateNeedle ? "needle-drop" : "") : "opacity-0"}`}
          style={{ left: `${needlePct}%`, transform: "translateX(-50%)" }}
        >
          <div
            className="whitespace-nowrap rounded-[8px] px-[11px] py-[5px] text-[13px] font-bold text-white"
            style={{ background: ink, boxShadow: `0 8px 18px -8px ${ink}` }}
          >
            {formatUsd(price)}
          </div>
          <div
            className="mx-auto mt-0.5 h-[18px] w-0.5"
            style={{ background: ink, boxShadow: `0 0 8px ${ink}` }}
          />
        </div>

        <div
          className={`relative h-4 overflow-hidden rounded-pill bg-[#e8e0d3] ${showNeedle ? (animateNeedle ? "bar-grow" : "") : "scale-x-0"}`}
          style={{
            backgroundImage:
              "linear-gradient(90deg,#0ea5a0 0%,#0ea5a0 18%,#1f9d63 18%,#1f9d63 34%,#e0871a 34%,#e0871a 66%,#e0492e 82%,#e0492e 100%)",
          }}
        />

        <div
          className="pointer-events-none absolute top-11 h-4 rounded-[6px] border-2"
          style={{
            left: `${fairLeft}%`,
            width: `${fairWidth}%`,
            borderColor:
              verdict === "fair" ? "rgba(19,115,70,0.9)" : "rgba(23,18,14,0.5)",
            boxShadow: verdict === "fair" ? "0 0 14px rgba(31,157,99,0.4)" : undefined,
          }}
        />

        <div className="mt-2 flex justify-between text-[11.5px] text-text-muted [font-feature-settings:'tnum']">
          <span>{formatTickLabel(scaleMin)}</span>
          <span className="font-semibold text-safe-ink">
            Fair range {formatUsd(adjustedLow)}–{formatUsd(adjustedHigh)}
          </span>
          <span>{formatTickLabel(scaleMax)}</span>
        </div>
      </div>
    </figure>
  );
}

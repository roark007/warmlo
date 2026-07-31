import type { VerdictBucket } from "@/lib/schemas";

/** Mockup verdict labels — shown above the fixed verdict sentences. */
export const VERDICT_LABELS: Record<VerdictBucket, string> = {
  "suspiciously-low": "Suspiciously low",
  fair: "This is a fair price",
  high: "On the high side",
  "red-flag": "Red flag — stop",
};

export const VERDICT_HEADLINES: Record<VerdictBucket, string> = {
  "suspiciously-low":
    "That's below the typical range — make sure the scope and warranty are real.",
  fair: "That quote is within the fair range for this job.",
  high: "That's above the typical range. Worth getting another quote.",
  "red-flag":
    "That's well above the fair range. Get competing quotes before signing.",
};

export const VERDICT_DOT_COLORS: Record<VerdictBucket, string> = {
  "suspiciously-low": "#0ea5a0",
  fair: "#1f9d63",
  high: "#e0871a",
  "red-flag": "#e0492e",
};

export const VERDICT_INK_COLORS: Record<VerdictBucket, string> = {
  "suspiciously-low": "#0f766e",
  fair: "#137346",
  high: "#9a5a06",
  "red-flag": "#b3311c",
};

export const VERDICT_PANEL_STYLES: Record<
  VerdictBucket,
  { bg: string; border: string }
> = {
  "suspiciously-low": {
    bg: "linear-gradient(180deg,#fff,#f3f8f6)",
    border: "rgba(15,118,110,0.28)",
  },
  fair: {
    bg: "linear-gradient(180deg,#fff,#eef7f0)",
    border: "rgba(31,157,99,0.32)",
  },
  high: {
    bg: "linear-gradient(180deg,#fff,#fbf3e6)",
    border: "rgba(224,135,26,0.32)",
  },
  "red-flag": {
    bg: "linear-gradient(180deg,#fff,#fbeeeb)",
    border: "rgba(224,73,46,0.34)",
  },
};

export function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

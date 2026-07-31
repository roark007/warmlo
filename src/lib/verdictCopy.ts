import type { VerdictBucket } from "@/lib/schemas";

export const VERDICT_HEADLINES: Record<VerdictBucket, string> = {
  "suspiciously-low":
    "That's below the typical range — make sure the scope and warranty are real.",
  fair: "That quote is within the fair range for this job.",
  high: "That's above the typical range. Worth getting another quote.",
  "red-flag":
    "That's well above the fair range. Get competing quotes before signing.",
};

export const VERDICT_DOT_COLORS: Record<VerdictBucket, string> = {
  "suspiciously-low": "#DC2626",
  fair: "#16A34A",
  high: "#D97706",
  "red-flag": "#DC2626",
};

export function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

import type { Severity } from "@/lib/schemas";

const severityConfig: Record<
  Severity,
  { label: string; chipBg: string; signal: string; tintBg: string; tintBorder: string; tintHeading: string }
> = {
  "diy-possible": {
    label: "DIY possible",
    chipBg: "bg-[#166534]",
    signal: "#16A34A",
    tintBg: "bg-[#F0FDF4]",
    tintBorder: "border-[#BBF7D0]",
    tintHeading: "text-[#14532D]",
  },
  "call-pro-soon": {
    label: "Call a pro soon",
    chipBg: "bg-[#92400E]",
    signal: "#D97706",
    tintBg: "bg-[#FFFBEB]",
    tintBorder: "border-[#FDE68A]",
    tintHeading: "text-[#78350F]",
  },
  emergency: {
    label: "Emergency",
    chipBg: "bg-[#991B1B]",
    signal: "#DC2626",
    tintBg: "bg-[#FEF2F2]",
    tintBorder: "border-[#FECACA]",
    tintHeading: "text-[#7F1D1D]",
  },
};

export function getSeverityConfig(severity: Severity) {
  return severityConfig[severity];
}

interface SeverityBadgeProps {
  severity: Severity;
  size?: "default" | "small";
}

export function SeverityBadge({ severity, size = "default" }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const sizeClasses =
    size === "small" ? "text-[11px] px-2 py-[3px]" : "text-[13px] px-3 py-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold text-white ${config.chipBg} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}

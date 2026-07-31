import type { Severity } from "@/lib/schemas";

const severityConfig: Record<
  Severity,
  { label: string; wash: string; ink: string; solid: string; glow?: boolean }
> = {
  "diy-possible": {
    label: "DIY possible",
    wash: "bg-[var(--safe-wash)]",
    ink: "text-safe-ink",
    solid: "bg-safe-solid",
  },
  "call-pro-soon": {
    label: "Call a pro soon",
    wash: "bg-[var(--pro-wash)]",
    ink: "text-pro-ink",
    solid: "bg-pro-solid",
  },
  emergency: {
    label: "Emergency",
    wash: "bg-[var(--emerg-wash)]",
    ink: "text-emerg-ink",
    solid: "bg-emerg-solid",
    glow: true,
  },
};

export function getSeverityConfig(severity: Severity) {
  return severityConfig[severity];
}

interface SeverityBadgeProps {
  severity: Severity;
  size?: "default" | "small" | "dark";
}

export function SeverityBadge({ severity, size = "default" }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const sizeClasses =
    size === "small"
      ? "text-[12.5px] px-3 py-1.5 gap-1.5"
      : size === "dark"
        ? "text-[13px] px-[15px] py-2 gap-2 border border-[rgba(224,135,26,0.3)] text-[#ffbb63] bg-[rgba(224,135,26,0.14)]"
        : "text-[12.5px] px-3 py-1.5 gap-1.5";

  if (size === "dark") {
    const darkSolid =
      severity === "diy-possible"
        ? "bg-safe-solid shadow-[0_0_10px_rgba(31,157,99,0.9)]"
        : severity === "emergency"
          ? "bg-emerg-solid shadow-[0_0_10px_rgba(224,73,46,0.9)]"
          : "bg-pro-solid shadow-[0_0_10px_rgba(224,135,26,0.9)]";
    return (
      <span
        className={`inline-flex items-center rounded-pill font-semibold tracking-[0.02em] ${sizeClasses}`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${darkSolid}`} aria-hidden="true" />
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-pill font-semibold ${config.wash} ${config.ink} ${sizeClasses}`}
    >
      <span
        className={`h-[7px] w-[7px] shrink-0 rounded-full ${config.solid} ${config.glow ? "shadow-[0_0_8px_rgba(224,73,46,0.7)]" : ""}`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

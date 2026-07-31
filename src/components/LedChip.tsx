import type { Severity } from "@/lib/schemas";

interface LedChipProps {
  children: React.ReactNode;
  severity?: Severity;
  size?: "default" | "small" | "hero";
  flicker?: boolean;
  className?: string;
}

const sizeClasses = {
  hero: "px-5 py-[30px] text-[78px] leading-none tracking-[0.06em]",
  default: "px-3 py-1.5 text-sm",
  small: "px-3 py-1.5 text-sm",
};

function severityClass(severity?: Severity): string {
  switch (severity) {
    case "diy-possible":
      return "led-chip-safe";
    case "emergency":
      return "led-chip-emerg";
    default:
      return "led-chip-pro";
  }
}

export function LedChip({
  children,
  severity,
  size = "default",
  flicker = false,
  className = "",
}: LedChipProps) {
  return (
    <span
      className={`led-chip ${severity ? severityClass(severity) : "led-chip-pro"} ${sizeClasses[size]} ${flicker ? "led-flicker" : ""} ${className}`}
    >
      {children}
    </span>
  );
}

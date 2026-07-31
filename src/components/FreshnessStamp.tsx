import { formatDataUpdated } from "@/lib/format";

interface FreshnessStampProps {
  dataUpdated: string;
  className?: string;
  variant?: "dark" | "light";
}

export function FreshnessStamp({
  dataUpdated,
  className = "",
  variant = "dark",
}: FreshnessStampProps) {
  const colors =
    variant === "dark"
      ? "text-text-on-dark-4"
      : "text-text-muted";

  return (
    <span className={`inline-flex items-center gap-2 text-[13.5px] tracking-[0.02em] ${colors} ${className}`}>
      <span
        className="h-2 w-2 rounded-full bg-status-fresh shadow-[0_0_10px_rgba(56,208,127,0.8)]"
        aria-hidden="true"
      />
      Pricing data updated {formatDataUpdated(dataUpdated)}
    </span>
  );
}

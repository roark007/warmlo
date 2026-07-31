import { formatDataUpdated } from "@/lib/data";

interface FreshnessStampProps {
  dataUpdated: string;
  className?: string;
}

export function FreshnessStamp({ dataUpdated, className = "" }: FreshnessStampProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-ink-600 ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" aria-hidden="true" />
      Pricing data updated {formatDataUpdated(dataUpdated)}
    </span>
  );
}

import { FreshnessStamp } from "./FreshnessStamp";
import { StaticLink } from "./StaticLink";

interface CostRangeDisplayProps {
  costLow: number;
  costHigh: number;
  repairSlug: string;
  repairName: string;
  dataUpdated: string;
  variant?: "default" | "large";
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export function CostRangeDisplay({
  costLow,
  costHigh,
  repairSlug,
  repairName,
  dataUpdated,
  variant = "default",
}: CostRangeDisplayProps) {
  const figureSize =
    variant === "large"
      ? "text-[32px] leading-9 md:text-4xl md:leading-9"
      : "text-[28px] leading-8 md:text-[32px] md:leading-9";

  const lowPct = 15;
  const highPct = 85;
  const bandWidth = highPct - lowPct;

  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-600">
        Typical repair cost
      </p>
      <div className="rounded-md border border-line bg-surface p-5 md:p-6">
        <p
          className={`font-semibold text-ink-900 [font-feature-settings:"tnum"] ${figureSize}`}
        >
          {formatCurrency(costLow)} – {formatCurrency(costHigh)}
        </p>
        <div className="mt-3.5 h-1.5 w-full rounded-full bg-track">
          <div
            className="h-1.5 rounded-full bg-ink-700"
            style={{ marginLeft: `${lowPct}%`, width: `${bandWidth}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-sm text-ink-700">
            See our{" "}
            <StaticLink href={`/cost/${repairSlug}`} className="text-pilot-600 underline">
              {repairName}
            </StaticLink>{" "}
            cost guide for a detailed breakdown.
          </p>
          <FreshnessStamp dataUpdated={dataUpdated} className="ml-auto" />
        </div>
      </div>
    </div>
  );
}

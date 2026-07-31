import { FreshnessStamp } from "./FreshnessStamp";
import { StaticLink } from "./StaticLink";

interface CostRangeDisplayProps {
  costLow: number;
  costHigh: number;
  repairSlug: string;
  repairName: string;
  dataUpdated: string;
  variant?: "default" | "large";
  partCostLow?: number;
  partCostHigh?: number;
  laborHours?: string;
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
  partCostLow,
  partCostHigh,
  laborHours,
}: CostRangeDisplayProps) {
  const showBreakdown =
    partCostLow !== undefined && partCostHigh !== undefined && laborHours !== undefined;
  const laborLow = showBreakdown ? Math.max(0, costLow - partCostHigh) : 0;
  const laborHigh = showBreakdown ? Math.max(0, costHigh - partCostLow) : 0;
  const partMid = showBreakdown ? (partCostLow + partCostHigh) / 2 : 0;
  const costMid = (costLow + costHigh) / 2;
  const partPct = showBreakdown ? Math.min(100, Math.max(0, (partMid / costMid) * 100)) : 28;

  return (
    <div>
      {variant === "default" && (
        <div className="section-eyebrow mb-3">Typical repair cost</div>
      )}
      <div className="rounded-[20px] border border-[var(--line-on-paper)] bg-paper-2 p-[clamp(22px,3vw,30px)] shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-baseline gap-3.5">
          <span className="font-display text-display-num font-bold tracking-[-0.02em] text-text-strong [font-feature-settings:'tnum']">
            {formatCurrency(costLow)} – {formatCurrency(costHigh)}
          </span>
          <span className="text-sm text-text-muted">{repairName.toLowerCase()}</span>
        </div>

        {showBreakdown && (
          <div className="mt-5">
            <div className="mb-2.5 text-small font-semibold text-text-body">Where the money goes</div>
            <div className="flex h-3 overflow-hidden rounded-pill bg-[#efe7db]">
              <div className="bg-[#c99a5e]" style={{ width: `${partPct}%` }} />
              <div className="bg-ember-deeper" style={{ width: `${100 - partPct}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-5 text-[13.5px] text-text-body">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[11px] w-[11px] rounded-[3px] bg-[#c99a5e]" />
                Part{" "}
                <strong className="text-text-strong [font-feature-settings:'tnum']">
                  {formatCurrency(partCostLow!)}–{formatCurrency(partCostHigh!)}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[11px] w-[11px] rounded-[3px] bg-ember-deeper" />
                Labor{" "}
                <strong className="text-text-strong [font-feature-settings:'tnum']">
                  {formatCurrency(laborLow)}–{formatCurrency(laborHigh)}
                </strong>
              </span>
              <span className="text-text-muted">Typical labor time: {laborHours} hrs</span>
            </div>
          </div>
        )}

        {variant === "default" && !showBreakdown && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-sm text-text-body">
              {`A ${repairName.toLowerCase()} typically costs between ${formatCurrency(costLow)} and ${formatCurrency(costHigh)} nationally. See our `}
              <StaticLink href={`/cost/${repairSlug}`} className="font-semibold text-ember-deeper hover:text-ember">
                {repairName}
              </StaticLink>{" "}
              cost guide for a detailed breakdown.
            </p>
            <FreshnessStamp dataUpdated={dataUpdated} variant="light" className="ml-auto" />
          </div>
        )}
      </div>
    </div>
  );
}

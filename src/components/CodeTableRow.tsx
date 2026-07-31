import type { Code } from "@/lib/schemas";
import { getSeverityConfig } from "./SeverityBadge";
import { LedChip } from "./LedChip";
import { StaticLink } from "./StaticLink";

interface CodeTableRowProps {
  brandSlug: string;
  code: Code;
  compact?: boolean;
}

function shortMeaning(code: Code): string {
  const colonIndex = code.title.indexOf(":");
  if (colonIndex !== -1) {
    return code.title.slice(colonIndex + 1).trim();
  }
  return code.meaning;
}

export function CodeTableRow({ brandSlug, code, compact = false }: CodeTableRowProps) {
  const config = getSeverityConfig(code.severity);

  if (compact) {
    return (
      <StaticLink
        href={`/fix/${brandSlug}/${code.slug}`}
        className="card-paper flex items-center gap-3 p-[13px_15px]"
      >
        <LedChip size="small" severity={code.severity}>
          {code.code}
        </LedChip>
        <span>
          <span className="block text-[14.5px] font-semibold text-text-strong">
            {shortMeaning(code)}
          </span>
          <span className={`text-small ${config.ink}`}>{config.label}</span>
        </span>
      </StaticLink>
    );
  }

  return (
    <StaticLink
      href={`/fix/${brandSlug}/${code.slug}`}
      className="flex min-h-16 items-center gap-3 border-b border-[var(--line-on-paper)] px-4 py-3 transition-colors last:border-b-0 hover:bg-paper-sink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ember md:min-h-14 md:grid md:grid-cols-[120px_1fr_150px_24px] md:items-center"
    >
      <LedChip size="small" severity={code.severity}>
        {code.code}
      </LedChip>
      <div className="min-w-0 flex-1 md:col-start-2">
        <p className="truncate text-[15px] font-medium text-text-strong">{shortMeaning(code)}</p>
      </div>
      <div className="hidden md:flex md:justify-end">
        <span className={`text-small font-semibold ${config.ink}`}>{config.label}</span>
      </div>
      <div className="md:hidden">
        <span className={`text-small font-semibold ${config.ink}`}>{config.label}</span>
      </div>
      <span className="hidden text-text-muted md:col-start-4 md:block">→</span>
    </StaticLink>
  );
}

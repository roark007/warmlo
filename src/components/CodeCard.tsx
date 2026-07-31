import type { Code } from "@/lib/schemas";
import { LedChip } from "./LedChip";
import { SeverityBadge } from "./SeverityBadge";
import { StaticLink } from "./StaticLink";

interface CodeCardProps {
  brandSlug: string;
  brandName?: string;
  code: Code;
}

function shortMeaning(code: Code): string {
  const colonIndex = code.title.indexOf(":");
  if (colonIndex !== -1) {
    return code.title.slice(colonIndex + 1).trim();
  }
  return code.meaning;
}

export function CodeCard({ brandSlug, brandName, code }: CodeCardProps) {
  const subtitle = brandName
    ? `${brandName} · ${code.meaning.split(".")[0]?.toLowerCase() ?? code.meaning}`
    : undefined;

  return (
    <StaticLink
      href={`/fix/${brandSlug}/${code.slug}`}
      className="card-paper block p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
    >
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <LedChip severity={code.severity} size="small" flicker={code.severity === "emergency"}>
          {code.code}
        </LedChip>
        <SeverityBadge severity={code.severity} size="small" />
      </div>
      <div className="font-display text-[17px] font-semibold tracking-[-0.01em] text-text-strong">
        {shortMeaning(code)}
      </div>
      {subtitle && (
        <div className="mt-1 text-small text-text-muted">{subtitle}</div>
      )}
    </StaticLink>
  );
}

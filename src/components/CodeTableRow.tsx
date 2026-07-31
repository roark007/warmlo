import type { Code } from "@/lib/schemas";
import { ChevronRightIcon } from "./icons";
import { LedChip } from "./LedChip";
import { SeverityBadge } from "./SeverityBadge";
import { StaticLink } from "./StaticLink";

interface CodeTableRowProps {
  brandSlug: string;
  code: Code;
}

function shortMeaning(code: Code): string {
  const colonIndex = code.title.indexOf(":");
  if (colonIndex !== -1) {
    return code.title.slice(colonIndex + 1).trim();
  }
  return code.meaning;
}

export function CodeTableRow({ brandSlug, code }: CodeTableRowProps) {
  return (
    <StaticLink
      href={`/fix/${brandSlug}/${code.slug}`}
      className="flex min-h-16 items-center gap-3 border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-pilot-600 md:min-h-14 md:grid md:grid-cols-[120px_1fr_150px_24px] md:items-center"
    >
      <LedChip size="small">{code.code}</LedChip>
      <div className="min-w-0 flex-1 md:col-start-2">
        <p className="truncate text-[15px] font-medium text-ink-900">{shortMeaning(code)}</p>
      </div>
      <div className="hidden md:flex md:justify-end">
        <SeverityBadge severity={code.severity} size="small" />
      </div>
      <div className="md:hidden">
        <SeverityBadge severity={code.severity} size="small" />
      </div>
      <ChevronRightIcon size={16} className="shrink-0 text-ink-500 md:col-start-4" />
    </StaticLink>
  );
}

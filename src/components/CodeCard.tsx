import Link from "next/link";
import type { Code } from "@/lib/schemas";
import { LedChip } from "./LedChip";
import { SeverityBadge } from "./SeverityBadge";

interface CodeCardProps {
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

export function CodeCard({ brandSlug, code }: CodeCardProps) {
  return (
    <Link
      href={`/fix/${brandSlug}/${code.slug}`}
      prefetch={false}
      className="flex flex-col gap-2.5 rounded-md border border-line bg-surface p-4 transition-colors hover:border-ink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pilot-600"
    >
      <div className="flex items-center justify-between gap-2">
        <LedChip size="small">{code.code}</LedChip>
        <SeverityBadge severity={code.severity} size="small" />
      </div>
      <p className="line-clamp-2 text-sm font-medium leading-5 text-ink-900">
        {shortMeaning(code)}
      </p>
    </Link>
  );
}

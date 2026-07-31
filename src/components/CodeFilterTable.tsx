"use client";

import { useMemo, useState } from "react";
import type { Code } from "@/lib/schemas";
import { CodeTableRow } from "./CodeTableRow";

interface CodeFilterTableProps {
  brandSlug: string;
  codes: Code[];
}

export function CodeFilterTable({ brandSlug, codes }: CodeFilterTableProps) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter.trim()) return codes;
    const q = filter.toLowerCase();
    return codes.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.slug.includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.meaning.toLowerCase().includes(q)
    );
  }, [codes, filter]);

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter codes…"
        aria-label="Filter codes"
        className="h-12 w-full rounded-md border-[1.5px] border-line-strong bg-surface px-3.5 text-base text-ink-900 placeholder:text-ink-500 hover:border-ink-500 focus:border-pilot-600 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pilot-600"
      />
      <div className="mt-5 overflow-hidden rounded-md border border-line bg-surface">
        <div className="hidden border-b border-line px-4 py-3 md:grid md:grid-cols-[120px_1fr_150px_24px] md:gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-600">
            Code
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-600">
            Meaning
          </span>
          <span className="text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-600">
            Severity
          </span>
          <span className="sr-only">Link</span>
        </div>
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-ink-600">No codes match — try clearing the filter.</p>
        ) : (
          filtered.map((code) => (
            <CodeTableRow key={code.slug} brandSlug={brandSlug} code={code} />
          ))
        )}
      </div>
    </div>
  );
}

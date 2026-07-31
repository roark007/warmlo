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
        className="input-light h-12"
      />
      <div className="code-table mt-5 overflow-hidden rounded-md border border-[var(--line-on-paper)] bg-paper-2 shadow-[var(--shadow-card)]">
        <div className="hidden border-b border-[var(--line-on-paper)] px-4 py-3 md:grid md:grid-cols-[120px_1fr_150px_24px] md:gap-3">
          <span className="text-micro font-semibold uppercase tracking-eyebrow text-text-muted">
            Code
          </span>
          <span className="text-micro font-semibold uppercase tracking-eyebrow text-text-muted">
            Meaning
          </span>
          <span className="text-right text-micro font-semibold uppercase tracking-eyebrow text-text-muted">
            Severity
          </span>
          <span className="sr-only">Link</span>
        </div>
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">No codes match — try clearing the filter.</p>
        ) : (
          filtered.map((code) => (
            <CodeTableRow key={code.slug} brandSlug={brandSlug} code={code} />
          ))
        )}
      </div>
    </div>
  );
}

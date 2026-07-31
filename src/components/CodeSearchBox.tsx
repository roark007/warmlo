"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SearchIcon, XIcon } from "./icons";
import { LedChip } from "./LedChip";
import { SeverityBadge } from "./SeverityBadge";
import type { Code } from "@/lib/schemas";
import { trackEvent } from "@/lib/analytics";

export interface CodeSearchEntry {
  brandSlug: string;
  brandName: string;
  code: Code;
}

interface CodeSearchBoxProps {
  entries: CodeSearchEntry[];
}

function shortMeaning(code: Code): string {
  const colonIndex = code.title.indexOf(":");
  if (colonIndex !== -1) {
    return code.title.slice(colonIndex + 1).trim();
  }
  return code.meaning;
}

export function CodeSearchBox({ entries }: CodeSearchBoxProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 100);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (debouncedQuery.length < 2) return [];
    const q = debouncedQuery.toLowerCase();
    return entries
      .filter(
        (entry) =>
          entry.code.code.toLowerCase().includes(q) ||
          entry.code.slug.includes(q) ||
          entry.brandName.toLowerCase().includes(q) ||
          entry.brandSlug.includes(q) ||
          entry.code.title.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [debouncedQuery, entries]);

  const groupedResults = useMemo(() => {
    const groups = new Map<string, CodeSearchEntry[]>();
    for (const entry of results) {
      const existing = groups.get(entry.brandSlug) ?? [];
      existing.push(entry);
      groups.set(entry.brandSlug, existing);
    }
    return groups;
  }, [results]);

  const flatResults = results;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || flatResults.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % flatResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? flatResults.length - 1 : i - 1));
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    },
    [isOpen, flatResults.length]
  );

  let resultIndex = -1;

  return (
    <div className="relative max-w-[560px]">
      <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen && debouncedQuery.length >= 2}
        aria-autocomplete="list"
        aria-controls="code-search-results"
        placeholder="Type a brand or code — e.g. Goodman E4"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && debouncedQuery.length >= 2) {
            trackEvent("search_used");
          }
          handleKeyDown(e);
        }}
        className="h-14 w-full rounded-md border-[1.5px] border-line-strong bg-surface py-0 pl-12 pr-12 text-base text-ink-900 placeholder:text-ink-500 hover:border-ink-500 focus:border-pilot-600 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pilot-600"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setDebouncedQuery("");
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-ink-500"
          aria-label="Clear search"
        >
          <XIcon size={16} />
        </button>
      )}
      {isOpen && debouncedQuery.length >= 2 && (
        <div
          id="code-search-results"
          ref={listRef}
          role="listbox"
          className="absolute top-[calc(100%+6px)] z-30 max-h-80 w-full overflow-y-auto rounded-md border border-line bg-surface shadow-dropdown"
        >
          {flatResults.length === 0 ? (
            <p className="p-4 text-sm text-ink-600">
              No matches — try the brand name (e.g. Goodman).
            </p>
          ) : (
            Array.from(groupedResults.entries()).map(([brandSlug, brandEntries]) => (
              <div key={brandSlug}>
                <p className="px-4 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-600">
                  {brandEntries[0].brandName}
                </p>
                {brandEntries.map((entry) => {
                  resultIndex += 1;
                  const idx = resultIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <Link
                      key={`${entry.brandSlug}-${entry.code.slug}`}
                      href={`/fix/${entry.brandSlug}/${entry.code.slug}`}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => trackEvent("search_used")}
                      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-paper ${isActive ? "border-l-2 border-pilot-600 bg-paper" : ""}`}
                    >
                      <LedChip size="small">{entry.code.code}</LedChip>
                      <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink-900">
                        {shortMeaning(entry.code)}
                      </span>
                      <SeverityBadge severity={entry.code.severity} size="small" />
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

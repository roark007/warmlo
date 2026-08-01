"use client";

import { useState } from "react";

interface CiteBlockProps {
  citation: string;
  title?: string;
}

export function CiteBlock({ citation, title = "Cite this data" }: CiteBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section className="rounded-[20px] border border-[var(--line-on-paper)] bg-paper-2 p-[clamp(22px,3vw,30px)] shadow-[var(--shadow-card)]">
      <h2 className="font-display text-h2 font-bold tracking-[-0.02em] text-text-strong">{title}</h2>
      <p className="mt-3 max-w-[68ch] text-sm leading-[1.65] text-text-body">
        Copy the attribution line below for articles, Reddit comments, or reports. A link back to the Index helps
        others find the source.
      </p>
      <div className="mt-4 rounded-[14px] border border-[rgba(23,18,14,0.08)] bg-[rgba(23,18,14,0.03)] p-4">
        <p className="text-[14px] leading-[1.65] text-text-body">{citation}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="btn-ember mt-4 px-5 py-2.5 text-sm"
      >
        {copied ? "Copied!" : "Copy citation"}
      </button>
    </section>
  );
}

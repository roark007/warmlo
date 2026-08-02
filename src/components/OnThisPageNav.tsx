interface OnThisPageItem {
  href: string;
  label: string;
}

interface OnThisPageNavProps {
  items: OnThisPageItem[];
}

/** Server-rendered fragment navigation for long diagnostic pages. */
export function OnThisPageNav({ items }: OnThisPageNavProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="mb-[clamp(32px,4vw,48px)] rounded-[14px] border border-[var(--line-on-paper)] bg-paper-2 p-[16px_18px]"
    >
      <p className="text-[12px] font-semibold uppercase tracking-eyebrow text-text-muted">On this page</p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold text-ember-deeper">
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="underline-offset-4 hover:text-ember hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

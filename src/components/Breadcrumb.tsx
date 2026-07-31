import { ArrowRightIcon } from "./icons";
import { StaticLink } from "./StaticLink";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] font-medium">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <span className="text-ink-500">/</span>}
            {item.href ? (
              <StaticLink href={item.href} className="text-pilot-600 hover:underline">
                {item.label}
              </StaticLink>
            ) : (
              <span className="text-ink-600">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface BrandCardProps {
  slug: string;
  name: string;
  codeCount: number;
}

export function BrandCard({ slug, name, codeCount }: BrandCardProps) {
  return (
    <StaticLink
      href={`/fix/${slug}`}
      className="card-lift relative block h-full rounded-md border border-line bg-surface p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pilot-600"
    >
      <ArrowRightIcon size={16} className="absolute right-4 top-4 text-ink-500" />
      <p className="font-serif text-lg font-bold leading-6 text-ink-900">{name}</p>
      <p className="mt-1 text-[13px] text-ink-600">{codeCount} codes</p>
    </StaticLink>
  );
}

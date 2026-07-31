import { StaticLink } from "./StaticLink";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "dark" | "light";
}

export function Breadcrumb({ items, variant = "light" }: BreadcrumbProps) {
  const linkClass =
    variant === "dark"
      ? "text-text-on-dark-4 hover:text-ember"
      : "text-ember-deeper hover:text-ember";
  const currentClass = variant === "dark" ? "text-text-on-dark-2" : "text-text-muted";
  const sepClass = variant === "dark" ? "text-text-on-dark-4 opacity-50" : "text-text-muted opacity-50";

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-small font-medium">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span className={sepClass}>/</span>}
            {item.href ? (
              <StaticLink href={item.href} className={linkClass}>
                {item.label}
              </StaticLink>
            ) : (
              <span className={currentClass}>{item.label}</span>
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
      className="card-paper relative block h-full p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
    >
      <span className="absolute right-4 top-4 text-xl text-text-on-dark-2">→</span>
      <p className="font-display text-lg font-bold leading-6 text-text-strong">{name}</p>
      <p className="mt-1 text-small text-text-muted">{codeCount} codes</p>
    </StaticLink>
  );
}

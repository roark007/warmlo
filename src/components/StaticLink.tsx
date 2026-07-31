import type { AnchorHTMLAttributes, ReactNode } from "react";

interface StaticLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

/** Plain anchor for server-rendered nav — avoids pulling the Next.js client router onto code pages. */
export function StaticLink({ href, children, ...props }: StaticLinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

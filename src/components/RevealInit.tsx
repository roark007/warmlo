"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll-reveal engine (signature moment #5). Marks `.reveal` elements
 * visible as they enter the viewport — once, 300ms, ≤12px, staggered via
 * `--reveal-delay` inline vars. Never runs under prefers-reduced-motion
 * (the `.reveal-ready` gate is never added, so content renders fully
 * visible), and content is fully visible without JS for the same reason.
 */
export function RevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    root.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        // Already in view (above the fold or just after client-side nav):
        // mark visible synchronously — no hide, no flash, no animation.
        el.classList.add("is-visible");
      } else {
        io.observe(el);
      }
    }

    return () => {
      io.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, [pathname]);

  return null;
}

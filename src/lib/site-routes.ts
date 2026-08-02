import type { MetadataRoute } from "next";
import { getAllCodes, getBrands, getQuoteIndex, getRepairs, getSymptoms } from "@/lib/data";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warmlo.com";

// Change this only when indexable site content changes. Keeping it stable prevents
// routine deployments from sending false freshness signals to search engines.
export const CONTENT_LAST_MODIFIED = "2026-07-31";

// IndexNow keys are intentionally public: the matching file at the site root is
// how participating search engines verify that Warmlo controls this host.
export const INDEXNOW_KEY =
  "611a7b2221bc4503853d6cf7b1fe83d5958c85f4aa0b4118a68547c8fd225c1e";

export type IndexableRoute = MetadataRoute.Sitemap[number] & { url: string };

function asDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function getIndexableRoutes(): IndexableRoute[] {
  const defaultModified = asDate(CONTENT_LAST_MODIFIED);
  const quoteIndexModified = asDate(getQuoteIndex().generatedAt);

  const staticRoutes = [
    "",
    "/fix",
    "/quote-check",
    "/about",
    "/privacy",
    "/terms",
    "/disclosure",
  ];
  const brandRoutes = getBrands().map((brand) => `/fix/${brand.slug}`);
  const codeRoutes = getAllCodes().map(
    ({ brand, code }) => `/fix/${brand.slug}/${code.slug}`
  );
  const costRoutes = getRepairs().map((repair) => `/cost/${repair.slug}`);
  const symptomRoutes = getSymptoms().map((symptom) => `/symptom/${symptom.slug}`);

  const contentRoutes = [
    ...staticRoutes,
    ...brandRoutes,
    ...codeRoutes,
    ...costRoutes,
    ...symptomRoutes,
  ];

  return [
    ...contentRoutes.map((route) => {
      const isCodePage = route.startsWith("/fix/") && route.split("/").length > 3;
      return {
        url: `${SITE_URL}${route}`,
        lastModified: defaultModified,
        changeFrequency: isCodePage ? ("monthly" as const) : ("weekly" as const),
        priority: route === "" ? 1 : isCodePage ? 0.9 : 0.7,
      };
    }),
    {
      url: `${SITE_URL}/data/hvac-quote-index`,
      lastModified: quoteIndexModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}

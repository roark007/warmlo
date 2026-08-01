import type { MetadataRoute } from "next";
import { getAllCodes, getBrands, getRepairs, getSymptoms } from "@/lib/data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warmlo.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/fix", "/quote-check", "/privacy", "/terms", "/disclosure"];
  const brandRoutes = getBrands().map((b) => `/fix/${b.slug}`);
  const codeRoutes = getAllCodes().map(
    ({ brand, code }) => `/fix/${brand.slug}/${code.slug}`
  );
  const costRoutes = getRepairs().map((r) => `/cost/${r.slug}`);
  const symptomRoutes = getSymptoms().map((s) => `/symptom/${s.slug}`);

  const allRoutes = [...staticRoutes, ...brandRoutes, ...codeRoutes, ...costRoutes, ...symptomRoutes];

  return allRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route.includes("/fix/") && route.split("/").length > 3 ? "monthly" : "weekly",
    priority: route === "" ? 1 : route.includes("/fix/") && route.split("/").length > 3 ? 0.9 : 0.7,
  }));
}

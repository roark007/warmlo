import type { MetadataRoute } from "next";
import { getIndexableRoutes } from "@/lib/site-routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return getIndexableRoutes();
}

/** Six high-search furnace codes for the home page quick links. */
export const featuredCodes = [
  { brandSlug: "goodman", codeSlug: "e4" },
  { brandSlug: "carrier", codeSlug: "33" },
  { brandSlug: "carrier", codeSlug: "14" },
  { brandSlug: "lennox", codeSlug: "270" },
  { brandSlug: "rheem", codeSlug: "33" },
  { brandSlug: "trane", codeSlug: "3-flashes" },
] as const;

export type FeaturedCodeRef = (typeof featuredCodes)[number];

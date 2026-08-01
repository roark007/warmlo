/**
 * Seasonal home-page rotation (manual — edit featuredCodes.ts each season).
 * See README.md § Seasonal calendar for when to swap.
 */
export const septemberFurnaceFeaturedCodes = [
  { brandSlug: "goodman", codeSlug: "e4" },
  { brandSlug: "goodman", codeSlug: "e0" },
  { brandSlug: "carrier", codeSlug: "33" },
  { brandSlug: "carrier", codeSlug: "14" },
  { brandSlug: "lennox", codeSlug: "270" },
  { brandSlug: "trane", codeSlug: "3-flashes" },
] as const;

export const juneAcFeaturedCodes = [
  { brandSlug: "carrier", codeSlug: "13" },
  { brandSlug: "goodman", codeSlug: "e4" },
  { brandSlug: "rheem", codeSlug: "13" },
  { brandSlug: "american-standard", codeSlug: "4-flashes" },
  { brandSlug: "trane", codeSlug: "4-flashes" },
  { brandSlug: "bryant", codeSlug: "33" },
] as const;

export const juneFeaturedSymptoms = [
  "ac-not-cooling",
  "ac-blowing-warm-air",
  "ac-frozen-coil",
  "furnace-blowing-cold-air",
  "ac-outside-unit-not-running",
  "ac-short-cycling",
] as const;

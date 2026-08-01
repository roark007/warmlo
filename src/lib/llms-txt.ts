import { getBrands, getSymptoms } from "@/lib/data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warmlo.com";

export function buildLlmsTxt(): string {
  const brands = getBrands();
  const lines = [
    "# Warmlo",
    "# Free HVAC error-code lookup and fair-price quote checker for homeowners.",
    "",
    `> ${BASE_URL}`,
    "",
    "## Tools",
    `- ${BASE_URL}/quote-check — Check whether an HVAC contractor quote is fair against national benchmarks.`,
    "",
    "## Brand error code hubs",
  ];

  for (const brand of brands) {
    lines.push(
      `- ${BASE_URL}/fix/${brand.slug} — ${brand.name} furnace error codes with meanings, DIY steps, and repair costs.`
    );
  }

  lines.push(
    `- ${BASE_URL}/data/hvac-quote-index — Warmlo HVAC Quote Index: national fair-price ranges and anonymized quote statistics.`
  );

  lines.push(
    `- ${BASE_URL}/about — Editorial methodology, fair-range sources, and how Warmlo is built.`
  );

  lines.push("");
  lines.push("## Symptom guides");
  for (const symptom of getSymptoms()) {
    lines.push(
      `- ${BASE_URL}/symptom/${symptom.slug} — ${symptom.title}: likely causes, checks, and linked error codes by brand.`
    );
  }

  lines.push("");
  lines.push("## Data");
  lines.push(
    `- ${BASE_URL}/fix — Browse all furnace error codes by brand (258+ codes).`
  );

  return `${lines.join("\n")}\n`;
}

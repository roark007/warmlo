import type { Brand, Code } from "@/lib/schemas";

export function buildCodePageJsonLd(brand: Brand, code: Code, baseUrl: string) {
  const pageUrl = `${baseUrl}/fix/${brand.slug}/${code.slug}`;

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What does ${brand.name} code ${code.code} mean?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: code.meaning,
        },
      },
      {
        "@type": "Question",
        name: `Can I fix ${brand.name} code ${code.code} myself?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            code.severity === "emergency"
              ? code.dangerNote ?? code.whenToCallPro
              : code.diySteps.length > 0
                ? code.diySteps.join(" ")
                : code.whenToCallPro,
        },
      },
      {
        "@type": "Question",
        name: "How much does it cost to fix?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Typical repair costs range from $${code.repairCostLow} to $${code.repairCostHigh}.`,
        },
      },
    ],
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Fix", item: `${baseUrl}/fix` },
      {
        "@type": "ListItem",
        position: 3,
        name: brand.name,
        item: `${baseUrl}/fix/${brand.slug}`,
      },
      { "@type": "ListItem", position: 4, name: code.code, item: pageUrl },
    ],
  };

  return [faqPage, breadcrumb];
}

export const CODE_PAGE_DISCLAIMER =
  "This is general information, not professional advice. Gas, electrical, and combustion repairs can be dangerous — when in doubt, call a licensed technician.";

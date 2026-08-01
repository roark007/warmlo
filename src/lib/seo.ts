import type { Brand, Code, QuoteIndex, Symptom } from "@/lib/schemas";
import { getQuoteIndexPageUrl } from "@/lib/quote-index";

export function dataUpdatedToIsoDate(dataUpdated: string): string {
  const [year, month] = dataUpdated.split("-");
  return new Date(Number(year), Number(month) - 1, 15).toISOString().split("T")[0];
}

export function buildCodePageTitle(brand: Brand, code: Code): string {
  const shortMeaning = code.title.includes(":")
    ? code.title.split(":").slice(1).join(":").trim()
    : code.meaning;
  return `${brand.name} Code ${code.code}: ${shortMeaning} — Fix It or Call a Pro? | Warmlo`;
}

export function buildCodePageDescription(brand: Brand, code: Code): string {
  const plainMeaning = code.title.includes(":")
    ? code.title.split(":").slice(1).join(":").trim().toLowerCase()
    : code.meaning.replace(/\.$/, "").trim().toLowerCase();

  const costHook = `Typical repair: $${code.repairCostLow}–$${code.repairCostHigh}. Free code lookup.`;

  let desc: string;
  if (code.severity === "emergency") {
    desc = `${code.code} on your ${brand.name} furnace is an emergency. ${costHook}`;
  } else if (code.diySteps.length > 0) {
    const cause = code.commonCauses[0]?.toLowerCase().replace(/^a /, "").replace(/^an /, "") ?? "basic checks";
    desc = `${code.code} means your ${brand.name} furnace ${plainMeaning}. Often ${cause} — check before you pay. ${costHook}`;
  } else {
    desc = `${code.code} means your ${brand.name} furnace ${plainMeaning}. ${costHook}`;
  }

  if (desc.length > 155) {
    desc = `${code.code} on your ${brand.name} furnace? ${costHook}`;
  }
  if (desc.length > 155) {
    desc = desc.slice(0, 152) + "...";
  }
  return desc;
}

export function buildBrandHubTitle(brand: Brand): string {
  const year = new Date().getFullYear();
  return `${brand.name} Furnace Error Codes: Complete List with Fixes & Costs (${year}) | Warmlo`;
}

export function buildRepairCostProse(repairName: string, costLow: number, costHigh: number): string {
  const name = repairName.toLowerCase();
  return `A ${name} typically costs between $${costLow.toLocaleString("en-US")} and $${costHigh.toLocaleString("en-US")} nationally.`;
}

export function buildCodePageJsonLd(
  brand: Brand,
  code: Code,
  baseUrl: string,
  dataUpdated: string
) {
  const pageUrl = `${baseUrl}/fix/${brand.slug}/${code.slug}`;
  const dateModified = dataUpdatedToIsoDate(dataUpdated);
  const answerText = code.snippetAnswer ?? code.meaning;

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    dateModified,
    mainEntity: [
      {
        "@type": "Question",
        name: `What does ${brand.name} code ${code.code} mean?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: answerText,
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

  const schemas: Record<string, unknown>[] = [faqPage, breadcrumb];

  if (code.severity !== "emergency" && code.diySteps.length >= 2) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to troubleshoot ${brand.name} furnace code ${code.code}`,
      description: answerText,
      dateModified,
      step: code.diySteps.map((text, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        text,
      })),
    });
  }

  return schemas;
}

export function buildSymptomPageTitle(symptom: Symptom): string {
  return `${symptom.title} — Causes, Fixes & When to Call a Pro | Warmlo`;
}

export function buildSymptomPageDescription(symptom: Symptom): string {
  const hook = symptom.snippetAnswer.length <= 120 ? symptom.snippetAnswer : `${symptom.snippetAnswer.slice(0, 117)}...`;
  let desc = `${hook} Free symptom guide with brand-specific error codes.`;
  if (desc.length > 155) desc = desc.slice(0, 152) + "...";
  return desc;
}

export function buildSymptomPageJsonLd(symptom: Symptom, baseUrl: string, dataUpdated: string) {
  const pageUrl = `${baseUrl}/symptom/${symptom.slug}`;
  const dateModified = dataUpdatedToIsoDate(dataUpdated);

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    dateModified,
    mainEntity: [
      {
        "@type": "Question",
        name: symptom.title,
        acceptedAnswer: { "@type": "Answer", text: symptom.snippetAnswer },
      },
      {
        "@type": "Question",
        name: "What causes this?",
        acceptedAnswer: {
          "@type": "Answer",
          text: symptom.likelyCauses.map((c) => `${c.cause} (${c.likelihood})`).join(". "),
        },
      },
    ],
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Symptoms", item: `${baseUrl}/symptom/${symptom.slug}` },
      { "@type": "ListItem", position: 3, name: symptom.title, item: pageUrl },
    ],
  };

  const schemas: Record<string, unknown>[] = [faqPage, breadcrumb];

  if (symptom.severityCeiling !== "emergency" && symptom.checkFirst.length >= 2) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `What to check when ${symptom.title.toLowerCase()}`,
      description: symptom.snippetAnswer,
      dateModified,
      step: symptom.checkFirst.map((text, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        text,
      })),
    });
  }

  return schemas;
}

export function buildCodePageHeadline(brand: Brand, code: Code, shortMeaning: string): string {
  if (code.flashPattern) {
    return `${brand.name} ${code.flashPattern} (Code ${code.code}): ${shortMeaning}`;
  }
  return `${brand.name} Furnace Code ${code.code}: ${shortMeaning}`;
}

export function buildQuoteIndexTitle(index: QuoteIndex): string {
  const year = index.dataUpdated.split("-")[0];
  return `What HVAC Work Should Cost in ${year}: Warmlo Quote Index | Warmlo`;
}

export function buildQuoteIndexDescription(index: QuoteIndex): string {
  const year = index.dataUpdated.split("-")[0];
  const count = index.jobs.length;
  return `National fair-price ranges for ${count} common HVAC jobs in ${year}. Methodology, citation-ready data, and anonymized quote statistics from Warmlo QuoteCheck.`;
}

export function buildQuoteIndexDatasetJsonLd(index: QuoteIndex, baseUrl: string) {
  const pageUrl = `${baseUrl}/data/hvac-quote-index`;
  const dateModified = dataUpdatedToIsoDate(index.dataUpdated);

  const distribution = index.jobs.map((job) => ({
    "@type": "DataDownload",
    name: job.label,
    contentUrl: pageUrl,
    encodingFormat: "text/html",
    description:
      job.dataStatus === "live" && job.medianQuotedPrice
        ? `Fair range ${job.fairLow}-${job.fairHigh} USD; median quoted ${job.medianQuotedPrice} USD (n=${job.quoteCount})`
        : `Fair range ${job.fairLow}-${job.fairHigh} USD; typical mid ${job.typicalMid} USD`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Warmlo HVAC Quote Index",
    description: index.methodology.overview,
    url: pageUrl,
    sameAs: getQuoteIndexPageUrl(),
    creator: {
      "@type": "Organization",
      name: "Warmlo",
      url: baseUrl,
    },
    dateModified,
    temporalCoverage: `${index.dataUpdated.split("-")[0]}`,
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    variableMeasured: index.jobs.map((j) => j.label),
    distribution,
  };
}

export const CODE_PAGE_DISCLAIMER =
  "This is general information, not professional advice. Gas, electrical, and combustion repairs can be dangerous — when in doubt, call a licensed technician.";

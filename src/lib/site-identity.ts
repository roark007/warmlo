const DEFAULT_SITE_URL = "https://warmlo.com";

export function getSiteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export function buildSiteIdentityJsonLd(baseUrl: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const organizationId = `${normalizedBaseUrl}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${normalizedBaseUrl}/#website`,
        url: `${normalizedBaseUrl}/`,
        name: "Warmlo",
        alternateName: ["warmlo.com"],
        publisher: { "@id": organizationId },
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        url: `${normalizedBaseUrl}/`,
        name: "Warmlo",
        description: "Independent furnace fault-code and HVAC repair-cost guidance.",
        logo: {
          "@type": "ImageObject",
          url: `${normalizedBaseUrl}/brand/warmlo-mark.svg`,
          width: 512,
          height: 512,
        },
        email: "hello@warmlo.com",
      },
    ],
  };
}

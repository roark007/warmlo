import Script from "next/script";

interface CodePageAnalyticsScriptProps {
  brand: string;
  code: string;
}

function escapeJsString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/** Lazy analytics on code pages — keeps Plausible off the critical path for LCP. */
export function CodePageAnalyticsScript({ brand, code }: CodePageAnalyticsScriptProps) {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  const brandEsc = escapeJsString(brand);
  const codeEsc = escapeJsString(code);

  return (
    <>
      <Script
        defer
        data-domain={domain}
        src="https://plausible.io/js/script.js"
        strategy="lazyOnload"
      />
      <Script id={`code-analytics-${brand}-${code}`} strategy="lazyOnload">
        {`window.plausible&&window.plausible('code_page_view',{props:{brand:'${brandEsc}',code:'${codeEsc}'}});`}
      </Script>
    </>
  );
}

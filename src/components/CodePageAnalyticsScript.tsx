interface CodePageAnalyticsScriptProps {
  brand: string;
  code: string;
}

function escapeJsString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/** Idle-loaded analytics — no next/script import to keep code pages JS-free. */
export function CodePageAnalyticsScript({ brand, code }: CodePageAnalyticsScriptProps) {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  const domainEsc = escapeJsString(domain);
  const brandEsc = escapeJsString(brand);
  const codeEsc = escapeJsString(code);

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){function run(){var s=document.createElement("script");s.defer=1;s.dataset.domain="${domainEsc}";s.src="https://plausible.io/js/script.js";s.onload=function(){window.plausible&&window.plausible("code_page_view",{props:{brand:"${brandEsc}",code:"${codeEsc}"}});};document.body.appendChild(s);}("requestIdleCallback"in window)?requestIdleCallback(run):addEventListener("load",run);})();`,
      }}
    />
  );
}

interface CodePageAnalyticsScriptProps {
  brand: string;
  code: string;
}

function escapeJsString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/** Idle-loaded analytics — no next/script import to keep code pages JS-free. */
export function CodePageAnalyticsScript({ brand, code }: CodePageAnalyticsScriptProps) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!plausibleDomain && !gaId) return null;

  const brandEsc = escapeJsString(brand);
  const codeEsc = escapeJsString(code);

  let loader: string;
  if (plausibleDomain) {
    const domainEsc = escapeJsString(plausibleDomain);
    loader = `var s=document.createElement("script");s.defer=1;s.dataset.domain="${domainEsc}";s.src="https://plausible.io/js/script.js";s.onload=function(){window.plausible&&window.plausible("code_page_view",{props:{brand:"${brandEsc}",code:"${codeEsc}"}});};document.body.appendChild(s);`;
  } else {
    const gaIdEsc = escapeJsString(gaId as string);
    loader = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag("js",new Date());gtag("config","${gaIdEsc}");var s=document.createElement("script");s.async=1;s.src="https://www.googletagmanager.com/gtag/js?id=${gaIdEsc}";s.onload=function(){gtag("event","code_page_view",{brand:"${brandEsc}",code:"${codeEsc}"});};document.body.appendChild(s);`;
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){function run(){${loader}}addEventListener("load",run);})();`,
      }}
    />
  );
}

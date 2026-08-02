import { getIndexableRoutes, INDEXNOW_KEY, SITE_URL } from "../src/lib/site-routes";

const endpoint = "https://api.indexnow.org/indexnow";
const site = new URL(SITE_URL);
const keyLocation = `${site.origin}/${INDEXNOW_KEY}.txt`;

function resolveUrls(args: string[]): string[] {
  const knownUrls = new Set(getIndexableRoutes().map(({ url }) => url));

  if (args.length === 0) return [...knownUrls];

  return args.map((value) => {
    const url = new URL(value.startsWith("http") ? value : value, site.origin);
    if (url.origin !== site.origin) {
      throw new Error(`Refusing to submit a URL outside ${site.origin}: ${url.href}`);
    }
    if (!knownUrls.has(url.href)) {
      throw new Error(`URL is not in the canonical sitemap: ${url.href}`);
    }
    return url.href;
  });
}

async function main() {
  const urlList = resolveUrls(process.argv.slice(2));
  const keyResponse = await fetch(keyLocation, { cache: "no-store" });
  const publishedKey = keyResponse.ok ? (await keyResponse.text()).trim() : "";

  if (publishedKey !== INDEXNOW_KEY) {
    throw new Error(
      `IndexNow key is not live at ${keyLocation}. Deploy the site before submitting URLs.`
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: site.host,
      key: INDEXNOW_KEY,
      keyLocation,
      urlList,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`IndexNow returned ${response.status}: ${detail || response.statusText}`);
  }

  console.log(`Submitted ${urlList.length} canonical URL(s) to IndexNow (${response.status}).`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

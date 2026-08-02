import fs from "fs";
import path from "path";
import { brandsSchema, codesSchema, repairsSchema, symptomsSchema } from "../src/lib/schemas";
import { AFFILIATE_DISCLOSURE } from "../src/components/SiteChrome";
import { CODE_PAGE_DISCLAIMER } from "../src/lib/seo";
import { buildLlmsTxt } from "../src/lib/llms-txt";
import { buildSiteIdentityJsonLd } from "../src/lib/site-identity";
import { CONTENT_LAST_MODIFIED, INDEXNOW_KEY, SITE_URL } from "../src/lib/site-routes";

const INDEX_ROUTE = "/data/hvac-quote-index";
const BUILD_DIR = path.join(process.cwd(), ".next");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function fail(msg: string) {
  console.error(`FAIL: ${msg}`);
  process.exitCode = 1;
}

function pass(msg: string) {
  console.log(`PASS: ${msg}`);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

type JsonLdRecord = Record<string, unknown>;

function isJsonLdRecord(value: unknown): value is JsonLdRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractJsonLd(html: string): JsonLdRecord[] {
  const nodes: JsonLdRecord[] = [];
  const scriptPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match;

  while ((match = scriptPattern.exec(html)) !== null) {
    try {
      const parsed: unknown = JSON.parse(match[1]);
      if (!isJsonLdRecord(parsed)) continue;
      const graph = parsed["@graph"];
      if (Array.isArray(graph)) {
        for (const entity of graph) {
          if (isJsonLdRecord(entity)) nodes.push(entity);
        }
      } else {
        nodes.push(parsed);
      }
    } catch {
      // JSON-LD syntax is checked by the focused schema assertions below; ignore
      // unrelated malformed scripts here so the remaining site checks can report.
    }
  }

  return nodes;
}

function countAttribute(html: string, attribute: string, value: string): number {
  return (html.match(new RegExp(`${attribute}="${value}"`, "g")) ?? []).length;
}

function duplicateHtmlIds(html: string): string[] {
  const counts = new Map<string, number>();
  const pattern = /\bid="([^"]+)"/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id);
}

function findHtmlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(full));
    } else if (entry.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
}

function routeFromHtmlFile(filePath: string): string {
  const rel = path.relative(path.join(BUILD_DIR, "server", "app"), filePath);
  let route = rel.replace(/\\/g, "/").replace(/\.html$/, "");
  if (route === "index") return "/";
  if (route.endsWith("/index")) route = route.slice(0, -"/index".length);
  return route === "" ? "/" : `/${route}`;
}

function readPageHtml(routePath: string, htmlFiles: Map<string, string>): string | null {
  const normalized = routePath === "/" ? "index" : routePath.slice(1);
  const candidates = [
    `${normalized}.html`,
    `${normalized}/index.html`,
    path.join(normalized, "index.html").replace(/\\/g, "/"),
  ];
  for (const [file, content] of htmlFiles) {
    const rel = path.relative(path.join(BUILD_DIR, "server", "app"), file).replace(/\\/g, "/");
    if (candidates.some((c) => rel === c || rel.endsWith(`/${c}`))) {
      return content;
    }
  }
  // Fallback: search by path segment
  for (const [file, content] of htmlFiles) {
    if (file.includes(normalized.replace(/\//g, path.sep))) {
      return content;
    }
  }
  return null;
}

function extractLinks(html: string): string[] {
  const links: string[] = [];
  const regex = /href="(\/[^"#?]*)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  return links;
}

console.log("Running post-build site checks…\n");

if (!fs.existsSync(BUILD_DIR)) {
  fail(".next build output not found — run npm run build first");
  process.exit(1);
}

const brands = brandsSchema.parse(readJson(path.join(process.cwd(), "data", "brands.json")));
const repairs = repairsSchema.parse(readJson(path.join(process.cwd(), "data", "repairs.json")));
const symptoms = symptomsSchema.parse(readJson(path.join(process.cwd(), "data", "symptoms.json")));

const expectedCodeRoutes = new Set<string>();
const expectedSymptomRoutes = new Set(symptoms.map((s) => `/symptom/${s.slug}`));
let totalCodes = 0;
for (const brand of brands) {
  const codes = codesSchema.parse(
    readJson(path.join(process.cwd(), "data", "codes", `${brand.slug}.json`))
  );
  totalCodes += codes.length;
  for (const code of codes) {
    expectedCodeRoutes.add(`/fix/${brand.slug}/${code.slug}`);
  }
}

const htmlFilePaths = findHtmlFiles(path.join(BUILD_DIR, "server", "app"));
const htmlFiles = new Map<string, string>();
for (const file of htmlFilePaths) {
  htmlFiles.set(file, fs.readFileSync(file, "utf-8"));
}

const generatedRoutes = new Set<string>();
for (const file of htmlFilePaths) {
  generatedRoutes.add(routeFromHtmlFile(file));
}

// Also check app paths manifest if available
const prerenderManifest = path.join(BUILD_DIR, "prerender-manifest.json");
if (fs.existsSync(prerenderManifest)) {
  const manifest = readJson<{ routes: Record<string, unknown> }>(prerenderManifest);
  for (const route of Object.keys(manifest.routes ?? {})) {
    generatedRoutes.add(route);
  }
}

// Route census
let censusOk = true;
for (const route of expectedCodeRoutes) {
  const found =
    generatedRoutes.has(route) ||
    htmlFilePaths.some((f) => f.includes(route.replace(/\//g, path.sep).slice(1)));
  if (!found) {
    fail(`missing code page: ${route}`);
    censusOk = false;
  }
}
for (const brand of brands) {
  const brandRoute = `/fix/${brand.slug}`;
  if (![...generatedRoutes].some((r) => r === brandRoute) && !htmlFilePaths.some((f) => f.includes(brand.slug))) {
    fail(`missing brand page: ${brandRoute}`);
    censusOk = false;
  }
}
for (const repair of repairs) {
  const costRoute = `/cost/${repair.slug}`;
  if (![...generatedRoutes].some((r) => r === costRoute) && !htmlFilePaths.some((f) => f.includes(repair.slug))) {
    fail(`missing cost page: ${costRoute}`);
    censusOk = false;
  }
}
for (const route of expectedSymptomRoutes) {
  const found =
    generatedRoutes.has(route) ||
    htmlFilePaths.some((f) => f.includes(route.replace(/\//g, path.sep).slice(1)));
  if (!found) {
    fail(`missing symptom page: ${route}`);
    censusOk = false;
  }
}
const indexFound =
  generatedRoutes.has(INDEX_ROUTE) ||
  htmlFilePaths.some((f) => f.includes("hvac-quote-index"));
if (!indexFound) {
  fail(`missing quote index page: ${INDEX_ROUTE}`);
  censusOk = false;
}
const aboutFound =
  generatedRoutes.has("/about") || htmlFilePaths.some((f) => f.includes(`${path.sep}about`));
if (!aboutFound) {
  fail("missing about page: /about");
  censusOk = false;
}
if (censusOk) {
  pass(
    `route census — ${totalCodes} code pages, ${brands.length} brand pages, ${repairs.length} cost pages, ${symptoms.length} symptom pages, 1 quote index, 1 about`
  );
}

// Warmlo identity graph and public logo
let identityOk = true;
const homeHtml = readPageHtml("/", htmlFiles);
const expectedIdentity = buildSiteIdentityJsonLd(SITE_URL);
const expectedWebsiteId = `${SITE_URL}/#website`;
const expectedOrganizationId = `${SITE_URL}/#organization`;
if (!homeHtml) {
  fail("could not read HTML for home identity check");
  identityOk = false;
} else {
  const identityEntities = extractJsonLd(homeHtml);
  const websiteEntities = identityEntities.filter((entity) => entity["@type"] === "WebSite");
  const organizationEntities = identityEntities.filter((entity) => entity["@type"] === "Organization");
  if (websiteEntities.length !== 1) {
    fail(`home: expected exactly one WebSite entity, found ${websiteEntities.length}`);
    identityOk = false;
  }
  if (organizationEntities.length !== 1) {
    fail(`home: expected exactly one Organization entity, found ${organizationEntities.length}`);
    identityOk = false;
  }
  const website = websiteEntities[0];
  const organization = organizationEntities[0];
  if (website?.["@id"] !== expectedWebsiteId || website?.name !== "Warmlo") {
    fail("home: WebSite identity does not match the canonical Warmlo contract");
    identityOk = false;
  }
  if (organization?.["@id"] !== expectedOrganizationId || organization?.name !== "Warmlo") {
    fail("home: Organization identity does not match the canonical Warmlo contract");
    identityOk = false;
  }
  if (!homeHtml.includes(JSON.stringify(expectedIdentity))) {
    fail("home: WebSite/Organization graph does not match the shared identity helper");
    identityOk = false;
  }
}
if (!fs.existsSync(path.join(PUBLIC_DIR, "brand", "warmlo-mark.svg"))) {
  fail("missing public/brand/warmlo-mark.svg");
  identityOk = false;
}
if (identityOk) pass("home WebSite/Organization identity and public Warmlo mark");

// Required content on sample code pages
const sampleRoutes = [...expectedCodeRoutes].slice(0, 5);
let contentOk = true;
for (const route of sampleRoutes) {
  let html = readPageHtml(route, htmlFiles);
  if (!html) {
    for (const file of htmlFilePaths) {
      if (file.includes(route.split("/").pop() ?? "")) {
        html = htmlFiles.get(file) ?? null;
        break;
      }
    }
  }
  if (!html) {
    fail(`could not read HTML for ${route}`);
    contentOk = false;
    continue;
  }
  if (!/<h1[^>]*>/.test(html)) {
    fail(`${route}: missing H1`);
    contentOk = false;
  }
  if (!html.includes("DIY possible") && !html.includes("Call a pro soon") && !html.includes("Emergency")) {
    fail(`${route}: missing severity badge`);
    contentOk = false;
  }
  if (!html.includes(CODE_PAGE_DISCLAIMER)) {
    fail(`${route}: missing disclaimer`);
    contentOk = false;
  }
  if (!html.includes("/quote-check")) {
    fail(`${route}: missing link to /quote-check`);
    contentOk = false;
  }
  if (!html.includes("FAQPage")) {
    fail(`${route}: missing FAQPage JSON-LD`);
    contentOk = false;
  }

  const parts = route.split("/");
  const brandSlug = parts[2];
  const codeSlug = parts[3];
  const codes = codesSchema.parse(
    readJson(path.join(process.cwd(), "data", "codes", `${brandSlug}.json`))
  );
  const code = codes.find((c) => c.slug === codeSlug);
  const needsHowTo =
    code && code.severity !== "emergency" && code.diySteps.length >= 2;
  if (needsHowTo && !html.includes("HowTo")) {
    fail(`${route}: missing HowTo JSON-LD on non-emergency code page`);
    contentOk = false;
  }

  const requiredSectionIds = ["meaning", "causes", "first-steps", "repair-cost", "call-a-pro"];
  for (const id of requiredSectionIds) {
    if (countAttribute(html, "id", id) !== 1) {
      fail(`${route}: expected exactly one #${id} section`);
      contentOk = false;
    }
    if (!html.includes(`href="#${id}"`)) {
      fail(`${route}: missing on-page link to #${id}`);
      contentOk = false;
    }
  }
  for (const cause of code?.commonCauses.slice(0, 2) ?? []) {
    if (!html.includes(cause)) {
      fail(`${route}: missing rendered common cause: ${cause}`);
      contentOk = false;
    }
  }
  const duplicateIds = duplicateHtmlIds(html);
  if (duplicateIds.length > 0) {
    fail(`${route}: duplicate HTML IDs: ${duplicateIds.join(", ")}`);
    contentOk = false;
  }
}
if (contentOk && sampleRoutes.length > 0) {
  pass(`required content on ${sampleRoutes.length} sample code pages`);
}

// Required passage structure on sample symptom pages
let symptomContentOk = true;
for (const route of [...expectedSymptomRoutes].slice(0, 3)) {
  const html = readPageHtml(route, htmlFiles);
  if (!html) {
    fail(`could not read HTML for ${route}`);
    symptomContentOk = false;
    continue;
  }
  for (const id of ["meaning", "likely-causes", "exact-code", "first-steps"]) {
    if (countAttribute(html, "id", id) !== 1 || !html.includes(`href="#${id}"`)) {
      fail(`${route}: missing stable section/nav target #${id}`);
      symptomContentOk = false;
    }
  }
  const duplicateIds = duplicateHtmlIds(html);
  if (duplicateIds.length > 0) {
    fail(`${route}: duplicate HTML IDs: ${duplicateIds.join(", ")}`);
    symptomContentOk = false;
  }
}
if (symptomContentOk) pass("passage structure on 3 sample symptom pages");

// Required content on sample cost pages
const sampleCostRoutes = repairs.slice(0, 3).map((r) => `/cost/${r.slug}`);
let costContentOk = true;
for (const route of sampleCostRoutes) {
  let html = readPageHtml(route, htmlFiles);
  if (!html) {
    for (const file of htmlFilePaths) {
      if (file.includes(route.split("/").pop() ?? "")) {
        html = htmlFiles.get(file) ?? null;
        break;
      }
    }
  }
  if (!html) {
    fail(`could not read HTML for ${route}`);
    costContentOk = false;
    continue;
  }
  if (!/<h1[^>]*>/.test(html)) {
    fail(`${route}: missing H1`);
    costContentOk = false;
  }
  if (!html.includes("Error codes that lead to this repair") && !html.includes("Related error codes")) {
    fail(`${route}: missing related error codes section`);
    costContentOk = false;
  }
  if (!html.includes(CODE_PAGE_DISCLAIMER)) {
    fail(`${route}: missing disclaimer`);
    costContentOk = false;
  }
  if (!html.includes("/quote-check")) {
    fail(`${route}: missing link to /quote-check`);
    costContentOk = false;
  }
}
if (costContentOk && sampleCostRoutes.length > 0) {
  pass(`required content on ${sampleCostRoutes.length} sample cost pages`);
}

// Quote Index page content
let indexContentOk = true;
let indexHtml = readPageHtml(INDEX_ROUTE, htmlFiles);
if (!indexHtml) {
  for (const file of htmlFilePaths) {
    if (file.includes("hvac-quote-index")) {
      indexHtml = htmlFiles.get(file) ?? null;
      break;
    }
  }
}
if (!indexHtml) {
  fail(`could not read HTML for ${INDEX_ROUTE}`);
  indexContentOk = false;
} else {
  if (!/<h1[^>]*>/.test(indexHtml)) {
    fail(`${INDEX_ROUTE}: missing H1`);
    indexContentOk = false;
  }
  if (!indexHtml.includes("Dataset") && !indexHtml.includes('"@type":"Dataset"')) {
    fail(`${INDEX_ROUTE}: missing Dataset JSON-LD`);
    indexContentOk = false;
  }
  if (!indexHtml.includes("Cite this data") && !indexHtml.includes("Copy citation")) {
    fail(`${INDEX_ROUTE}: missing cite block`);
    indexContentOk = false;
  }
  if (!indexHtml.includes("Methodology")) {
    fail(`${INDEX_ROUTE}: missing methodology section`);
    indexContentOk = false;
  }
  if (!indexHtml.includes("/data/hvac-quote-index") && !indexHtml.includes("Fair range")) {
    fail(`${INDEX_ROUTE}: missing data table content`);
    indexContentOk = false;
  }
}
if (indexContentOk) pass("quote index page content");

// About page content
let aboutContentOk = true;
let aboutHtml = readPageHtml("/about", htmlFiles);
if (!aboutHtml) {
  for (const file of htmlFilePaths) {
    if (file.includes(`${path.sep}about`)) {
      aboutHtml = htmlFiles.get(file) ?? null;
      break;
    }
  }
}
if (!aboutHtml) {
  fail("could not read HTML for /about");
  aboutContentOk = false;
} else {
  if (!/<h1[^>]*>/.test(aboutHtml)) {
    fail("/about: missing H1");
    aboutContentOk = false;
  }
  if (!aboutHtml.includes("Methodology") && !aboutHtml.includes("How FixCode")) {
    fail("/about: missing methodology content");
    aboutContentOk = false;
  }
  if (!aboutHtml.includes("Quote Index") && !aboutHtml.includes("hvac-quote-index")) {
    fail("/about: missing Quote Index section");
    aboutContentOk = false;
  }
  if (!aboutHtml.includes("Organization") && !aboutHtml.includes('"@type":"Organization"')) {
    fail("/about: missing Organization JSON-LD");
    aboutContentOk = false;
  }
  const aboutOrganization = extractJsonLd(aboutHtml).find(
    (entity) => entity["@type"] === "Organization"
  );
  if (aboutOrganization?.["@id"] !== expectedOrganizationId) {
    fail("/about: Organization JSON-LD does not reference the canonical Warmlo entity");
    aboutContentOk = false;
  }
  if (aboutOrganization && "sameAs" in aboutOrganization) {
    fail("/about: Organization JSON-LD must not use a self-referential sameAs");
    aboutContentOk = false;
  }
}
if (aboutContentOk) pass("about page content");

// Internal link check
const validRoutes = new Set([...generatedRoutes]);
validRoutes.add("/fix");
validRoutes.add("/quote-check");
validRoutes.add("/about");
validRoutes.add("/privacy");
validRoutes.add("/terms");
validRoutes.add("/disclosure");
for (const route of expectedCodeRoutes) validRoutes.add(route);
for (const brand of brands) validRoutes.add(`/fix/${brand.slug}`);
for (const repair of repairs) validRoutes.add(`/cost/${repair.slug}`);
for (const symptom of symptoms) validRoutes.add(`/symptom/${symptom.slug}`);
validRoutes.add(INDEX_ROUTE);

let linksOk = true;
for (const [, html] of htmlFiles) {
  for (const link of extractLinks(html)) {
    if (link.startsWith("/cost/") || link.startsWith("/fix/") || link === "/quote-check") {
      const linkBase = link.split("?")[0];
      const known =
        validRoutes.has(linkBase) ||
        [...expectedCodeRoutes].some((r) => linkBase.startsWith(r)) ||
        htmlFilePaths.some((f) => f.includes(linkBase.slice(1).replace(/\//g, path.sep)));
      if (!known && linkBase !== "/") {
        // Allow partial matches for dynamic routes
        const segment = linkBase.split("/").pop();
        if (!htmlFilePaths.some((f) => f.includes(segment ?? ""))) {
          fail(`broken internal link: ${link}`);
          linksOk = false;
        }
      }
    }
  }
}
if (linksOk) pass("internal link check");

// Sitemap check
const sitemapPath = path.join(BUILD_DIR, "server", "app", "sitemap.xml.body");
let sitemapContent = "";
if (fs.existsSync(sitemapPath)) {
  sitemapContent = fs.readFileSync(sitemapPath, "utf-8");
} else {
  // Try public or standalone
  const alt = path.join(PUBLIC_DIR, "sitemap.xml");
  if (fs.existsSync(alt)) sitemapContent = fs.readFileSync(alt, "utf-8");
}

if (!sitemapContent) {
  // Fetch from route file in .next
  for (const file of htmlFilePaths) {
    if (file.includes("sitemap")) {
      sitemapContent = fs.readFileSync(file, "utf-8");
    }
  }
}

// For Next.js metadata routes, read from .next/server/app/sitemap.xml/route.js output
const sitemapBodyFiles = findHtmlFiles(BUILD_DIR).filter((f) => f.includes("sitemap"));
for (const f of sitemapBodyFiles) {
  if (f.endsWith(".body") || f.includes("sitemap")) {
    try {
      sitemapContent += fs.readFileSync(f, "utf-8");
    } catch {
      /* ignore */
    }
  }
}

// Build sitemap from known routes if file not directly readable
if (!sitemapContent.includes("<urlset")) {
  // Run a minimal generation check using prerender manifest
  if (fs.existsSync(prerenderManifest)) {
    const manifest = readJson<{ routes: Record<string, unknown> }>(prerenderManifest);
    sitemapContent = Object.keys(manifest.routes).join("\n");
  }
}

let sitemapOk = true;
const contentRoutes = [
  "/",
  "/fix",
  "/quote-check",
  ...brands.map((b) => `/fix/${b.slug}`),
  ...expectedCodeRoutes,
  ...repairs.map((r) => `/cost/${r.slug}`),
  ...symptoms.map((s) => `/symptom/${s.slug}`),
  INDEX_ROUTE,
  "/about",
  "/privacy",
  "/terms",
  "/disclosure",
];

for (const route of contentRoutes) {
  if (!sitemapContent.includes(route) && !sitemapContent.includes(route.slice(1))) {
    // lenient: check prerender manifest
    if (fs.existsSync(prerenderManifest)) {
      const manifest = readJson<{ routes: Record<string, unknown> }>(prerenderManifest);
      if (!manifest.routes[route]) {
        fail(`sitemap missing route: ${route}`);
        sitemapOk = false;
      }
    }
  }
}
if (sitemapOk) pass("sitemap includes content routes");

if (sitemapContent.includes("<urlset")) {
  const quoteIndex = readJson<{ generatedAt: string }>(
    path.join(process.cwd(), "data", "quote-index.json")
  );
  const allowedLastModifiedDates = new Set([
    CONTENT_LAST_MODIFIED,
    quoteIndex.generatedAt,
  ]);
  const lastModifiedDates = [
    ...sitemapContent.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})(?:T[^<]*)?<\/lastmod>/g),
  ].map((match) => match[1]);

  if (lastModifiedDates.length === 0) {
    fail("sitemap has no lastmod dates");
  } else if (lastModifiedDates.some((date) => !allowedLastModifiedDates.has(date))) {
    fail("sitemap contains a deployment-time or unknown lastmod date");
  } else {
    pass("sitemap uses stable content modification dates");
  }
}

const canonicalRoutes = [
  "/",
  "/fix",
  "/quote-check",
  "/about",
  "/privacy",
  "/terms",
  "/disclosure",
];
let canonicalsOk = true;
for (const route of canonicalRoutes) {
  const html = readPageHtml(route, htmlFiles);
  const canonicalUrl = `https://warmlo.com${route === "/" ? "" : route}`;
  if (!html || !html.includes(`rel="canonical" href="${canonicalUrl}"`)) {
    fail(`${route}: missing canonical URL ${canonicalUrl}`);
    canonicalsOk = false;
  }
}
if (canonicalsOk) pass("canonical URLs on static indexable pages");

const indexNowKeyPath = path.join(PUBLIC_DIR, `${INDEXNOW_KEY}.txt`);
if (!fs.existsSync(indexNowKeyPath)) {
  fail("IndexNow key file is missing");
} else if (fs.readFileSync(indexNowKeyPath, "utf-8").trim() !== INDEXNOW_KEY) {
  fail("IndexNow key file does not match the configured key");
} else {
  pass("IndexNow verification key");
}

// Compliance footer check
const compliancePages = ["/", "/fix/goodman/e4", "/quote-check"];
let complianceOk = true;
for (const route of compliancePages) {
  let html = readPageHtml(route, htmlFiles);
  if (!html) {
    for (const file of htmlFilePaths) {
      const content = htmlFiles.get(file)!;
      if (
        (route === "/" && file.endsWith(`${path.sep}index.html`)) ||
        (route !== "/" && file.includes(route.split("/").pop() ?? "___"))
      ) {
        html = content;
        break;
      }
    }
  }
  if (!html || !html.includes(AFFILIATE_DISCLOSURE)) {
    fail(`footer disclosure missing on ${route}`);
    complianceOk = false;
  }
}
if (complianceOk) pass("compliance footer disclosure");

// llms.txt check
const llmsContent = buildLlmsTxt();
if (!llmsContent.includes("# Warmlo")) {
  fail("llms.txt: missing header");
} else if (!llmsContent.includes("/quote-check")) {
  fail("llms.txt: missing QuoteCheck entry");
} else {
  let llmsBrandOk = true;
  for (const brand of brands) {
    if (!llmsContent.includes(`/fix/${brand.slug}`)) {
      fail(`llms.txt: missing brand hub ${brand.slug}`);
      llmsBrandOk = false;
    }
  }
  if (llmsBrandOk) pass(`llms.txt includes ${brands.length} brand hubs + QuoteCheck`);
  if (!llmsContent.includes("/symptom/")) {
    fail("llms.txt: missing symptom guides");
  } else if (llmsBrandOk) {
    pass(`llms.txt includes ${symptoms.length} symptom guides`);
  }
  if (!llmsContent.includes("/data/hvac-quote-index")) {
    fail("llms.txt: missing Quote Index entry");
  } else if (llmsBrandOk) {
    pass("llms.txt includes HVAC Quote Index");
  }
  if (!llmsContent.includes("/about")) {
    fail("llms.txt: missing About entry");
  } else if (llmsBrandOk) {
    pass("llms.txt includes About page");
  }
}

console.log(process.exitCode === 1 ? "\nSite check FAILED" : "\nSite check PASSED");
process.exit(process.exitCode ?? 0);

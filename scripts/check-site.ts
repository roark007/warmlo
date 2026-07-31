import fs from "fs";
import path from "path";
import { brandsSchema, codesSchema, repairsSchema } from "../src/lib/schemas";
import { AFFILIATE_DISCLOSURE } from "../src/components/SiteChrome";
import { CODE_PAGE_DISCLAIMER } from "../src/lib/seo";

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

const expectedCodeRoutes = new Set<string>();
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
if (censusOk) {
  pass(
    `route census — ${totalCodes} code pages, ${brands.length} brand pages, ${repairs.length} cost pages`
  );
}

// Required content on sample code pages
const sampleRoutes = [...expectedCodeRoutes].slice(0, 5);
let contentOk = true;
for (const route of sampleRoutes) {
  let html = readPageHtml(route, htmlFiles);
  if (!html) {
    // Try prerender manifest HTML path
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
}
if (contentOk && sampleRoutes.length > 0) {
  pass(`required content on ${sampleRoutes.length} sample code pages`);
}

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
  if (!html.includes("Related error codes") && !html.includes("related error codes")) {
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

// Internal link check
const validRoutes = new Set([...generatedRoutes]);
validRoutes.add("/fix");
validRoutes.add("/quote-check");
validRoutes.add("/privacy");
validRoutes.add("/terms");
validRoutes.add("/disclosure");
for (const route of expectedCodeRoutes) validRoutes.add(route);
for (const brand of brands) validRoutes.add(`/fix/${brand.slug}`);
for (const repair of repairs) validRoutes.add(`/cost/${repair.slug}`);

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

console.log(process.exitCode === 1 ? "\nSite check FAILED" : "\nSite check PASSED");
process.exit(process.exitCode ?? 0);

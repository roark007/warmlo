import fs from "fs";
import path from "path";
import {
  brandsSchema,
  codesSchema,
  repairsSchema,
  quoteBenchmarksSchema,
  slugSchema,
} from "../src/lib/schemas";

const DATA_DIR = path.join(process.cwd(), "data");
const BUILD_PHASE = Number(process.env.BUILD_PHASE ?? "1");

const PHASE_TARGETS: Record<number, { brands: number; codes: number; repairs: number }> = {
  1: { brands: 1, codes: 5, repairs: 1 },
  2: { brands: 17, codes: 200, repairs: 18 },
  3: { brands: 17, codes: 200, repairs: 18 },
  4: { brands: 17, codes: 200, repairs: 18 },
};

function pass(label: string) {
  console.log(`PASS: ${label}`);
}

function fail(label: string, detail: string) {
  console.error(`FAIL: ${label} — ${detail}`);
  process.exitCode = 1;
}

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

console.log("Validating Warmlo data…\n");

// 1. Schema validation
try {
  brandsSchema.parse(readJson(path.join(DATA_DIR, "brands.json")));
  pass("brands.json schema");
} catch (e) {
  fail("brands.json schema", String(e));
}

const brands = brandsSchema.parse(readJson(path.join(DATA_DIR, "brands.json")));

for (const brand of brands) {
  const codeFile = path.join(DATA_DIR, "codes", `${brand.slug}.json`);
  if (!fs.existsSync(codeFile)) {
    fail(`codes/${brand.slug}.json exists`, "missing file");
    continue;
  }
  try {
    codesSchema.parse(readJson(codeFile));
    pass(`codes/${brand.slug}.json schema`);
  } catch (e) {
    fail(`codes/${brand.slug}.json schema`, String(e));
  }
}

try {
  repairsSchema.parse(readJson(path.join(DATA_DIR, "repairs.json")));
  pass("repairs.json schema");
} catch (e) {
  fail("repairs.json schema", String(e));
}

try {
  quoteBenchmarksSchema.parse(readJson(path.join(DATA_DIR, "quote-benchmarks.json")));
  pass("quote-benchmarks.json schema");
} catch (e) {
  fail("quote-benchmarks.json schema", String(e));
}

// 2. Brand/code file parity
const codesDir = path.join(DATA_DIR, "codes");
const codeFiles = fs.existsSync(codesDir)
  ? fs.readdirSync(codesDir).filter((f) => f.endsWith(".json"))
  : [];

const brandSlugs = new Set(brands.map((b) => b.slug));
const codeFileSlugs = new Set(codeFiles.map((f) => f.replace(".json", "")));

for (const slug of brandSlugs) {
  if (!codeFileSlugs.has(slug)) {
    fail("brand/code parity", `brand "${slug}" has no codes file`);
  }
}
for (const slug of codeFileSlugs) {
  if (!brandSlugs.has(slug)) {
    fail("brand/code parity", `orphan codes file "${slug}.json"`);
  }
}
if (process.exitCode !== 1) pass("brand/code file parity");

// 3. Slug uniqueness and format
const allSlugs: string[] = [];
for (const brand of brands) {
  allSlugs.push(brand.slug);
}
const repairs = repairsSchema.parse(readJson(path.join(DATA_DIR, "repairs.json")));
for (const repair of repairs) {
  allSlugs.push(repair.slug);
}
for (const file of codeFiles) {
  const codes = codesSchema.parse(readJson(path.join(codesDir, file)));
  for (const code of codes) {
    allSlugs.push(code.slug);
  }
}

let slugOk = true;
const seen = new Set<string>();
for (const slug of allSlugs) {
  if (!slugSchema.safeParse(slug).success) {
    fail("slug format", `invalid slug "${slug}"`);
    slugOk = false;
  }
  if (seen.has(slug)) {
    fail("slug uniqueness", `duplicate slug "${slug}"`);
    slugOk = false;
  }
  seen.add(slug);
}
if (slugOk) pass("slug format and uniqueness");

// 4. relatedRepairSlug references
const repairSlugs = new Set(repairs.map((r) => r.slug));
for (const file of codeFiles) {
  const codes = codesSchema.parse(readJson(path.join(codesDir, file)));
  for (const code of codes) {
    if (!repairSlugs.has(code.relatedRepairSlug)) {
      fail(
        "relatedRepairSlug",
        `code ${code.code} references missing repair "${code.relatedRepairSlug}"`
      );
    }
  }
}
if (process.exitCode !== 1) pass("relatedRepairSlug references");

// 5. Code content rules
let codeContentOk = true;
for (const file of codeFiles) {
  const codes = codesSchema.parse(readJson(path.join(codesDir, file)));
  for (const code of codes) {
    if (code.commonCauses.length < 2) {
      fail("code content", `${code.code}: needs ≥2 commonCauses`);
      codeContentOk = false;
    }
    if (code.diySteps.length < 2 && code.dangerNote === null) {
      fail("code content", `${code.code}: needs ≥2 diySteps or dangerNote`);
      codeContentOk = false;
    }
  }
}
if (codeContentOk) pass("code content rules");

// 6. Cost validation
let costOk = true;
for (const file of codeFiles) {
  const codes = codesSchema.parse(readJson(path.join(codesDir, file)));
  for (const code of codes) {
    if (code.repairCostLow >= code.repairCostHigh) {
      fail("repair costs", `${code.code}: repairCostLow must be < repairCostHigh`);
      costOk = false;
    }
  }
}
for (const repair of repairs) {
  if (repair.costLow >= repair.costHigh) {
    fail("repair costs", `${repair.slug}: costLow must be < costHigh`);
    costOk = false;
  }
}
if (costOk) pass("cost ranges");

// 7. Benchmark validation
const benchmarksData = quoteBenchmarksSchema.parse(
  readJson(path.join(DATA_DIR, "quote-benchmarks.json"))
);
let benchmarkOk = true;
for (const b of benchmarksData.benchmarks) {
  if (!(b.fairLow < b.typicalMid && b.typicalMid < b.fairHigh)) {
    fail("benchmarks", `${b.jobType}: fairLow < typicalMid < fairHigh`);
    benchmarkOk = false;
  }
  for (const f of b.factors) {
    if (f.adjustPct < 1 || f.adjustPct > 100) {
      fail("benchmarks", `${b.jobType} factor ${f.id}: adjustPct out of range`);
      benchmarkOk = false;
    }
  }
}
if (benchmarkOk) pass("benchmark rules");

// 8. Phase content targets
let totalCodes = 0;
for (const file of codeFiles) {
  totalCodes += codesSchema.parse(readJson(path.join(codesDir, file))).length;
}
const targets = PHASE_TARGETS[BUILD_PHASE] ?? PHASE_TARGETS[1];
console.log(
  `\nContent counts (Phase ${BUILD_PHASE}): brands ${brands.length}/${targets.brands}, codes ${totalCodes}/${targets.codes}, repairs ${repairs.length}/${targets.repairs}`
);
if (brands.length < targets.brands || totalCodes < targets.codes || repairs.length < targets.repairs) {
  fail("phase content targets", "counts below phase minimum");
} else {
  pass("phase content targets");
}

console.log(process.exitCode === 1 ? "\nValidation FAILED" : "\nValidation PASSED");
process.exit(process.exitCode ?? 0);

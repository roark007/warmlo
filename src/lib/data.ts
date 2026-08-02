import fs from "fs";
import path from "path";
import {
  brandsSchema,
  codesSchema,
  repairsSchema,
  quoteBenchmarksSchema,
  symptomsSchema,
  quoteIndexSchema,
  brandSourcesSchema,
  type Brand,
  type Code,
  type Repair,
  type Benchmark,
  type Symptom,
  type QuoteIndex,
  type BrandSource,
} from "./schemas";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getBrands(): Brand[] {
  const data = readJson<unknown>(path.join(DATA_DIR, "brands.json"));
  return brandsSchema.parse(data);
}

export function getCodesForBrand(brandSlug: string): Code[] {
  const filePath = path.join(DATA_DIR, "codes", `${brandSlug}.json`);
  const data = readJson<unknown>(filePath);
  return codesSchema.parse(data);
}

export function getAllCodes(): Array<{ brand: Brand; code: Code }> {
  const brands = getBrands();
  return brands.flatMap((brand) =>
    getCodesForBrand(brand.slug).map((code) => ({ brand, code }))
  );
}

export function isVerifiedCode(code: Code): boolean {
  return code.verificationStatus === "verified";
}

export function getVerifiedCodesForBrand(brandSlug: string): Code[] {
  return getCodesForBrand(brandSlug).filter(isVerifiedCode);
}

export function getAllVerifiedCodes(): Array<{ brand: Brand; code: Code }> {
  return getAllCodes().filter(({ code }) => isVerifiedCode(code));
}

export function getBrandSources(): BrandSource[] {
  const data = readJson<unknown>(path.join(DATA_DIR, "brand-sources.json"));
  return brandSourcesSchema.parse(data);
}

export function getSourcesForCode(code: Code): BrandSource[] {
  const sourceIds = new Set(code.sourceIds);
  return getBrandSources().filter((source) => sourceIds.has(source.id));
}

export function getRepairs(): Repair[] {
  const data = readJson<unknown>(path.join(DATA_DIR, "repairs.json"));
  return repairsSchema.parse(data);
}

export function getRepairBySlug(slug: string): Repair | undefined {
  return getRepairs().find((r) => r.slug === slug);
}

export function getBenchmarks(): { dataUpdated: string; benchmarks: Benchmark[] } {
  const data = readJson<unknown>(path.join(DATA_DIR, "quote-benchmarks.json"));
  return quoteBenchmarksSchema.parse(data);
}

export function getBenchmarkByJobType(jobType: string): Benchmark | undefined {
  return getBenchmarks().benchmarks.find((b) => b.jobType === jobType);
}

export function getCode(brandSlug: string, codeSlug: string): Code | undefined {
  return getCodesForBrand(brandSlug).find((c) => c.slug === codeSlug);
}

export function getBrand(slug: string): Brand | undefined {
  return getBrands().find((b) => b.slug === slug);
}

export function getRelatedCodes(
  brandSlug: string,
  currentCodeSlug: string,
  limit = 6
): Code[] {
  const codes = getVerifiedCodesForBrand(brandSlug).filter((c) => c.slug !== currentCodeSlug);
  return codes.slice(0, limit);
}

export function getCodesForRepair(repairSlug: string): Array<{ brand: Brand; code: Code }> {
  return getAllVerifiedCodes().filter(({ code }) => code.relatedRepairSlug === repairSlug);
}

export function getSymptoms(): Symptom[] {
  const data = readJson<unknown>(path.join(DATA_DIR, "symptoms.json"));
  return symptomsSchema.parse(data);
}

export function getSymptom(slug: string): Symptom | undefined {
  return getSymptoms().find((s) => s.slug === slug);
}

export function getSymptomsForCode(brandSlug: string, codeSlug: string): Symptom[] {
  return getSymptoms().filter((s) =>
    s.relatedCodes.some((ref) => ref.brand === brandSlug && ref.code === codeSlug)
  );
}

export function resolveSymptomCodeRef(ref: {
  brand: string;
  code: string;
}): { brand: Brand; code: Code } | null {
  const brand = getBrand(ref.brand);
  const code = getCode(ref.brand, ref.code);
  return brand && code && isVerifiedCode(code) ? { brand, code } : null;
}

export function getQuoteIndex(): QuoteIndex {
  const data = readJson<unknown>(path.join(DATA_DIR, "quote-index.json"));
  return quoteIndexSchema.parse(data);
}

export { formatDataUpdated } from "./format";

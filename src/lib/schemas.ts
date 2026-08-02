import { z } from "zod";

export const slugSchema = z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens");

export const severitySchema = z.enum(["diy-possible", "call-pro-soon", "emergency"]);
export const verificationStatusSchema = z.enum(["verified", "model-specific-unverified"]);

export const brandSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  logoNote: z.string(),
  codeFormat: z.string(),
  notes: z.string(),
});

export const brandsSchema = z.array(brandSchema);

export const snippetAnswerSchema = z
  .string()
  .min(1)
  .refine((s) => {
    const words = s.trim().split(/\s+/).filter(Boolean).length;
    return words >= 25 && words <= 45;
  }, "snippetAnswer must be 25–45 words");

export const codeSchema = z.object({
  code: z.string().min(1),
  slug: slugSchema,
  title: z.string().min(1),
  meaning: z.string().min(1),
  snippetAnswer: snippetAnswerSchema,
  severity: severitySchema,
  commonCauses: z.array(z.string()).min(2),
  diySteps: z.array(z.string()),
  whenToCallPro: z.string().min(1),
  repairCostLow: z.number().int().positive(),
  repairCostHigh: z.number().int().positive(),
  relatedRepairSlug: slugSchema,
  dangerNote: z.string().nullable(),
  flashPattern: z.string().nullable().optional(),
  verificationStatus: verificationStatusSchema,
  sourceIds: z.array(slugSchema).min(1),
  modelScope: z.string().min(1),
});

export const codesSchema = z.array(codeSchema);

export const brandSourceSchema = z.object({
  id: slugSchema,
  publisher: z.string().min(1),
  title: z.string().min(1),
  documentId: z.string().min(1),
  url: z.string().url(),
  brandSlugs: z.array(slugSchema).min(1),
  appliesTo: z.string().min(1),
});

export const brandSourcesSchema = z.array(brandSourceSchema);

export const diyDifficultySchema = z.enum(["easy", "moderate", "hard", "professional-only"]);

export const repairSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  costLow: z.number().int().positive(),
  costHigh: z.number().int().positive(),
  partCostLow: z.number().int().positive(),
  partCostHigh: z.number().int().positive(),
  laborHours: z.string(),
  description: z.string().min(1),
  diyDifficulty: diyDifficultySchema,
  signals: z.array(z.string()).min(1),
});

export const repairsSchema = z.array(repairSchema);

export const benchmarkFactorSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  adjustPct: z.number().int().min(1).max(100),
});

export const benchmarkSchema = z.object({
  jobType: slugSchema,
  label: z.string().min(1),
  fairLow: z.number().int().positive(),
  fairHigh: z.number().int().positive(),
  typicalMid: z.number().int().positive(),
  factors: z.array(benchmarkFactorSchema),
  redFlagAbovePct: z.number().int().min(1).max(100),
  notes: z.string(),
});

export const quoteBenchmarksSchema = z.object({
  dataUpdated: z.string().regex(/^\d{4}-\d{2}$/),
  benchmarks: z.array(benchmarkSchema).min(1),
});

export const likelihoodSchema = z.enum(["most common", "common", "possible"]);

export const symptomCauseSchema = z.object({
  cause: z.string().min(1),
  likelihood: likelihoodSchema,
  repairSlug: slugSchema,
});

export const symptomCodeRefSchema = z.object({
  brand: slugSchema,
  code: slugSchema,
});

export const symptomSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  snippetAnswer: snippetAnswerSchema,
  plainExplanation: z.string().min(1),
  likelyCauses: z.array(symptomCauseSchema).min(2),
  relatedCodes: z.array(symptomCodeRefSchema).min(2),
  checkFirst: z.array(z.string()),
  severityCeiling: severitySchema,
  dangerNote: z.string().nullable(),
});

export const symptomsSchema = z.array(symptomSchema);

export const quoteIndexDataStatusSchema = z.enum(["benchmark-only", "live", "insufficient"]);

export const quoteIndexJobSchema = z.object({
  jobType: slugSchema,
  label: z.string().min(1),
  fairLow: z.number().int().positive(),
  fairHigh: z.number().int().positive(),
  typicalMid: z.number().int().positive(),
  quoteCount: z.number().int().min(0),
  medianQuotedPrice: z.number().int().positive().nullable(),
  pctAboveFairRange: z.number().int().min(0).max(100).nullable(),
  dataStatus: quoteIndexDataStatusSchema,
  notes: z.string(),
});

export const quoteIndexMethodologySchema = z.object({
  overview: z.string().min(1),
  fairRangeMethod: z.string().min(1),
  aggregationMethod: z.string().min(1),
  citationGuidance: z.string().min(1),
});

export const quoteIndexSchema = z.object({
  dataUpdated: z.string().regex(/^\d{4}-\d{2}$/),
  generatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  methodologyVersion: z.string().min(1),
  minimumSampleSize: z.number().int().positive(),
  submissionStatsAvailable: z.boolean(),
  methodology: quoteIndexMethodologySchema,
  jobs: z.array(quoteIndexJobSchema).min(1),
});

export type Brand = z.infer<typeof brandSchema>;
export type Code = z.infer<typeof codeSchema>;
export type BrandSource = z.infer<typeof brandSourceSchema>;
export type Repair = z.infer<typeof repairSchema>;
export type Benchmark = z.infer<typeof benchmarkSchema>;
export type Severity = z.infer<typeof severitySchema>;
export type Symptom = z.infer<typeof symptomSchema>;
export type QuoteIndex = z.infer<typeof quoteIndexSchema>;
export type QuoteIndexJob = z.infer<typeof quoteIndexJobSchema>;
export type VerdictBucket = "suspiciously-low" | "fair" | "high" | "red-flag";

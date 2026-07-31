/**
 * Composes snippetAnswer for every code from existing validated fields only.
 * Run once during S1 backfill: npx tsx scripts/generate-snippet-answers.ts
 */
import fs from "fs";
import path from "path";
import { brandsSchema, type Code } from "../src/lib/schemas";

const DATA_DIR = path.join(process.cwd(), "data");

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function plainMeaning(code: Code): string {
  let text = code.meaning.replace(/\.$/, "").trim();
  if (text.startsWith("The ")) {
    text = text.slice(4);
    text = text.charAt(0).toLowerCase() + text.slice(1);
  }
  return text;
}

function formatCause(cause: string): string {
  return cause.replace(/^a /i, "").replace(/^an /i, "").replace(/^the /i, "").toLowerCase();
}

function costRange(code: Code): string {
  return `$${code.repairCostLow}–$${code.repairCostHigh}`;
}

function severityTail(code: Code): string {
  const cost = costRange(code);
  const cause = code.commonCauses[0] ? formatCause(code.commonCauses[0]) : null;

  if (code.severity === "emergency") {
    return `This is an emergency — do not attempt DIY repairs. Call a licensed technician immediately; typical repairs run ${cost}.`;
  }
  if (code.severity === "diy-possible") {
    if (cause) {
      return `Often caused by ${cause}. Usually safe to try basic checks yourself; professional repairs run ${cost}.`;
    }
    return `Usually safe to try basic checks yourself; professional repairs typically run ${cost}.`;
  }
  if (cause) {
    return `Most often from ${cause}. You can check basics first; professional repairs typically run ${cost}.`;
  }
  return `You can check basics first; professional repairs typically run ${cost}.`;
}

function composeSnippetAnswer(brandName: string, code: Code): string {
  const opener = `${brandName} furnace code ${code.code} means ${plainMeaning(code)}.`;
  let answer = `${opener} ${severityTail(code)}`;

  let words = wordCount(answer);
  if (words > 45) {
    const shortTail =
      code.severity === "emergency"
        ? `Emergency — call a licensed technician; repairs run ${costRange(code)}.`
        : `Pro repairs typically run ${costRange(code)}.`;
    answer = `${opener} ${shortTail}`;
    words = wordCount(answer);
  }

  if (words > 45) {
    answer = `${brandName} code ${code.code}: ${plainMeaning(code)}. Pro repairs run ${costRange(code)}.`;
  }

  if (wordCount(answer) < 25) {
    const extra = code.commonCauses[1] ? ` Other common causes include ${formatCause(code.commonCauses[1])}.` : "";
    answer = answer.replace(/\.$/, "") + extra + ".";
  }

  if (wordCount(answer) > 45) {
    throw new Error(`${brandName} ${code.code}: snippetAnswer exceeds 45 words (${wordCount(answer)})`);
  }
  if (wordCount(answer) < 25) {
    throw new Error(`${brandName} ${code.code}: snippetAnswer below 25 words (${wordCount(answer)})`);
  }
  if (!answer.toLowerCase().includes(brandName.toLowerCase())) {
    throw new Error(`${brandName} ${code.code}: missing brand name`);
  }
  if (!answer.toLowerCase().includes(code.code.toLowerCase())) {
    throw new Error(`${brandName} ${code.code}: missing code`);
  }

  return answer;
}

const brands = brandsSchema.parse(JSON.parse(fs.readFileSync(path.join(DATA_DIR, "brands.json"), "utf-8")));
let updated = 0;

for (const brand of brands) {
  const filePath = path.join(DATA_DIR, "codes", `${brand.slug}.json`);
  const codes = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Code[];
  const next = codes.map((code) => ({
    ...code,
    snippetAnswer: composeSnippetAnswer(brand.name, code),
  }));
  fs.writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`, "utf-8");
  updated += next.length;
  console.log(`Updated ${brand.slug}: ${next.length} codes`);
}

console.log(`\nDone — ${updated} snippetAnswer fields written.`);

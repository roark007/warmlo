/** Backfill flashPattern from code display field when it encodes a flash count. */
import fs from "fs";
import path from "path";
import { brandsSchema } from "../src/lib/schemas";

const DATA_DIR = path.join(process.cwd(), "data");

function toFlashPattern(code: string): string | null {
  const match = code.match(/^(\d+)\s+(Flashes?|Blinks?)$/i);
  if (!match) return null;
  const n = match[1];
  const unit = match[2].toLowerCase();
  const normalized = unit.startsWith("flash") ? (n === "1" ? "flash" : "flashes") : n === "1" ? "blink" : "blinks";
  return `${n} ${normalized}`;
}

const brands = brandsSchema.parse(JSON.parse(fs.readFileSync(path.join(DATA_DIR, "brands.json"), "utf-8")));
let updated = 0;

for (const brand of brands) {
  const filePath = path.join(DATA_DIR, "codes", `${brand.slug}.json`);
  const codes = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Array<Record<string, unknown>>;
  let changed = false;
  for (const entry of codes) {
    const pattern = toFlashPattern(String(entry.code));
    if (pattern) {
      if (entry.flashPattern !== pattern) {
        entry.flashPattern = pattern;
        changed = true;
        updated++;
      }
    }
  }
  if (changed) fs.writeFileSync(filePath, `${JSON.stringify(codes, null, 2)}\n`, "utf-8");
}

console.log(`Set flashPattern on ${updated} codes.`);

// One-shot: remap symptom relatedCodes after the ICP/Nordyne chart corrections,
// and add cross-links for the five new brands.
import { readFileSync, writeFileSync } from "node:fs";

const file = "data/symptoms.json";
const symptoms = JSON.parse(readFileSync(file, "utf8"));

const bySlug = Object.fromEntries(symptoms.map((s) => [s.slug, s]));

function replaceRef(slug, from, to) {
  const s = bySlug[slug];
  const ref = s.relatedCodes.find((r) => r.brand === from.brand && r.code === from.code);
  if (!ref) throw new Error(`${slug}: ref ${from.brand}/${from.code} not found`);
  if (to) {
    ref.brand = to.brand;
    ref.code = to.code;
  } else {
    s.relatedCodes = s.relatedCodes.filter((r) => r !== ref);
  }
}

function addRefs(slug, refs) {
  const s = bySlug[slug];
  for (const r of refs) {
    if (!s.relatedCodes.some((x) => x.brand === r.brand && x.code === r.code)) {
      s.relatedCodes.push(r);
    }
  }
}

// Old tempstar/heil chart meanings no longer apply — remap to the correct ICP codes.
replaceRef("furnace-clicks-but-wont-ignite", { brand: "tempstar", code: "1-flash" }, { brand: "tempstar", code: "6-flash" });
replaceRef("furnace-short-cycling", { brand: "tempstar", code: "3-flash" }, { brand: "tempstar", code: "4-flash" });
replaceRef("furnace-wont-stay-lit", { brand: "tempstar", code: "5-flash" }, { brand: "tempstar", code: "6-flash" });
replaceRef("furnace-wont-stay-lit", { brand: "heil", code: "5-flash" }, { brand: "heil", code: "6-flash" });
// Old 8-flash meant "inducer fault"; new 8-flash is gas lockout — unrelated to noise.
replaceRef("furnace-making-loud-noise", { brand: "tempstar", code: "8-flash" }, null);
replaceRef("furnace-blinking-red-light", { brand: "tempstar", code: "1-flash" }, { brand: "intertherm", code: "4-blinks" });
replaceRef("ac-frozen-coil", { brand: "tempstar", code: "3-flash" }, { brand: "tempstar", code: "4-flash" });
replaceRef("ac-short-cycling", { brand: "tempstar", code: "3-flash" }, { brand: "tempstar", code: "4-flash" });

// New-brand cross-links on high-intent symptom pages.
addRefs("furnace-3-flashes", [
  { brand: "comfortmaker", code: "3-flash" },
  { brand: "keeprite", code: "3-flash" },
]);
addRefs("furnace-4-flashes", [
  { brand: "comfortmaker", code: "4-flash" },
  { brand: "keeprite", code: "4-flash" },
  { brand: "day-and-night", code: "4-flash" },
]);
addRefs("furnace-clicks-but-wont-ignite", [
  { brand: "intertherm", code: "4-blinks" },
  { brand: "miller", code: "4-blinks" },
]);
addRefs("furnace-wont-stay-lit", [{ brand: "comfortmaker", code: "6-flash" }]);
addRefs("furnace-blinking-red-light", [{ brand: "miller", code: "4-blinks" }]);

writeFileSync(file, JSON.stringify(symptoms, null, 2) + "\n");
console.log("symptoms.json updated");

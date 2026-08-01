/**
 * One-time correction: realign Goodman/Amana/Daikin E-codes and flash codes
 * to GMVM97 / GM9S80 / standard IFC blink-code documentation.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data", "codes");

const E_CODES = [
  {
    code: "E0",
    slug: "e0",
    short: "Ignition Lockout",
    meaning:
      "The control locked out after too many failed ignition attempts or recycles and will not try again until reset.",
    severity: "call-pro-soon",
    commonCauses: [
      "Repeated ignition or flame-proving failures",
      "Dirty flame sensor after several short cycles",
      "Weak ignitor or intermittent gas supply",
    ],
    diySteps: [
      "Replace a dirty air filter.",
      "Confirm the gas supply valve is fully open.",
      "Turn off power for 60 seconds, then try one heat cycle.",
      "If E0 returns, stop resetting and call a technician.",
    ],
    whenToCallPro:
      "Lockout means an underlying ignition, flame-sensor, or gas-valve fault still needs diagnosis.",
    repairCostLow: 150,
    repairCostHigh: 450,
    relatedRepairSlug: "ignitor-replacement",
    dangerNote: null,
    snippet: (b) =>
      `${b} furnace code E0 means control locked out after too many failed ignition attempts or recycles. Most often from repeated ignition failures. You can check basics first; professional repairs typically run $150–$450.`,
  },
  {
    code: "E1",
    slug: "e1",
    short: "Pressure Switch Stuck Closed",
    meaning:
      "The low-stage pressure switch was closed when the control expected it to be open at the start of a heat cycle.",
    severity: "call-pro-soon",
    commonCauses: [
      "Stuck pressure switch diaphragm",
      "Water or debris in the pressure hose",
      "Blocked or restricted venting",
    ],
    diySteps: [
      "Turn off power.",
      "Inspect the vent pipe and intake for blockages.",
      "Check the pressure switch hose for water or kinks.",
      "Restore power and test once.",
    ],
    whenToCallPro:
      "If the switch stays closed with clear venting, the pressure switch or inducer needs professional testing.",
    repairCostLow: 175,
    repairCostHigh: 550,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippet: (b) =>
      `${b} furnace code E1 means low-stage pressure switch was closed when the control expected it open at startup. Most often from stuck pressure switch diaphragm. You can check basics first; professional repairs typically run $175–$550.`,
  },
  {
    code: "E2",
    slug: "e2",
    short: "Pressure Switch Stuck Open",
    meaning:
      "The low-stage pressure switch did not close during the inducer cycle, so ignition was blocked.",
    severity: "call-pro-soon",
    commonCauses: [
      "Blocked vent or combustion air intake",
      "Failed inducer motor",
      "Clogged condensate drain or trap",
    ],
    diySteps: [
      "Turn off power.",
      "Inspect the vent pipe and intake for blockages.",
      "Check the condensate drain for clogs.",
      "Verify the pressure switch hose is connected.",
    ],
    whenToCallPro:
      "If the inducer runs but the switch never closes, have the switch, inducer, and venting tested.",
    repairCostLow: 175,
    repairCostHigh: 900,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippet: (b) =>
      `${b} furnace code E2 means low-stage pressure switch did not close during the inducer cycle. Most often from blocked vent or intake. You can check basics first; professional repairs typically run $175–$900.`,
  },
  {
    code: "E3",
    slug: "e3",
    short: "Open High-Limit Switch",
    meaning:
      "The primary high-limit switch opened because the furnace overheated, usually from restricted airflow.",
    severity: "call-pro-soon",
    commonCauses: [
      "Clogged air filter restricting airflow",
      "Blocked or closed supply vents",
      "Failing blower motor or weak airflow",
    ],
    diySteps: [
      "Turn off the furnace at the switch.",
      "Check the air filter; replace if dirty.",
      "Open all supply vents.",
      "Allow the furnace to cool, then restore power.",
    ],
    whenToCallPro:
      "If the code returns after a filter change, the blower motor or limit switch likely needs service.",
    repairCostLow: 150,
    repairCostHigh: 600,
    relatedRepairSlug: "limit-switch-replacement",
    dangerNote: null,
    snippet: (b) =>
      `${b} furnace code E3 means primary high-limit switch opened because the furnace overheated. Most often from clogged air filter restricting airflow. You can check basics first; professional repairs typically run $150–$600.`,
  },
  {
    code: "E4",
    slug: "e4",
    short: "Flame Sensed Without Heat Call",
    meaning:
      "The control detected a flame signal when the gas valve should be closed and no heat was requested.",
    severity: "emergency",
    commonCauses: [
      "Gas valve leaking or slow to close",
      "Short in flame sensor wiring",
      "Lingering burner flame near the sensor",
    ],
    diySteps: [],
    whenToCallPro: "Unexpected flame signals require immediate professional inspection.",
    repairCostLow: 350,
    repairCostHigh: 900,
    relatedRepairSlug: "gas-valve-replacement",
    dangerNote: "If you smell gas, leave the house and call your gas utility before anything else.",
    snippet: (b) =>
      `${b} furnace code E4 means control detected flame when the gas valve should be closed. This is an emergency — do not attempt DIY repairs. Call a licensed technician immediately; typical repairs run $350–$900.`,
  },
  {
    code: "E5",
    slug: "e5",
    short: "Open Fuse",
    meaning:
      "The control detected an open 3-amp fuse on the integrated furnace control board.",
    severity: "call-pro-soon",
    commonCauses: [
      "Blown control-board fuse from a short",
      "Shorted low-voltage wiring",
      "Failed inducer or blower motor drawing excess current",
    ],
    diySteps: [
      "Turn off power at the breaker and furnace switch.",
      "Do not replace the fuse until the short cause is found.",
      "Inspect visible wiring for damage or moisture.",
    ],
    whenToCallPro:
      "A blown IFC fuse usually indicates a wiring or component fault that needs professional diagnosis.",
    repairCostLow: 150,
    repairCostHigh: 450,
    relatedRepairSlug: "control-board-replacement",
    dangerNote: null,
    snippet: (b) =>
      `${b} furnace code E5 means control detected an open 3-amp fuse on the furnace board. Most often from a short in low-voltage wiring. You can check basics first; professional repairs typically run $150–$450.`,
  },
  {
    code: "E6",
    slug: "e6",
    short: "Low Flame Signal",
    meaning:
      "The flame sensor signal was too weak for the control to prove stable combustion.",
    severity: "call-pro-soon",
    commonCauses: [
      "Dirty flame sensor rod",
      "Low gas pressure",
      "Partially clogged burner orifices",
    ],
    diySteps: [
      "Turn off power.",
      "Gently clean the flame sensor rod with fine steel wool.",
      "Confirm the gas valve is fully open.",
      "Run one test cycle after cleaning.",
    ],
    whenToCallPro:
      "Persistent low flame signals require gas pressure testing and burner inspection.",
    repairCostLow: 100,
    repairCostHigh: 400,
    relatedRepairSlug: "flame-sensor-cleaning",
    dangerNote: null,
    snippet: (b) =>
      `${b} furnace code E6 means flame sensor signal was too weak for the control to prove combustion. Most often from dirty flame sensor rod. You can check basics first; professional repairs typically run $100–$400.`,
  },
  {
    code: "E7",
    slug: "e7",
    short: "Igniter Fault",
    meaning:
      "The control detected an igniter circuit fault or improper grounding during ignition.",
    severity: "call-pro-soon",
    commonCauses: [
      "Cracked or failed hot-surface ignitor",
      "Loose ignitor connector",
      "Missing or poor equipment ground",
    ],
    diySteps: [
      "Turn off power.",
      "Inspect the ignitor for visible cracks.",
      "Check that the ignitor plug is seated firmly.",
      "Do not touch a hot ignitor.",
    ],
    whenToCallPro:
      "If the ignitor looks intact but the code persists, grounding or board output needs diagnosis.",
    repairCostLow: 150,
    repairCostHigh: 450,
    relatedRepairSlug: "ignitor-replacement",
    dangerNote: null,
    snippet: (b) =>
      `${b} furnace code E7 means control detected an igniter circuit fault or grounding problem. Most often from cracked hot-surface ignitor. You can check basics first; professional repairs typically run $150–$450.`,
  },
  {
    code: "E8",
    slug: "e8",
    short: "High-Stage Pressure Switch Stuck Closed",
    meaning:
      "The high-stage pressure switch was closed when the control expected it to be open at startup.",
    severity: "call-pro-soon",
    commonCauses: [
      "Stuck high-stage pressure switch",
      "Blocked vent on two-stage units",
      "Faulty inducer at high fire",
    ],
    diySteps: [
      "Turn off power.",
      "Inspect venting and the pressure switch hose.",
      "Clear condensate from the trap if present.",
    ],
    whenToCallPro:
      "Two-stage pressure switch faults require professional testing on high-fire operation.",
    repairCostLow: 175,
    repairCostHigh: 550,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippet: (b) =>
      `${b} furnace code E8 means high-stage pressure switch was closed when the control expected it open. Most often from stuck pressure switch diaphragm. You can check basics first; professional repairs typically run $175–$550.`,
  },
  {
    code: "E9",
    slug: "e9",
    short: "High-Stage Pressure Switch Stuck Open",
    meaning:
      "The high-stage pressure switch did not close when required during high-fire operation.",
    severity: "call-pro-soon",
    commonCauses: [
      "Blocked vent at high fire",
      "Failed high-stage pressure switch",
      "Inducer not reaching high-speed draft",
    ],
    diySteps: [
      "Turn off power.",
      "Inspect the vent pipe for blockages.",
      "Check the pressure switch hose for disconnects.",
    ],
    whenToCallPro:
      "High-stage venting and switch faults need professional diagnosis on two-stage furnaces.",
    repairCostLow: 175,
    repairCostHigh: 900,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippet: (b) =>
      `${b} furnace code E9 means high-stage pressure switch did not close during high-fire operation. Most often from blocked vent at high fire. You can check basics first; professional repairs typically run $175–$900.`,
  },
];

const FLASH_CODES = [
  {
    code: "1 Flash",
    slug: "1-flash",
    short: "Ignition Failure Lockout",
    meaning: "One LED flash indicates the furnace failed to establish flame during the ignition trial.",
    severity: "call-pro-soon",
    commonCauses: ["Worn ignitor", "Dirty flame sensor", "Gas supply issue"],
    diySteps: [
      "Verify the gas valve is open.",
      "Reset power and watch for ignitor glow.",
      "If glow occurs but no flame, stop and call for service.",
    ],
    whenToCallPro: "Repeated one-flash lockouts usually mean ignitor or gas valve service is needed.",
    repairCostLow: 150,
    repairCostHigh: 450,
    relatedRepairSlug: "ignitor-replacement",
    dangerNote: null,
    snippet: (b, c) =>
      `${b} furnace code ${c} means the furnace failed to establish flame during the ignition trial. Most often from worn ignitor. You can check basics first; professional repairs typically run $150–$450.`,
  },
  {
    code: "2 Flash",
    slug: "2-flash",
    short: "Pressure Switch Stuck Closed",
    meaning: "Two flashes mean the pressure switch remained closed when it should have opened.",
    severity: "call-pro-soon",
    commonCauses: ["Stuck pressure switch diaphragm", "Blocked vent", "Faulty inducer"],
    diySteps: [
      "Turn off power.",
      "Inspect venting for obstructions.",
      "Check the pressure switch hose for water or debris.",
    ],
    whenToCallPro: "A stuck-closed switch can prevent safe startup and needs professional testing.",
    repairCostLow: 175,
    repairCostHigh: 550,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippet: (b, c) =>
      `${b} furnace code ${c} means the pressure switch remained closed when it should have opened. Most often from stuck pressure switch diaphragm. You can check basics first; professional repairs typically run $175–$550.`,
  },
  {
    code: "3 Flash",
    slug: "3-flash",
    short: "Pressure Switch Stuck Open",
    meaning: "Three flashes indicate the pressure switch never closed during the inducer cycle.",
    severity: "call-pro-soon",
    commonCauses: ["Blocked vent or intake", "Failed inducer motor", "Disconnected pressure hose"],
    diySteps: [
      "Inspect the vent pipe and intake.",
      "Check the small hose to the pressure switch.",
      "Clear any condensate blockage in the trap.",
    ],
    whenToCallPro: "If the inducer runs but the switch never closes, replace the switch or inducer.",
    repairCostLow: 175,
    repairCostHigh: 900,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippet: (b, c) =>
      `${b} furnace code ${c} means the pressure switch never closed during the inducer cycle. Most often from blocked vent or intake. You can check basics first; professional repairs typically run $175–$900.`,
  },
  {
    code: "4 Flash",
    slug: "4-flash",
    short: "Open Limit Switch",
    meaning: "Four flashes signal the high-limit switch opened due to overheating.",
    severity: "call-pro-soon",
    commonCauses: ["Dirty air filter", "Closed vents", "Weak blower motor"],
    diySteps: [
      "Replace a dirty filter.",
      "Open all supply vents.",
      "Reset power after airflow is restored.",
    ],
    whenToCallPro: "If overheating continues, the limit switch or blower may need replacement.",
    repairCostLow: 150,
    repairCostHigh: 600,
    relatedRepairSlug: "limit-switch-replacement",
    dangerNote: null,
    snippet: (b, c) =>
      `${b} furnace code ${c} signals the high-limit switch opened due to overheating. Most often from dirty air filter. You can check basics first; professional repairs typically run $150–$600.`,
  },
  {
    code: "5 Flash",
    slug: "5-flash",
    short: "Flame Sensed Without Heat Call",
    meaning: "Five flashes mean the board detected flame when the thermostat was not calling for heat.",
    severity: "emergency",
    commonCauses: ["Leaking gas valve", "Stuck gas valve relay", "Control board fault"],
    diySteps: [],
    whenToCallPro: "Unexpected flame requires immediate professional inspection.",
    repairCostLow: 350,
    repairCostHigh: 900,
    relatedRepairSlug: "gas-valve-replacement",
    dangerNote: "If you smell gas, leave the house and call your gas utility before anything else.",
    snippet: (b, c) =>
      `${b} furnace code ${c} means the board detected flame when no heat was requested. This is an emergency — do not attempt DIY repairs. Call a licensed technician immediately; typical repairs run $350–$900.`,
  },
  {
    code: "6 Flash",
    slug: "6-flash",
    short: "Rollout Switch Open",
    meaning:
      "Six flashes indicate the flame rollout or auxiliary limit switch opened because heat or flame left the normal combustion area.",
    severity: "emergency",
    commonCauses: [
      "Cracked heat exchanger",
      "Blocked flue or vent",
      "Burner flame rollout",
    ],
    diySteps: [],
    whenToCallPro:
      "Rollout conditions involve combustion safety. Do not reset repeatedly without inspection.",
    repairCostLow: 500,
    repairCostHigh: 3500,
    relatedRepairSlug: "heat-exchanger-replacement",
    dangerNote:
      "If you smell gas or see soot around the furnace, leave the area and call a technician immediately.",
    snippet: (b, c) =>
      `${b} furnace code ${c} means the rollout or auxiliary limit switch opened. This is an emergency — do not attempt DIY repairs. Call a licensed technician immediately; typical repairs run $500–$3500.`,
  },
  {
    code: "7 Flash",
    slug: "7-flash",
    short: "Low Flame Signal",
    meaning: "Seven flashes indicate the flame signal dropped too low during operation.",
    severity: "call-pro-soon",
    commonCauses: ["Dirty flame sensor", "Low gas pressure", "Draft affecting flame"],
    diySteps: [
      "Clean the flame sensor carefully.",
      "Ensure return grilles are not blocked.",
      "Run one test cycle after cleaning.",
    ],
    whenToCallPro:
      "If the flame still drops out, gas pressure and venting should be checked professionally.",
    repairCostLow: 100,
    repairCostHigh: 400,
    relatedRepairSlug: "flame-sensor-cleaning",
    dangerNote: null,
    snippet: (b, c) =>
      `${b} furnace code ${c} means the flame signal dropped too low during operation. Most often from dirty flame sensor. You can check basics first; professional repairs typically run $100–$400.`,
  },
  {
    code: "8 Flash",
    slug: "8-flash",
    short: "Igniter Circuit Problem",
    meaning: "Eight flashes mean the ignitor circuit failed an internal board check.",
    severity: "call-pro-soon",
    commonCauses: ["Cracked ignitor", "Open ignitor wire", "Board relay failure"],
    diySteps: [
      "Turn off power before inspecting the ignitor.",
      "Look for cracks or white spots on the ignitor.",
      "Reseat the ignitor connector.",
    ],
    whenToCallPro:
      "Replace a visibly failed ignitor or call for board diagnosis if the ignitor looks fine.",
    repairCostLow: 150,
    repairCostHigh: 450,
    relatedRepairSlug: "ignitor-replacement",
    dangerNote: null,
    snippet: (b, c) =>
      `${b} furnace code ${c} means the ignitor circuit failed an internal board check. Most often from cracked ignitor. You can check basics first; professional repairs typically run $150–$450.`,
  },
];

function buildCode(brand, def) {
  const isFlash = def.slug.includes("flash");
  const displayCode = def.code;
  return {
    code: displayCode,
    slug: def.slug,
    title: `${brand} Furnace Code ${displayCode}: ${def.short}`,
    meaning: def.meaning,
    severity: def.severity,
    commonCauses: def.commonCauses,
    diySteps: def.diySteps,
    whenToCallPro: def.whenToCallPro,
    repairCostLow: def.repairCostLow,
    repairCostHigh: def.repairCostHigh,
    relatedRepairSlug: def.relatedRepairSlug,
    dangerNote: def.dangerNote,
    snippetAnswer: def.snippet(brand, displayCode),
    ...(isFlash
      ? {
          flashPattern:
            def.slug === "1-flash"
              ? "1 flash"
              : `${def.slug.replace("-flash", "")} flashes`,
        }
      : {}),
  };
}

function buildBrandFile(brandName, flashLimit = 8) {
  const eCodes = E_CODES.map((d) => buildCode(brandName, d));
  const flashCodes = FLASH_CODES.slice(0, flashLimit).map((d) => buildCode(brandName, d));
  return [...eCodes, ...flashCodes];
}

const goodman = buildBrandFile("Goodman", 8);
const amana = buildBrandFile("Amana", 5);
const daikin = buildBrandFile("Daikin", 8);

fs.writeFileSync(path.join(dataDir, "goodman.json"), JSON.stringify(goodman, null, 2) + "\n");
fs.writeFileSync(path.join(dataDir, "amana.json"), JSON.stringify(amana, null, 2) + "\n");
fs.writeFileSync(path.join(dataDir, "daikin.json"), JSON.stringify(daikin, null, 2) + "\n");

console.log(`goodman: ${goodman.length} codes`);
console.log(`amana: ${amana.length} codes`);
console.log(`daikin: ${daikin.length} codes`);

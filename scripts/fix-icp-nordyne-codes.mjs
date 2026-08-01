// One-shot accuracy fix (Jul 2026 audit):
// - ICP trio (Comfortmaker/Keeprite/Day & Night): remove undocumented "1 Flash",
//   rewrite "9 Flash" to the documented two-stage pressure switch fault.
// - Heil/Tempstar: replace legacy generic chart with the documented ICP chart.
// - Intertherm/Miller: replace fabricated 1-12 chart with the documented
//   Nordyne chart (1-5 on older M/G-series boards, 6-8 on newer integrated controls).
// Sources: ICP *9MAC troubleshooting guide (status codes 2-10), Nordyne M1M
// owner manual, Gibson KG6RA wiring diagram, Nordyne GL1RC service chart.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data", "codes");

function assertSnippet(brand, slug, s) {
  const words = s.trim().split(/\s+/).filter(Boolean).length;
  if (words < 25 || words > 45) {
    throw new Error(`${brand}/${slug}: snippetAnswer is ${words} words (need 25-45)`);
  }
}

function save(slug, codes) {
  for (const c of codes) assertSnippet(slug, c.slug, c.snippetAnswer);
  writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify(codes, null, 2) + "\n");
  console.log(`${slug}.json: ${codes.length} codes`);
}

// ---------- ICP trio: patch in place ----------
const nineFlash = (brandName) => ({
  code: "9 Flash",
  slug: "9-flash",
  title: `${brandName} Furnace Code 9 Flash: Two-Stage Pressure Switch Fault`,
  meaning:
    "Nine flashes mean the medium or high pressure switch (or its relay) did not close — or reopened — during an intermediate- or maximum-heat cycle on a two-stage or modulating furnace.",
  severity: "call-pro-soon",
  commonCauses: [
    "Blocked vent restricting high-fire draft",
    "Failed medium or high pressure switch",
    "Defective pressure switch relay on the control",
  ],
  diySteps: [
    "Check the vent and intake terminations outside for blockages.",
    "Drain the condensate trap on high-efficiency models.",
    "Note whether the code appears only when the furnace ramps to high heat.",
  ],
  whenToCallPro:
    "Two-stage pressure faults need switch testing at high fire — schedule service if venting is clear.",
  repairCostLow: 175,
  repairCostHigh: 550,
  relatedRepairSlug: "pressure-switch-replacement",
  dangerNote: null,
  snippetAnswer: `${brandName} furnace 9 flashes means the medium or high pressure switch did not close during a high-heat cycle — a two-stage model fault. Check the vent outside first; pro repairs run $175–$550.`,
  flashPattern: "9 flashes",
});

for (const [slug, brandName] of [
  ["comfortmaker", "Comfortmaker"],
  ["keeprite", "Keeprite"],
  ["day-and-night", "Day & Night"],
]) {
  const codes = JSON.parse(readFileSync(path.join(dir, `${slug}.json`), "utf8"));
  const kept = codes.filter((c) => c.slug !== "1-flash");
  const idx = kept.findIndex((c) => c.slug === "9-flash");
  if (idx === -1) throw new Error(`${slug}: 9-flash not found`);
  kept[idx] = nineFlash(brandName);
  save(slug, kept);
}

// ---------- Heil: documented ICP chart ----------
const heil = [
  {
    code: "2 Flash",
    slug: "2-flash",
    title: "Heil Furnace Code 2 Flash: Pressure Switch Did Not Open",
    meaning:
      "Two flashes mean the pressure switch stayed closed between heating cycles when the control expected it to open.",
    severity: "call-pro-soon",
    commonCauses: [
      "Pressure switch stuck closed",
      "Obstructed or waterlogged pressure tubing",
      "Inducer continuing to spin between cycles",
    ],
    diySteps: [
      "Turn off power at the furnace switch.",
      "Inspect the small rubber pressure hoses for kinks or trapped water.",
      "Restore power and watch one full heating cycle.",
    ],
    whenToCallPro:
      "If the tubing is clear and two flashes return, the pressure switch itself needs testing.",
    repairCostLow: 175,
    repairCostHigh: 550,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippetAnswer:
      "Heil furnace 2 flashes means the pressure switch did not open between cycles — usually a stuck switch or blocked pressure tubing. Power down, check the hoses, then call a pro; repairs run $175–$550.",
    flashPattern: "2 flashes",
  },
  {
    code: "3 Flash",
    slug: "3-flash",
    title: "Heil Furnace Code 3 Flash: Pressure Switch Did Not Close",
    meaning:
      "Three flashes mean the low pressure switch failed to close after the inducer started, or reopened during the heat cycle.",
    severity: "call-pro-soon",
    commonCauses: [
      "Blocked vent or combustion air intake",
      "Water in the vent piping or condensate trap",
      "Weak or failed inducer motor",
    ],
    diySteps: [
      "Check the outdoor vent termination for ice, snow, or debris.",
      "Clear the condensate trap and drain line.",
      "Reseat the pressure switch tubing on its nipples.",
    ],
    whenToCallPro:
      "If the inducer runs but the switch never closes, the switch or inducer needs professional testing.",
    repairCostLow: 175,
    repairCostHigh: 900,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippetAnswer:
      "Heil furnace 3 flashes means the pressure switch never closed after the inducer started — vent proof failed. Check the outside vent and condensate trap first; professional repairs run $175–$900.",
    flashPattern: "3 flashes",
  },
  {
    code: "4 Flash",
    slug: "4-flash",
    title: "Heil Furnace Code 4 Flash: Limit or Rollout Circuit Open",
    meaning:
      "Four flashes mean the high-limit or flame rollout switch opened — the furnace overheated or combustion escaped the burner area.",
    severity: "call-pro-soon",
    commonCauses: [
      "Dirty air filter restricting airflow",
      "Closed or blocked supply registers",
      "Tripped flame rollout switch",
    ],
    diySteps: [
      "Replace the air filter and open every supply vent.",
      "Let the furnace cool for 30 minutes before it retries.",
      "Never bypass a limit or rollout switch.",
    ],
    whenToCallPro:
      "A rollout trip or repeated limit trips after fixing airflow require combustion inspection.",
    repairCostLow: 150,
    repairCostHigh: 600,
    relatedRepairSlug: "limit-switch-replacement",
    dangerNote: null,
    snippetAnswer:
      "Heil furnace 4 flashes means the limit or rollout circuit opened — overheating from restricted airflow is the usual cause. Replace the filter first; limit or blower repairs run $150–$600.",
    flashPattern: "4 flashes",
  },
  {
    code: "5 Flash",
    slug: "5-flash",
    title: "Heil Furnace Code 5 Flash: Flame Sensed With Gas Valve Off",
    meaning:
      "Five flashes mean the board sees flame when the gas valve should be closed — an abnormal flame-proving signal.",
    severity: "emergency",
    commonCauses: [
      "Gas valve leaking or closing slowly",
      "Stuck gas valve relay on the board",
      "Shorted flame sensor wiring",
    ],
    diySteps: [],
    whenToCallPro:
      "Flame with the valve off is a serious fault — shut the furnace down and call a licensed technician.",
    repairCostLow: 350,
    repairCostHigh: 900,
    relatedRepairSlug: "gas-valve-replacement",
    dangerNote: "If you smell gas, leave the house and call your gas utility before anything else.",
    snippetAnswer:
      "Heil furnace 5 flashes means flame was detected while the gas valve should be off — a possible leaking valve. Treat as an emergency; shut the unit down and call a pro; repairs run $350–$900.",
    flashPattern: "5 flashes",
  },
  {
    code: "6 Flash",
    slug: "6-flash",
    title: "Heil Furnace Code 6 Flash: Ignition Proving Failure",
    meaning:
      "Six flashes mean the burners failed to prove flame after ignition, or the flame signal dropped out while the furnace was running.",
    severity: "call-pro-soon",
    commonCauses: [
      "Dirty or degraded flame sensor",
      "Failing hot-surface ignitor",
      "Rough ignition or low gas pressure",
    ],
    diySteps: [
      "Turn off power and gently clean the flame sensor rod.",
      "Watch one cycle for ignitor glow and smooth light-off.",
      "Reset power once after cleaning.",
    ],
    whenToCallPro:
      "If flame keeps dropping out after a sensor cleaning, ignitor and gas pressure need diagnosis.",
    repairCostLow: 150,
    repairCostHigh: 450,
    relatedRepairSlug: "ignitor-replacement",
    dangerNote: null,
    snippetAnswer:
      "Heil furnace 6 flashes means ignition failed to prove or flame was lost mid-cycle. A dirty flame sensor is the most common cause — clean it first; professional repairs run $150–$450.",
    flashPattern: "6 flashes",
  },
  {
    code: "7 Flash",
    slug: "7-flash",
    title: "Heil Furnace Code 7 Flash: Limit Circuit Lockout",
    meaning:
      "Seven flashes mean the limit or rollout switch stayed open long enough that the control locked out heating; it auto-resets after about three hours.",
    severity: "call-pro-soon",
    commonCauses: [
      "Repeated overheating from poor airflow",
      "Failed high-limit switch",
      "Blower moving too little air",
    ],
    diySteps: [
      "Replace the filter and open all registers.",
      "Wait for the three-hour auto-reset or cycle power once after cooling.",
      "Watch the next heat cycle closely.",
    ],
    whenToCallPro:
      "A limit lockout means overheating went unresolved — have the blower and limit switch inspected.",
    repairCostLow: 150,
    repairCostHigh: 600,
    relatedRepairSlug: "limit-switch-replacement",
    dangerNote: null,
    snippetAnswer:
      "Heil furnace 7 flashes is a limit circuit lockout — the limit stayed open too long and heating shut down. Restore airflow with a new filter, then call a pro if it returns; repairs run $150–$600.",
    flashPattern: "7 flashes",
  },
  {
    code: "8 Flash",
    slug: "8-flash",
    title: "Heil Furnace Code 8 Flash: Gas Heating Lockout",
    meaning:
      "Eight flashes mean the control locked out gas heating entirely and will not retry until it is reset.",
    severity: "emergency",
    commonCauses: [
      "Gas valve fault or miswire",
      "Failed relay on the control board",
      "Repeated unresolved ignition faults",
    ],
    diySteps: [],
    whenToCallPro:
      "Gas heating lockouts require licensed diagnosis of the gas valve and control board — do not keep resetting.",
    repairCostLow: 350,
    repairCostHigh: 900,
    relatedRepairSlug: "gas-valve-replacement",
    dangerNote: "If you smell gas, leave the house and call your gas utility before anything else.",
    snippetAnswer:
      "Heil furnace 8 flashes is a gas heating lockout — the board stopped all gas heat for safety and will not retry. Do not bypass anything; call a licensed technician; repairs run $350–$900.",
    flashPattern: "8 flashes",
  },
  {
    code: "9 Flash",
    slug: "9-flash",
    title: "Heil Furnace Code 9 Flash: Two-Stage Pressure Switch Fault",
    meaning:
      "Nine flashes mean the medium or high pressure switch (or its relay) did not close — or reopened — during a high-heat cycle on a two-stage or modulating furnace.",
    severity: "call-pro-soon",
    commonCauses: [
      "Vent restriction at high fire",
      "Failed medium or high pressure switch",
      "Defective pressure switch relay",
    ],
    diySteps: [
      "Inspect the vent and intake outside for blockages.",
      "Clear the condensate trap.",
      "Note whether the code only appears at high heat.",
    ],
    whenToCallPro:
      "High-fire pressure faults need switch testing under load — book service if venting checks out.",
    repairCostLow: 175,
    repairCostHigh: 550,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippetAnswer:
      "Heil furnace 9 flashes means a medium or high pressure switch fault on a two-stage model — the switch failed during high-heat operation. Check venting first; professional repairs run $175–$550.",
    flashPattern: "9 flashes",
  },
  {
    code: "10 Flash",
    slug: "10-flash",
    title: "Heil Furnace Code 10 Flash: Reversed Line Polarity",
    meaning:
      "Ten flashes mean the 115V hot and neutral wires are reversed at the furnace, or the transformer phasing is wrong on twinned units.",
    severity: "call-pro-soon",
    commonCauses: [
      "Hot and neutral swapped at the disconnect",
      "Missing or poor equipment ground",
      "Incorrect transformer phasing on twinned furnaces",
    ],
    diySteps: [
      "Turn power off at the breaker.",
      "Do not run the furnace until the wiring is verified.",
      "Have polarity and grounding checked before restoring service.",
    ],
    whenToCallPro:
      "Line-voltage polarity and grounding corrections belong to an electrician or HVAC technician.",
    repairCostLow: 150,
    repairCostHigh: 350,
    relatedRepairSlug: "control-board-replacement",
    dangerNote: null,
    snippetAnswer:
      "Heil furnace 10 flashes means reversed 115V polarity or a grounding problem at the furnace. Shut the power off and have the wiring corrected professionally — typical electrical fixes run $150–$350.",
    flashPattern: "10 flashes",
  },
];
save("heil", heil);

// ---------- Tempstar: same documented chart, distinct copy ----------
const tempstar = [
  {
    code: "2 Flash",
    slug: "2-flash",
    title: "Tempstar Furnace Code 2 Flash: Pressure Switch Stuck Closed",
    meaning:
      "Two flashes mean the pressure switch was still closed when the control expected it open between cycles.",
    severity: "call-pro-soon",
    commonCauses: [
      "Stuck pressure switch diaphragm",
      "Water or kinks in the pressure tubing",
      "Inducer coasting between cycles",
    ],
    diySteps: [
      "Kill power at the furnace switch.",
      "Look for standing water in the pressure hoses and trap.",
      "Power back up and observe a full cycle.",
    ],
    whenToCallPro:
      "A switch that reads closed with the inducer off has failed and should be replaced.",
    repairCostLow: 175,
    repairCostHigh: 550,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippetAnswer:
      "Tempstar furnace 2 flashes means the pressure switch stayed closed when it should have opened. Water in the tubing or a stuck switch is typical — check hoses first; repairs run $175–$550.",
    flashPattern: "2 flashes",
  },
  {
    code: "3 Flash",
    slug: "3-flash",
    title: "Tempstar Furnace Code 3 Flash: Pressure Switch Did Not Close",
    meaning:
      "Three flashes mean the low pressure switch never closed after the inducer started, or it reopened mid-cycle.",
    severity: "call-pro-soon",
    commonCauses: [
      "Blocked exhaust vent or air intake",
      "Sagging vent pipe holding water",
      "Failing inducer motor",
    ],
    diySteps: [
      "Walk outside and clear the vent termination.",
      "Empty the condensate trap on condensing models.",
      "Confirm the pressure hose is attached at both ends.",
    ],
    whenToCallPro:
      "When the inducer runs and the code persists, the switch or inducer needs bench testing.",
    repairCostLow: 175,
    repairCostHigh: 900,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippetAnswer:
      "Tempstar furnace 3 flashes means the pressure switch would not close after the inducer started. Blocked vents and clogged condensate traps cause most cases; professional repairs run $175–$900.",
    flashPattern: "3 flashes",
  },
  {
    code: "4 Flash",
    slug: "4-flash",
    title: "Tempstar Furnace Code 4 Flash: Limit or Rollout Circuit Open",
    meaning:
      "Four flashes mean the high-limit switch or flame rollout switch opened from overheating or flame escaping the burner box.",
    severity: "call-pro-soon",
    commonCauses: [
      "Clogged air filter",
      "Blocked return or closed supply vents",
      "Rollout switch tripped by restricted venting",
    ],
    diySteps: [
      "Swap in a fresh filter and open all vents.",
      "Give the furnace 30 minutes to cool and retry.",
      "Leave rollout switches alone — they require manual reset by a pro if tripped.",
    ],
    whenToCallPro:
      "If four flashes come back after airflow is restored, the limit circuit or blower needs service.",
    repairCostLow: 150,
    repairCostHigh: 600,
    relatedRepairSlug: "limit-switch-replacement",
    dangerNote: null,
    snippetAnswer:
      "Tempstar furnace 4 flashes signals an open limit or rollout switch — the furnace ran too hot. A fresh air filter fixes many cases; limit and blower repairs run $150–$600.",
    flashPattern: "4 flashes",
  },
  {
    code: "5 Flash",
    slug: "5-flash",
    title: "Tempstar Furnace Code 5 Flash: Flame Sensed With Gas Valve Off",
    meaning:
      "Five flashes mean flame is being sensed while the gas valve is supposed to be closed.",
    severity: "emergency",
    commonCauses: [
      "Leaking or slow-closing gas valve",
      "Welded gas valve relay contact",
      "Flame sensor circuit short",
    ],
    diySteps: [],
    whenToCallPro:
      "Any flame signal with the valve off demands immediate professional attention — stop using the furnace.",
    repairCostLow: 350,
    repairCostHigh: 900,
    relatedRepairSlug: "gas-valve-replacement",
    dangerNote: "If you smell gas, leave the house and call your gas utility before anything else.",
    snippetAnswer:
      "Tempstar furnace 5 flashes means flame was sensed with the gas valve commanded off — possibly a leaking valve. This is an emergency: stop the furnace and call a licensed tech; repairs run $350–$900.",
    flashPattern: "5 flashes",
  },
  {
    code: "6 Flash",
    slug: "6-flash",
    title: "Tempstar Furnace Code 6 Flash: Ignition Proving Failure",
    meaning:
      "Six flashes mean the control could not prove flame after ignition, or lost the flame signal during the run cycle.",
    severity: "call-pro-soon",
    commonCauses: [
      "Oxidized flame sensor rod",
      "Weak hot-surface ignitor",
      "Low gas pressure or rough light-off",
    ],
    diySteps: [
      "Power down and clean the flame sensor with fine abrasive.",
      "Watch the ignitor glow through one cycle.",
      "Cycle power once and retest.",
    ],
    whenToCallPro:
      "Persistent proving failures after cleaning point to the ignitor or gas supply — book service.",
    repairCostLow: 150,
    repairCostHigh: 450,
    relatedRepairSlug: "ignitor-replacement",
    dangerNote: null,
    snippetAnswer:
      "Tempstar furnace 6 flashes means the flame never proved after ignition or dropped out while running. Clean the flame sensor rod first — it fixes most cases; repairs run $150–$450.",
    flashPattern: "6 flashes",
  },
  {
    code: "7 Flash",
    slug: "7-flash",
    title: "Tempstar Furnace Code 7 Flash: Limit Circuit Lockout",
    meaning:
      "Seven flashes mean the limit or rollout stayed open past the allowed time and the control locked heating out; it auto-resets after roughly three hours.",
    severity: "call-pro-soon",
    commonCauses: [
      "Chronic overheating from airflow problems",
      "Failed limit switch",
      "Undersized or dirty blower",
    ],
    diySteps: [
      "Fix airflow basics: new filter, open registers.",
      "Allow the auto-reset or one power cycle after cooldown.",
      "Monitor the following heat cycle.",
    ],
    whenToCallPro:
      "Lockouts mean the overheating never resolved — get the blower and limit circuit inspected.",
    repairCostLow: 150,
    repairCostHigh: 600,
    relatedRepairSlug: "limit-switch-replacement",
    dangerNote: null,
    snippetAnswer:
      "Tempstar furnace 7 flashes is a limit lockout after prolonged overheating — heat is disabled until reset. Restore airflow, wait out the auto-reset, and call a pro if it repeats; repairs run $150–$600.",
    flashPattern: "7 flashes",
  },
  {
    code: "8 Flash",
    slug: "8-flash",
    title: "Tempstar Furnace Code 8 Flash: Gas Heating Lockout",
    meaning:
      "Eight flashes mean the control shut down gas heating completely and requires a reset before it will try again.",
    severity: "emergency",
    commonCauses: [
      "Faulty or miswired gas valve",
      "Control board relay failure",
      "Accumulated ignition safety faults",
    ],
    diySteps: [],
    whenToCallPro:
      "Never keep resetting a gas heating lockout — the gas valve and board need licensed diagnosis.",
    repairCostLow: 350,
    repairCostHigh: 900,
    relatedRepairSlug: "gas-valve-replacement",
    dangerNote: "If you smell gas, leave the house and call your gas utility before anything else.",
    snippetAnswer:
      "Tempstar furnace 8 flashes is a hard gas heating lockout — the board disabled gas heat for safety. Repeated resets are dangerous; have a licensed technician diagnose it; repairs run $350–$900.",
    flashPattern: "8 flashes",
  },
  {
    code: "9 Flash",
    slug: "9-flash",
    title: "Tempstar Furnace Code 9 Flash: Two-Stage Pressure Switch Fault",
    meaning:
      "Nine flashes mean the medium or high pressure switch (or its relay) failed to close or reopened while the furnace ran at intermediate or maximum heat.",
    severity: "call-pro-soon",
    commonCauses: [
      "High-fire vent restriction",
      "Out-of-calibration high pressure switch",
      "Bad pressure switch relay",
    ],
    diySteps: [
      "Check outdoor vent and intake pipes for obstructions.",
      "Clear the condensate trap.",
      "Note if the fault only shows at full heat output.",
    ],
    whenToCallPro:
      "Two-stage switch faults require testing under high fire — schedule a technician if vents are clear.",
    repairCostLow: 175,
    repairCostHigh: 550,
    relatedRepairSlug: "pressure-switch-replacement",
    dangerNote: null,
    snippetAnswer:
      "Tempstar furnace 9 flashes points to a medium or high pressure switch fault on two-stage models — venting failed at high heat. Check the vent outside, then book service; repairs run $175–$550.",
    flashPattern: "9 flashes",
  },
  {
    code: "10 Flash",
    slug: "10-flash",
    title: "Tempstar Furnace Code 10 Flash: Reversed Line Polarity",
    meaning:
      "Ten flashes mean the 115V supply polarity is reversed or grounding is faulty; on twinned units it can also mean wrong transformer phasing.",
    severity: "call-pro-soon",
    commonCauses: [
      "Hot and neutral reversed at the service switch",
      "Open or poor equipment ground",
      "Transformer phasing mismatch on twinned units",
    ],
    diySteps: [
      "Shut off the breaker feeding the furnace.",
      "Do not operate the unit until polarity is verified.",
      "Have grounding checked at the same visit.",
    ],
    whenToCallPro:
      "Polarity and ground corrections are electrician work — quick to fix, unsafe to ignore.",
    repairCostLow: 150,
    repairCostHigh: 350,
    relatedRepairSlug: "control-board-replacement",
    dangerNote: null,
    snippetAnswer:
      "Tempstar furnace 10 flashes means reversed 115V polarity or a bad ground feeding the furnace. Turn the breaker off and have an electrician or HVAC tech correct the wiring; fixes run $150–$350.",
    flashPattern: "10 flashes",
  },
];
save("tempstar", tempstar);

// ---------- Nordyne chart for Intertherm / Miller ----------
function nordyne(brandName, home) {
  return [
    {
      code: "1 Blink",
      slug: "1-blink",
      title: `${brandName} Furnace Code 1 Blink: Limit Switch Open`,
      meaning:
        "One blink on Nordyne-built control boards means the limit switch is open — the furnace overheated. Blink charts vary slightly by series, so confirm against the chart inside your blower door.",
      severity: "call-pro-soon",
      commonCauses: ["Clogged air filter", "Weak blower airflow", "Closed supply registers"],
      diySteps: [
        "Replace the air filter.",
        "Open every supply vent.",
        "Let the furnace cool 30 minutes, then reset power once.",
      ],
      whenToCallPro: "Repeated limit trips need blower and limit switch service.",
      repairCostLow: 150,
      repairCostHigh: 600,
      relatedRepairSlug: "limit-switch-replacement",
      dangerNote: null,
      snippetAnswer: `${brandName} furnace 1 blink means the limit switch opened from overheating — common in ${home} when airflow is restricted. Change the filter first; professional repairs run $150–$600.`,
      flashPattern: "1 blink",
    },
    {
      code: "2 Blinks",
      slug: "2-blinks",
      title: `${brandName} Furnace Code 2 Blinks: Pressure Switch Stuck Open`,
      meaning:
        "Two blinks mean the pressure switch stayed open with the inducer running — the board could not prove venting. Verify against the blink chart inside your unit's door.",
      severity: "call-pro-soon",
      commonCauses: [
        "Blocked roof jack or vent cap",
        "Failed inducer or air-proving switch",
        "Disconnected pressure hose",
      ],
      diySteps: [
        "Clear the roof vent or vent cap outside.",
        "Check that both pressure hoses are attached.",
        "Confirm the inducer actually spins on a heat call.",
      ],
      whenToCallPro:
        "If the inducer runs and the code stays, the air-proving switch has likely failed — a common part on these units.",
      repairCostLow: 175,
      repairCostHigh: 900,
      relatedRepairSlug: "pressure-switch-replacement",
      dangerNote: null,
      snippetAnswer: `${brandName} furnace 2 blinks means the pressure switch stayed open with the inducer on — venting was never proven. Clear the roof vent first; switch or inducer repairs run $175–$900.`,
      flashPattern: "2 blinks",
    },
    {
      code: "3 Blinks",
      slug: "3-blinks",
      title: `${brandName} Furnace Code 3 Blinks: Pressure Switch Stuck Closed`,
      meaning:
        "Three blinks mean the pressure switch reads closed while the inducer is off — the control sees vent pressure that should not exist. Confirm on your door chart, as codes vary by series.",
      severity: "call-pro-soon",
      commonCauses: [
        "Stuck pressure switch diaphragm",
        "Water trapped in the pressure hose",
        "Miswired switch circuit",
      ],
      diySteps: [
        "Turn off power.",
        "Drain any water from the pressure tubing.",
        "Restore power and watch one cycle.",
      ],
      whenToCallPro: "A switch stuck closed with the inducer off needs replacement.",
      repairCostLow: 175,
      repairCostHigh: 550,
      relatedRepairSlug: "pressure-switch-replacement",
      dangerNote: null,
      snippetAnswer: `${brandName} furnace 3 blinks means the pressure switch is stuck closed before the inducer starts. Water in the hose or a failed switch is typical; professional repairs run $175–$550.`,
      flashPattern: "3 blinks",
    },
    {
      code: "4 Blinks",
      slug: "4-blinks",
      title: `${brandName} Furnace Code 4 Blinks: Ignition Failure Lockout`,
      meaning:
        "Four blinks on most Nordyne-built boards mean the furnace locked out after failed ignition attempts. Some newer boards use four blinks for an open limit instead — check your door chart.",
      severity: "call-pro-soon",
      commonCauses: [
        "Cracked or weak hot-surface ignitor",
        "Dirty flame sensor",
        "Poor ground connection to the burner",
      ],
      diySteps: [
        "Confirm the gas valve is on.",
        "Clean the flame sensor rod gently.",
        "Reset power once and watch for ignitor glow.",
      ],
      whenToCallPro:
        "Repeated ignition lockouts usually need an ignitor, sensor, or grounding repair.",
      repairCostLow: 150,
      repairCostHigh: 450,
      relatedRepairSlug: "ignitor-replacement",
      dangerNote: null,
      snippetAnswer: `${brandName} furnace 4 blinks means an ignition failure lockout — the burners tried and failed to light. Check gas supply and the flame sensor first; ignition repairs run $150–$450.`,
      flashPattern: "4 blinks",
    },
    {
      code: "5 Blinks",
      slug: "5-blinks",
      title: `${brandName} Furnace Code 5 Blinks: Reversed Polarity or No Ground`,
      meaning:
        "Five blinks on older M-Series and G-Series boards mean the 115V hot and neutral are reversed or the ground is missing. Some newer boards use five blinks for flame sensed with the gas valve off — verify on your door chart.",
      severity: "call-pro-soon",
      commonCauses: [
        "Hot and neutral swapped at the disconnect",
        "Missing equipment ground",
        "Aging aluminum wiring in older ${home}".replace("${home}", home),
      ],
      diySteps: [
        "Turn off the breaker feeding the furnace.",
        "Do not run the unit until wiring polarity is verified.",
        "Have grounding checked at the same time.",
      ],
      whenToCallPro: "Line-voltage polarity fixes belong to an electrician or HVAC technician.",
      repairCostLow: 150,
      repairCostHigh: 350,
      relatedRepairSlug: "control-board-replacement",
      dangerNote: null,
      snippetAnswer: `${brandName} furnace 5 blinks usually means reversed 115V polarity or a missing ground on older Nordyne boards. Shut off power and have the wiring verified; corrections run $150–$350.`,
      flashPattern: "5 blinks",
    },
    {
      code: "6 Blinks",
      slug: "6-blinks",
      title: `${brandName} Furnace Code 6 Blinks: Line Polarity or Ground Fault`,
      meaning:
        "Six blinks on newer Nordyne integrated controls mean reversed 115V polarity, an open ground, or low supply voltage — an electrical supply problem, not a board failure.",
      severity: "call-pro-soon",
      commonCauses: [
        "Reversed hot and neutral wires",
        "Open or corroded ground connection",
        "Low line voltage at the furnace",
      ],
      diySteps: [
        "Switch off the furnace breaker.",
        "Look for obvious loose wiring at the service switch — do not touch live wires.",
        "Wait for a professional wiring check before running the furnace.",
      ],
      whenToCallPro: "Polarity and ground faults are quick professional fixes but unsafe to ignore.",
      repairCostLow: 150,
      repairCostHigh: 350,
      relatedRepairSlug: "control-board-replacement",
      dangerNote: null,
      snippetAnswer: `${brandName} furnace 6 blinks means a line polarity or grounding fault on newer control boards — the electrical supply is wired wrong. Have polarity and ground corrected; fixes run $150–$350.`,
      flashPattern: "6 blinks",
    },
    {
      code: "7 Blinks",
      slug: "7-blinks",
      title: `${brandName} Furnace Code 7 Blinks: Gas Valve Circuit Error`,
      meaning:
        "Seven blinks mean the control detected a gas valve circuit error — the valve is energized when it should not be, or its wiring failed a check.",
      severity: "emergency",
      commonCauses: [
        "Failed gas valve coil",
        "Miswired valve harness",
        "Stuck relay on the control board",
      ],
      diySteps: [],
      whenToCallPro:
        "Gas valve circuit faults require licensed diagnosis — do not keep cycling the furnace.",
      repairCostLow: 350,
      repairCostHigh: 900,
      relatedRepairSlug: "gas-valve-replacement",
      dangerNote: "If you smell gas, leave the house and call your gas utility before anything else.",
      snippetAnswer: `${brandName} furnace 7 blinks is a gas valve circuit error — a safety-critical fault on gas furnaces. Stop the unit and call a licensed technician; valve repairs run $350–$900.`,
      flashPattern: "7 blinks",
    },
    {
      code: "8 Blinks",
      slug: "8-blinks",
      title: `${brandName} Furnace Code 8 Blinks: Weak Flame Signal`,
      meaning:
        "Eight blinks on newer Nordyne integrated controls mean the flame sensor signal is too weak — the flame is burning but barely registering.",
      severity: "diy-possible",
      commonCauses: [
        "Oxidized flame sensor rod",
        "Slightly lifted or lazy flame",
        "Poor burner ground",
      ],
      diySteps: [
        "Turn off power and gas.",
        "Clean the flame sensor rod with fine abrasive pad.",
        "Reassemble and run one heat cycle.",
      ],
      whenToCallPro:
        "If cleaning does not restore a steady signal, gas pressure and grounding need a professional check.",
      repairCostLow: 100,
      repairCostHigh: 300,
      relatedRepairSlug: "flame-sensor-cleaning",
      dangerNote: null,
      snippetAnswer: `${brandName} furnace 8 blinks means a weak flame sensor signal — flame exists but barely registers. Cleaning the sensor rod fixes most cases yourself; professional service runs $100–$300.`,
      flashPattern: "8 blinks",
    },
  ];
}

save("intertherm", nordyne("Intertherm", "manufactured homes"));
save("miller", nordyne("Miller", "mobile homes"));

console.log("done");

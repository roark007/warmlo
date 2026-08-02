import fs from "node:fs";
import path from "node:path";

const codesDir = path.join(process.cwd(), "data", "codes");

const sourceByBrand = {
  goodman: "goodman-rs6621301",
  amana: "goodman-rs6621301",
  daikin: "goodman-rs6621301",
  carrier: "carrier-58-3t",
  bryant: "carrier-58-3t",
  payne: "carrier-58-3t",
  lennox: "lennox-508001-02d",
  "armstrong-air": "armstrong-product-literature",
  trane: "trane-furnace-light-guidance",
  "american-standard": "trane-furnace-light-guidance",
  rheem: "rheem-rgfg-92-24161-104-06",
  ruud: "rheem-rgfg-92-24161-104-06",
  york: "jci-272441-uim-e-0513",
  luxaire: "jci-272441-uim-e-0513",
  coleman: "jci-272441-uim-e-0513",
  comfortmaker: "icp-44001202103",
  "day-and-night": "icp-44001202103",
  heil: "icp-44001202103",
  keeprite: "icp-44001202103",
  tempstar: "icp-44001202103",
  intertherm: "nortek-1041594d",
  miller: "nortek-1041594d",
};

const scopes = {
  goodmanE: "AR9S/GR9S and matching Daikin DR-series single-stage controls that display this E-code.",
  goodmanFlash: "DM80HS-style integrated controls using the documented 1–8 flash chart.",
  carrier: "Carrier-family two-stage controls covered by troubleshooting guide 58-3T.",
  lennox: "Lennox integrated controls covered by installation instructions 508001-02D.",
  rheem: "Rheem/Ruud RGFG-family controls using the documented two-digit diagnostic table.",
  jci: "Johnson Controls integrated furnace controls using the documented 1–12 red-flash table.",
  icp: "ICP control boards covered by document 44001202103 and using its 2–10 flash table.",
  nortek: "Nortek single-stage condensing furnaces using the documented Emerson integrated control.",
};

const templates = {
  ignition: {
    short: "Ignition or flame-proving failure",
    severity: "call-pro-soon",
    causes: ["No gas reaching the burners", "A failed hot-surface igniter", "A dirty or weak flame sensor"],
    steps: ["Confirm the thermostat is calling for heat and the gas shutoff has not been moved.", "Turn furnace power off for five minutes, restore it once, and note whether the same code returns."],
    call: "Call a licensed technician if ignition fails again after one reset or if you smell gas.",
    low: 150, high: 750, repair: "ignitor-replacement", danger: null,
  },
  pressureOpen: {
    short: "Pressure-switch circuit did not close",
    severity: "call-pro-soon",
    causes: ["A blocked intake or exhaust vent", "A restricted condensate drain or pressure hose", "A weak inducer motor or pressure switch"],
    steps: ["With the furnace off, check outdoor intake and exhaust openings for snow, ice, leaves, or nests.", "Replace a visibly dirty air filter, restore power once, and note whether the code returns."],
    call: "Call a technician if the vent is clear and the pressure-switch code returns; combustion-air testing requires instruments.",
    low: 175, high: 900, repair: "pressure-switch-replacement", danger: null,
  },
  pressureClosed: {
    short: "Pressure switch was closed at the wrong time",
    severity: "call-pro-soon",
    causes: ["A pressure switch stuck closed", "A pinched or incorrectly connected pressure hose", "Shorted pressure-switch wiring or a control fault"],
    steps: ["Turn furnace power off for five minutes and do not bypass or jumper the pressure switch.", "Check only the outdoor vent openings for obvious snow, ice, leaves, or nests before restoring power once."],
    call: "Call a technician if the code returns; the switch, hose, wiring, and inducer draft need testing.",
    low: 175, high: 650, repair: "pressure-switch-replacement", danger: null,
  },
  limit: {
    short: "Limit circuit opened",
    severity: "call-pro-soon",
    causes: ["A dirty or overly restrictive air filter", "Closed or blocked supply and return vents", "A blower, limit switch, or airflow problem"],
    steps: ["Turn the furnace off and replace a dirty filter with the size and type specified for the system.", "Open all supply registers and make sure return grilles are not blocked before trying one reset."],
    call: "Call a technician if the limit code returns; repeated overheating can damage the furnace.",
    low: 150, high: 750, repair: "limit-switch-replacement", danger: null,
  },
  rollout: {
    short: "Flame-rollout safety lockout",
    severity: "emergency",
    causes: ["A blocked flue or combustion-air path", "A burner or gas-pressure problem", "A damaged or restricted heat exchanger"],
    steps: [],
    call: "Leave the furnace off and call a licensed technician for a combustion-safety inspection.",
    low: 500, high: 3500, repair: "heat-exchanger-replacement",
    danger: "Keep the furnace off. Do not reset a rollout switch. If you smell gas or a carbon-monoxide alarm sounds, leave the building and contact emergency services or the gas utility.",
  },
  unexpectedFlame: {
    short: "Flame detected when the gas valve should be off",
    severity: "emergency",
    causes: ["A gas valve leaking or stuck open", "A shorted flame-sensing circuit", "A failed integrated control board"],
    steps: [],
    call: "Turn the furnace off and call a licensed technician immediately to test the gas valve and flame-proving circuit.",
    low: 300, high: 1000, repair: "gas-valve-replacement",
    danger: "Turn the furnace off and do not reset it. If you smell gas, leave the building without operating switches and contact the gas utility or emergency services from outside.",
  },
  fuse: {
    short: "Low-voltage fuse is open",
    severity: "call-pro-soon",
    causes: ["Shorted thermostat wiring", "A shorted low-voltage accessory", "A damaged control-board circuit"],
    steps: ["Turn furnace power off and check for an obviously pinched thermostat wire without touching board terminals.", "Do not install a larger fuse or repeatedly replace a fuse that opens again."],
    call: "Call a technician to locate the low-voltage short before replacing the fuse again.",
    low: 150, high: 600, repair: "control-board-replacement", danger: null,
  },
  lowFlame: {
    short: "Low flame-sensor signal",
    severity: "call-pro-soon",
    causes: ["A dirty flame sensor", "Poor furnace grounding or reversed polarity", "Low gas pressure or an unstable burner flame"],
    steps: ["Turn furnace power off and confirm its access panel is fully seated.", "Try one reset and note whether the burners light briefly before shutting off."],
    call: "Call a technician if flame drops out again; flame current and combustion should be measured.",
    low: 100, high: 400, repair: "flame-sensor-cleaning", danger: null,
  },
  igniter: {
    short: "Igniter circuit fault",
    severity: "call-pro-soon",
    causes: ["A cracked or open hot-surface igniter", "Loose or damaged igniter wiring", "A failed igniter relay on the control board"],
    steps: ["Turn power off and look through the burner-viewing area for an obviously cracked igniter without touching it.", "Restore power once and observe whether the igniter glows; do not continue resetting the furnace."],
    call: "Call a technician if the igniter does not glow or the fault returns.",
    low: 150, high: 500, repair: "ignitor-replacement", danger: null,
  },
  flameLoss: {
    short: "Flame was lost during operation",
    severity: "call-pro-soon",
    causes: ["A dirty or weak flame sensor", "Unstable gas pressure or burner flame", "Poor grounding or flame-sensor wiring"],
    steps: ["Confirm the gas shutoff has not been moved and the furnace panel is fully seated.", "Try one reset and watch whether the burners light and then shut off again."],
    call: "Call a technician if flame drops out again or ignition becomes delayed or noisy.",
    low: 100, high: 600, repair: "flame-sensor-cleaning", danger: null,
  },
  blower: {
    short: "Indoor blower communication or operation fault",
    severity: "call-pro-soon",
    causes: ["Loss of power or communication to the blower motor", "A failed ECM motor module", "Damaged motor wiring or an incorrect control configuration"],
    steps: ["Turn furnace power off and replace a visibly dirty filter.", "Restore power once and listen for the indoor blower; do not reach into the blower compartment."],
    call: "Call a technician if the blower does not run or the communication fault returns.",
    low: 350, high: 1400, repair: "blower-motor-replacement", danger: null,
  },
  board: {
    short: "Integrated control fault",
    severity: "call-pro-soon",
    causes: ["A failed control-board relay or sensing circuit", "Damaged low-voltage wiring", "Electrical surge, moisture, or poor grounding"],
    steps: ["Turn furnace power off for five minutes and restore it once.", "If the code returns, leave the furnace off rather than repeatedly resetting the control."],
    call: "Call a technician to test wiring and connected components before replacing the control board.",
    low: 400, high: 1000, repair: "control-board-replacement", danger: null,
  },
  polarity: {
    short: "Power polarity or grounding fault",
    severity: "call-pro-soon",
    causes: ["Reversed line and neutral wiring", "A missing or poor equipment ground", "Incorrect transformer phasing on twinned furnaces"],
    steps: ["Turn the furnace off at its service switch.", "Do not alter line-voltage wiring or grounding connections yourself."],
    call: "Call a licensed technician or electrician to verify polarity, grounding, and supply voltage.",
    low: 150, high: 500, repair: "control-board-replacement", danger: null,
  },
};

function entry(meaning, category, scope, short) {
  return { meaning, category, scope, short };
}

const goodmanE = {
  E0: entry("The control locked out after excessive ignition retries or recycles.", "ignition", scopes.goodmanE, "Excessive retries or recycles"),
  E1: entry("The pressure switch was closed when the control expected it to be open.", "pressureClosed", scopes.goodmanE),
  E2: entry("The pressure switch was open when the control expected it to be closed.", "pressureOpen", scopes.goodmanE),
  E3: entry("The high-limit switch opened.", "limit", scopes.goodmanE),
  E4: entry("The control detected flame when no flame should have been present.", "unexpectedFlame", scopes.goodmanE),
  E5: entry("The control-board fuse is open.", "fuse", scopes.goodmanE),
  E6: entry("The control detected a low flame-sensor signal.", "lowFlame", scopes.goodmanE),
  E7: entry("The igniter or igniter-relay circuit reported a fault.", "igniter", scopes.goodmanE),
};

const goodmanFlash = {
  "1 Flash": entry("The furnace entered ignition lockout after failing to establish flame.", "ignition", scopes.goodmanFlash),
  "2 Flash": entry("The pressure switch was stuck closed when it should have been open.", "pressureClosed", scopes.goodmanFlash),
  "3 Flash": entry("The pressure switch remained open when it should have closed.", "pressureOpen", scopes.goodmanFlash),
  "4 Flash": entry("The high-limit switch opened.", "limit", scopes.goodmanFlash),
  "5 Flash": entry("The control detected flame while the gas valve should have been off.", "unexpectedFlame", scopes.goodmanFlash),
  "6 Flash": entry("The flame-rollout switch or its fuse opened.", "rollout", scopes.goodmanFlash),
  "7 Flash": entry("The control detected a low flame-sensor signal.", "lowFlame", scopes.goodmanFlash),
  "8 Flash": entry("The igniter circuit or furnace ground reported a fault.", "igniter", scopes.goodmanFlash),
};

const carrier = {
  "13": entry("The limit or flame-rollout circuit opened repeatedly and the furnace locked out.", "rollout", scopes.carrier, "Limit or rollout circuit lockout"),
  "14": entry("The furnace failed to ignite or prove flame in four attempts and entered ignition lockout.", "ignition", scopes.carrier, "Ignition lockout"),
  "23": entry("The low-heat pressure switch did not open when the heat call began.", "pressureClosed", scopes.carrier),
  "24": entry("The secondary-voltage fuse is open because of a low-voltage short.", "fuse", scopes.carrier),
  "31": entry("The high-heat pressure switch or relay did not close, or reopened during operation.", "pressureOpen", scopes.carrier),
  "32": entry("The low-heat pressure, draft-safeguard, low-gas-pressure, or auxiliary-limit circuit did not close or reopened.", "pressureOpen", scopes.carrier),
  "33": entry("The limit or flame-rollout circuit is open.", "rollout", scopes.carrier),
  "34": entry("The control did not sense flame during ignition, or lost the flame signal while running.", "flameLoss", scopes.carrier, "Ignition-proving fault"),
  "43": entry("A low-heat pressure or safety switch was open while the high-heat pressure switch was closed.", "pressureOpen", scopes.carrier),
  "45": entry("The integrated furnace control detected an internal failure and requires professional diagnosis.", "board", scopes.carrier, "Control-board fault"),
};

const lennox = {
  "200": entry("The rollout circuit is open, or had opened, and the furnace is in hard lockout.", "rollout", scopes.lennox, "Rollout circuit hard lockout"),
  "201": entry("The furnace cannot communicate with the indoor blower motor.", "blower", scopes.lennox, "Indoor blower communication failure"),
  "270": entry("The furnace exceeded its maximum ignition retries without sensing flame and entered soft lockout.", "ignition", scopes.lennox, "No-flame retry lockout"),
  "271": entry("The furnace exceeded its ignition retries after the pressure switch opened.", "pressureOpen", scopes.lennox, "Pressure-switch retry lockout"),
  "272": entry("The furnace exceeded its recycle limit after a pressure switch opened.", "pressureOpen", scopes.lennox, "Pressure-switch recycle lockout"),
  "273": entry("The furnace exceeded its recycle limit after losing the flame signal.", "flameLoss", scopes.lennox, "Flame-failure recycle lockout"),
  "274": entry("The furnace exceeded its recycle limit after the limit circuit opened or stayed open too long.", "limit", scopes.lennox, "Limit-circuit recycle lockout"),
  "275": entry("Flame had been sensed out of sequence; the flame signal is now gone and the furnace is in soft lockout.", "unexpectedFlame", scopes.lennox, "Out-of-sequence flame lockout"),
  "276": entry("The furnace exceeded the allowed pressure-switch calibration retries.", "pressureOpen", scopes.lennox, "Pressure-switch calibration lockout"),
};

const rheem = {
  "10": entry("The furnace entered a one-hour lockout after repeated ignition failures.", "ignition", scopes.rheem, "One-hour ignition lockout"),
  "11": entry("The control failed to establish or prove flame during ignition.", "ignition", scopes.rheem, "Failed ignition"),
  "12": entry("The flame-sensor signal is below the acceptable range.", "lowFlame", scopes.rheem),
  "13": entry("The flame signal was lost while the burners were operating.", "flameLoss", scopes.rheem),
  "14": entry("The control detected flame when flame should not have been present.", "unexpectedFlame", scopes.rheem),
  "22": entry("The main limit circuit is open.", "limit", scopes.rheem),
  "33": entry("The manual-reset limit control circuit is open.", "rollout", scopes.rheem, "Manual-reset safety circuit open"),
  "44": entry("A pressure switch was closed when the control expected it to be open.", "pressureClosed", scopes.rheem),
  "45": entry("The low-pressure switch is open when the control expects it to be closed.", "pressureOpen", scopes.rheem),
  "61": entry("The indoor blower did not run when commanded.", "blower", scopes.rheem, "Blower failed to run"),
};

const jci = {
  "1 Blink": entry("The control sensed flame without a call for heat.", "unexpectedFlame", scopes.jci),
  "2 Blinks": entry("The pressure switch was stuck closed when it should have been open.", "pressureClosed", scopes.jci),
  "3 Blinks": entry("The pressure switch failed to close after the inducer started.", "pressureOpen", scopes.jci),
  "4 Blinks": entry("The primary or auxiliary limit circuit is open.", "limit", scopes.jci),
  "5 Blinks": entry("The flame-rollout switch is open.", "rollout", scopes.jci),
  "6 Blinks": entry("The pressure switch opened four times during one heat call, causing lockout.", "pressureOpen", scopes.jci, "Pressure-switch cycle lockout"),
  "7 Blinks": entry("The burners failed to establish flame and the furnace entered ignition lockout.", "ignition", scopes.jci),
  "8 Blinks": entry("Flame was lost five times during one heat call, causing recycle lockout.", "flameLoss", scopes.jci, "Flame-loss recycle lockout"),
  "9 Blinks": entry("The furnace detected reversed line polarity or an improper ground.", "polarity", scopes.jci),
  "10 Blinks": entry("The control detected gas flow without a call for heat.", "unexpectedFlame", scopes.jci, "Gas flow without a heat call"),
  "11 Blinks": entry("A limit switch stayed open longer than five minutes, causing hard lockout.", "limit", scopes.jci, "Extended limit-open lockout"),
  "12 Blinks": entry("The igniter circuit is open.", "igniter", scopes.jci),
};

const nortek = {
  "1 Blink": entry("The furnace entered system lockout after exceeding its ignition retries.", "ignition", scopes.nortek),
  "2 Blinks": entry("The pressure switch was stuck closed when it should have been open.", "pressureClosed", scopes.nortek),
  "3 Blinks": entry("The pressure switch was stuck open when it should have closed.", "pressureOpen", scopes.nortek),
  "4 Blinks": entry("The high-temperature limit switch is open.", "limit", scopes.nortek),
  "5 Blinks": entry("Flame was sensed for more than four seconds while the gas valve was off.", "unexpectedFlame", scopes.nortek),
  "6 Blinks": entry("The flame-rollout switch is open.", "rollout", scopes.nortek),
  "7 Blinks": entry("The control detected a low flame-sensor signal.", "lowFlame", scopes.nortek),
  "8 Blinks": entry("The igniter relay reported a fault.", "igniter", scopes.nortek),
};

const icp = {
  "2 Flash": entry("The pressure switch was closed when the control expected it to be open.", "pressureClosed", scopes.icp),
  "3 Flash": entry("The low-pressure switch was open when the control expected it to be closed.", "pressureOpen", scopes.icp),
  "4 Flash": entry("The limit or flame-rollout circuit is open.", "rollout", scopes.icp, "Limit or rollout circuit open"),
  "5 Flash": entry("The control detected flame while the gas valve should have been off.", "unexpectedFlame", scopes.icp),
  "6 Flash": entry("The burners failed to ignite, or the flame signal was lost during operation.", "flameLoss", scopes.icp, "Ignition or flame-sense failure"),
  "7 Flash": entry("The limit or rollout circuit stayed open long enough to place the furnace in soft lockout.", "rollout", scopes.icp, "Limit or rollout soft lockout"),
  "8 Flash": entry("The control entered permanent gas-heat lockout after detecting a gas-valve relay or wiring fault.", "unexpectedFlame", scopes.icp, "Permanent gas-heat lockout"),
  "9 Flash": entry("The high-pressure switch was open when the control expected it to be closed.", "pressureOpen", scopes.icp),
  "10 Flash": entry("The furnace detected reversed line polarity, or incorrect transformer phasing on twinned units.", "polarity", scopes.icp),
};

function mapFor(brand, code) {
  if (["goodman", "amana", "daikin"].includes(brand)) {
    if (goodmanE[code]) return goodmanE[code];
    if (goodmanFlash[code]) return goodmanFlash[code];
  }
  if (["carrier", "bryant", "payne"].includes(brand)) return carrier[code];
  if (brand === "lennox") return lennox[code];
  if (["rheem", "ruud"].includes(brand)) return rheem[code];
  if (["york", "luxaire", "coleman"].includes(brand)) return jci[code];
  if (["comfortmaker", "day-and-night", "heil", "keeprite", "tempstar"].includes(brand)) {
    return icp[code];
  }
  if (["intertherm", "miller"].includes(brand)) return nortek[code];
  return undefined;
}

function makeSnippet(brandName, code, meaning) {
  return `${brandName} furnace code ${code} means ${meaning.replace(/\.$/, "").toLowerCase()} on the supported control family. Confirm the model number and diagnostic chart inside the furnace door before replacing parts.`;
}

const brandNames = Object.fromEntries(
  JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "brands.json"), "utf8"))
    .map((brand) => [brand.slug, brand.name])
);

let verified = 0;
let protectedCount = 0;

for (const file of fs.readdirSync(codesDir).filter((name) => name.endsWith(".json"))) {
  const brand = file.replace(/\.json$/, "");
  const filePath = path.join(codesDir, file);
  const codes = JSON.parse(fs.readFileSync(filePath, "utf8"));

  for (const code of codes) {
    const mapped = mapFor(brand, code.code);
    const sourceId = code.code.includes("Flash") && ["goodman", "amana", "daikin"].includes(brand)
      ? "daikin-dm80hs"
      : sourceByBrand[brand];

    code.sourceIds = [sourceId];

    if (!mapped) {
      code.verificationStatus = "model-specific-unverified";
      code.modelScope = "No universal meaning is confirmed for this code. The exact model number and control-board chart are required.";
      protectedCount++;
      continue;
    }

    code.verificationStatus = "verified";
    code.modelScope = mapped.scope;
    verified++;

    if (!mapped.category) continue;
    const template = templates[mapped.category];
    const meaning = mapped.meaning;
    const short = mapped.short ?? template.short;
    code.title = `${brandNames[brand]} Furnace Code ${code.code}: ${short}`;
    code.meaning = meaning;
    code.snippetAnswer = makeSnippet(brandNames[brand], code.code, meaning);
    code.severity = template.severity;
    code.commonCauses = template.causes;
    code.diySteps = template.steps;
    code.whenToCallPro = template.call;
    code.repairCostLow = template.low;
    code.repairCostHigh = template.high;
    code.relatedRepairSlug = template.repair;
    code.dangerNote = template.danger;
  }

  fs.writeFileSync(filePath, `${JSON.stringify(codes, null, 2)}\n`);
}

console.log(`Updated ${verified} verified codes; protected ${protectedCount} model-specific codes from indexing.`);

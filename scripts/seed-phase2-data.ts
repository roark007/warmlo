/**
 * One-time seed script for Phase 2 code data.
 * Run: npx tsx scripts/seed-phase2-data.ts
 */
import fs from "fs";
import path from "path";

function codeToSlug(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) throw new Error("Code cannot be empty");
  return trimmed.toLowerCase().replace(/\s+/g, "-");
}

type Severity = "diy-possible" | "call-pro-soon" | "emergency";

function c(
  brand: string,
  code: string,
  short: string,
  meaning: string,
  severity: Severity,
  causes: [string, string, ...string[]],
  steps: string[],
  whenToCallPro: string,
  costLow: number,
  costHigh: number,
  repair: string,
  dangerNote?: string
) {
  const title = `${brand} Furnace Code ${code}: ${short}`;
  return {
    code,
    slug: codeToSlug(code),
    title,
    meaning,
    severity,
    commonCauses: causes,
    diySteps: steps,
    whenToCallPro,
    repairCostLow: costLow,
    repairCostHigh: costHigh,
    relatedRepairSlug: repair,
    dangerNote: dangerNote ?? null,
  };
}

const DATA = {
  goodman: [
    c("Goodman", "E4", "Open High-Limit Switch", "The furnace overheated and the high-limit safety switch shut it down to prevent damage or fire.", "call-pro-soon", ["Clogged air filter restricting airflow", "Blocked or closed supply vents", "Failing blower motor"], ["Turn off the furnace at the switch.", "Check the air filter; replace if dirty.", "Open all supply vents.", "Restore power and see if the code clears."], "If the code returns after a filter change, the blower motor or limit switch likely needs service.", 150, 600, "limit-switch-replacement"),
    c("Goodman", "E0", "Ignition Failure", "The furnace tried to light the burners but ignition did not occur after several attempts.", "call-pro-soon", ["Worn hot-surface ignitor", "Closed gas valve or supply issue", "Faulty flame sensor"], ["Confirm the gas supply valve near the furnace is fully open.", "Check that the thermostat is calling for heat.", "Reset power and observe one ignition cycle.", "If the ignitor glows but burners never light, stop and call a technician."], "If the ignitor glows orange but no flame appears, or if you smell gas, call a licensed HVAC technician.", 150, 450, "ignitor-replacement"),
    c("Goodman", "E1", "Gas Valve Relay Error", "The control board detected a problem with the gas valve circuit and locked out the furnace.", "emergency", ["Failed gas valve solenoid", "Loose wiring at the gas valve", "Control board relay failure"], [], "Gas valve and combustion issues require a licensed technician.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
    c("Goodman", "E2", "Pressure Switch Failure", "The pressure switch did not close when the inducer motor ran, blocking ignition.", "call-pro-soon", ["Blocked condensate drain", "Cracked vent pipe", "Failed pressure switch"], ["Turn off power.", "Inspect the vent pipe for blockages.", "Check the condensate drain for clogs.", "Restore power and test."], "If the vent and drain look clear but the code remains, have the pressure switch and inducer tested.", 175, 550, "pressure-switch-replacement"),
    c("Goodman", "E3", "Inducer Motor Fault", "The inducer motor did not start or reach the speed needed to vent combustion gases.", "call-pro-soon", ["Seized inducer motor", "Blocked exhaust vent", "Failed motor capacitor"], ["Turn off power.", "Listen for humming without the fan spinning.", "Check the exhaust vent outlet for blockages.", "Do not force a seized motor."], "If the motor will not start after clearing the vent, schedule inducer motor service.", 400, 900, "inducer-motor-replacement"),
    c("Goodman", "E5", "Flame Sensor Issue", "The flame sensor did not detect a stable flame after ignition.", "diy-possible", ["Dirty flame sensor rod", "Weak gas supply", "Loose sensor wire"], ["Turn off power.", "Locate the thin metal rod near the burners.", "Gently clean the rod with fine steel wool.", "Reinstall and run a heat cycle."], "If cleaning does not help after two attempts, the sensor or gas valve may need diagnosis.", 100, 300, "flame-sensor-cleaning"),
    c("Goodman", "E6", "Rollout Switch Open", "The rollout switch tripped because flames or excessive heat reached the front of the burner area.", "emergency", ["Cracked heat exchanger", "Restricted flue or vent", "Burner flame rollout"], [], "Rollout conditions involve combustion safety. Do not reset repeatedly without inspection.", 500, 3500, "heat-exchanger-replacement", "If you smell gas or see soot around the furnace, leave the area and call a technician immediately."),
    c("Goodman", "E7", "Low Flame Signal", "The control board detected a weak or unstable flame after ignition.", "call-pro-soon", ["Dirty flame sensor", "Low gas pressure", "Partially clogged burner"], ["Turn off power and inspect the flame sensor for soot.", "Confirm the gas valve is fully open.", "Restore power and watch one ignition cycle."], "Persistent low flame signals often require gas pressure testing and burner service.", 100, 400, "flame-sensor-cleaning"),
    c("Goodman", "E8", "Igniter Circuit Fault", "The control board could not energize the hot-surface ignitor properly.", "call-pro-soon", ["Failed ignitor", "Loose ignitor connector", "Control board output fault"], ["Turn off power.", "Inspect the ignitor for visible cracks.", "Check that the ignitor plug is seated firmly.", "Do not touch a hot ignitor."], "If the ignitor looks intact but the code persists, board or wiring diagnosis is needed.", 150, 450, "ignitor-replacement"),
    c("Goodman", "E9", "Grounding or Polarity Fault", "The control detected improper electrical grounding or reversed line/neutral wiring.", "call-pro-soon", ["Reversed polarity at disconnect", "Missing equipment ground", "Loose neutral connection"], ["Turn off power at the breaker.", "Do not operate the furnace until wiring is verified.", "Check that the disconnect and furnace are properly grounded."], "Electrical grounding issues should be corrected by a qualified technician.", 150, 350, "control-board-replacement"),
    c("Goodman", "1 Flash", "Ignition Failure Lockout", "One LED flash indicates the furnace failed to establish flame during the ignition trial.", "call-pro-soon", ["Worn ignitor", "Dirty flame sensor", "Gas supply issue"], ["Verify the gas valve is open.", "Reset power and watch for ignitor glow.", "If glow occurs but no flame, stop and call for service."], "Repeated one-flash lockouts usually mean ignitor or gas valve service is needed.", 150, 450, "ignitor-replacement"),
    c("Goodman", "2 Flash", "Pressure Switch Stuck Closed", "Two flashes mean the pressure switch remained closed when it should have opened.", "call-pro-soon", ["Stuck pressure switch diaphragm", "Blocked vent", "Faulty inducer"], ["Turn off power.", "Inspect venting for obstructions.", "Check the pressure switch hose for water or debris."], "A stuck-closed switch can prevent safe startup and needs professional testing.", 175, 550, "pressure-switch-replacement"),
    c("Goodman", "3 Flash", "Pressure Switch Stuck Open", "Three flashes indicate the pressure switch never closed during the inducer cycle.", "call-pro-soon", ["Blocked vent or intake", "Failed inducer motor", "Disconnected pressure hose"], ["Inspect the vent pipe and intake.", "Check the small hose to the pressure switch.", "Clear any condensate blockage in the trap."], "If the inducer runs but the switch never closes, replace the switch or inducer.", 175, 900, "pressure-switch-replacement"),
    c("Goodman", "4 Flash", "Open Limit Switch", "Four flashes signal the high-limit switch opened due to overheating.", "call-pro-soon", ["Dirty air filter", "Closed vents", "Weak blower motor"], ["Replace a dirty filter.", "Open all supply vents.", "Reset power after airflow is restored."], "If overheating continues, the limit switch or blower may need replacement.", 150, 600, "limit-switch-replacement"),
    c("Goodman", "5 Flash", "Flame Sensed Without Heat Call", "Five flashes mean the board detected flame when the thermostat was not calling for heat.", "emergency", ["Leaking gas valve", "Stuck gas valve relay", "Control board fault"], [], "Unexpected flame requires immediate professional inspection.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
    c("Goodman", "6 Flash", "Modulating Gas Valve Fault", "Six flashes indicate a fault in the modulating gas valve circuit on variable-capacity models.", "call-pro-soon", ["Failed modulating gas valve", "Wiring fault", "Control board communication error"], ["Turn off power.", "Do not attempt to adjust gas settings yourself.", "Note the flash pattern for your technician."], "Modulating valve repairs require specialized tools and licensed service.", 350, 900, "gas-valve-replacement"),
    c("Goodman", "7 Flash", "Low Flame Signal", "Seven flashes indicate the flame signal dropped too low during operation.", "call-pro-soon", ["Dirty flame sensor", "Low gas pressure", "Draft affecting flame"], ["Clean the flame sensor carefully.", "Ensure return grilles are not blocked.", "Run one test cycle after cleaning."], "If the flame still drops out, gas pressure and venting should be checked professionally.", 100, 400, "flame-sensor-cleaning"),
    c("Goodman", "8 Flash", "Igniter Circuit Problem", "Eight flashes mean the ignitor circuit failed an internal board check.", "call-pro-soon", ["Cracked ignitor", "Open ignitor wire", "Board relay failure"], ["Turn off power before inspecting the ignitor.", "Look for cracks or white spots on the ignitor.", "Reseat the ignitor connector."], "Replace a visibly failed ignitor or call for board diagnosis if the ignitor looks fine.", 150, 450, "ignitor-replacement"),
  ],
} as Record<string, ReturnType<typeof c>[]>;

// Carrier-family numeric codes (Carrier, Bryant, Payne share patterns)
function carrierFamily(brand: string): ReturnType<typeof c>[] {
  return [
    c(brand, "13", "Limit Switch Lockout", "The furnace locked out after the high-limit switch opened too many times.", "call-pro-soon", ["Restricted airflow from dirty filter", "Blower not running at speed", "Blocked return duct"], ["Replace the air filter.", "Open supply vents.", "Reset power once airflow is restored."], "Repeated limit lockouts require blower and limit switch inspection.", 150, 600, "limit-switch-replacement"),
    c(brand, "14", "Ignition Lockout", "The control board stopped ignition attempts after repeated failures.", "call-pro-soon", ["Failed hot-surface ignitor", "Dirty flame sensor", "Gas valve not opening"], ["Verify gas supply is on.", "Reset power and observe one ignition sequence.", "Stop if you smell gas."], "Ignition lockouts after one reset usually need ignitor or flame sensor service.", 150, 450, "ignitor-replacement"),
    c(brand, "15", "Blower Motor Lockout", "The blower motor exceeded safe current draw or failed to start properly.", "call-pro-soon", ["Seized blower wheel", "Failed run capacitor", "Worn blower motor"], ["Turn off power.", "Spin the blower wheel by hand to check for binding.", "Do not force a stuck motor."], "Blower motor lockouts typically require motor or capacitor replacement.", 450, 1200, "blower-motor-replacement"),
    c(brand, "23", "Pressure Switch Failed to Close", "The pressure switch did not close during the inducer on cycle.", "call-pro-soon", ["Blocked vent", "Failed inducer", "Cracked pressure hose"], ["Inspect vent and intake pipes.", "Check the pressure switch tubing.", "Clear condensate from the trap."], "If the inducer runs normally but the switch never closes, replace the switch or inducer.", 175, 900, "pressure-switch-replacement"),
    c(brand, "24", "Secondary Voltage Fuse Open", "A low-voltage fuse on the control board opened, shutting down the furnace.", "call-pro-soon", ["Shorted thermostat wire", "Failed control board component", "Damaged field wiring"], ["Turn off power.", "Inspect low-voltage wiring for pinches or bare spots.", "Do not bypass the fuse."], "If a new fuse blows immediately, the board or wiring needs professional diagnosis.", 300, 800, "control-board-replacement"),
    c(brand, "31", "Pressure Switch Failed to Open", "The pressure switch stayed closed when the inducer turned off.", "call-pro-soon", ["Stuck pressure switch", "Water in pressure hose", "Blocked vent"], ["Check the pressure hose for water.", "Inspect the vent for blockages.", "Reset power after clearing obstructions."], "A switch that will not open should be replaced before further operation.", 175, 550, "pressure-switch-replacement"),
    c(brand, "32", "Low Pressure Switch Open", "The low-pressure switch remained open during the heating cycle.", "call-pro-soon", ["Inducer not reaching speed", "Vent restriction", "Failed low-pressure switch"], ["Verify the exhaust vent is clear.", "Listen for weak inducer operation.", "Check for ice or debris at the vent terminal."], "Low-pressure faults often trace to inducer or venting problems.", 175, 900, "pressure-switch-replacement"),
    c(brand, "33", "Limit Circuit Open", "The limit switch circuit opened while the furnace was running.", "call-pro-soon", ["Overheating from poor airflow", "Failing blower", "Stuck limit switch"], ["Replace a dirty filter.", "Ensure registers are open.", "Allow the furnace to cool before resetting."], "If the limit opens repeatedly, the blower or limit switch may need replacement.", 150, 600, "limit-switch-replacement"),
    c(brand, "34", "Ignition Proving Failure", "The board did not detect flame within the allowed proving period.", "call-pro-soon", ["Dirty flame sensor", "Weak ignitor", "Gas valve delay"], ["Clean the flame sensor rod.", "Watch whether the ignitor glows fully.", "Reset and try one cycle."], "Persistent proving failures require ignitor, sensor, or gas valve service.", 150, 450, "ignitor-replacement"),
    c(brand, "41", "Blower Motor Fault", "The control detected an error in the blower motor or its speed tap circuit.", "call-pro-soon", ["Failed blower motor", "Open motor harness", "Control board relay fault"], ["Turn off power.", "Check that the blower door panel is secure.", "Inspect the motor plug connection."], "Blower faults usually require motor or board replacement.", 450, 1200, "blower-motor-replacement"),
    c(brand, "42", "Inducer Motor Fault", "The inducer motor did not respond correctly during the pre-purge cycle.", "call-pro-soon", ["Seized inducer", "Failed inducer capacitor", "Blocked flue"], ["Inspect the vent outlet.", "Listen for inducer hum without rotation.", "Clear any visible blockages."], "Inducer motor replacement is needed if the motor will not start.", 400, 900, "inducer-motor-replacement"),
    c(brand, "43", "Pressure Switch Stuck Open", "The pressure switch remained open when it should have closed.", "call-pro-soon", ["Disconnected pressure hose", "Failed switch", "Inducer not running"], ["Reattach any loose pressure hoses.", "Verify the inducer runs on a heat call.", "Clear condensate blockages."], "Replace a verified failed pressure switch or faulty inducer.", 175, 900, "pressure-switch-replacement"),
    c(brand, "44", "Blower Overcurrent", "The blower drew more current than the control board allows.", "call-pro-soon", ["Restricted blower wheel", "Failing ECM motor", "Shorted motor windings"], ["Turn off power.", "Check for debris in the blower wheel.", "Spin the wheel to feel for binding."], "Overcurrent trips often mean blower motor replacement.", 450, 1200, "blower-motor-replacement"),
    c(brand, "45", "Control Board Fault", "The integrated control self-test detected an internal board error.", "call-pro-soon", ["Moisture on board", "Failed relay on board", "Power surge damage"], ["Turn off power.", "Inspect the board area for water or burn marks.", "Ensure the condensate drain is not leaking on the board."], "Board faults typically require control board replacement.", 300, 800, "control-board-replacement"),
    c(brand, "51", "Gas Valve Stuck Open", "The control detected gas flow when the valve should have been closed.", "emergency", ["Leaking gas valve", "Stuck valve solenoid", "Relay welded closed"], [], "A stuck-open gas valve is a serious safety issue requiring immediate service.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
    c(brand, "52", "Gas Valve Relay Fault", "The gas valve relay on the control board did not operate correctly.", "emergency", ["Failed board relay", "Gas valve coil open", "Loose valve wiring"], [], "Gas valve electrical faults must be repaired by a licensed technician.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
    c(brand, "53", "Flame Not Sensed", "The flame sensor did not prove flame after the gas valve opened.", "call-pro-soon", ["Dirty flame sensor", "Weak flame due to low gas", "Cracked ignitor still glowing"], ["Clean the flame sensor.", "Verify burners ignite fully.", "Reset and observe one complete cycle."], "If flame is visible but not sensed, replace the flame sensor.", 100, 300, "flame-sensor-cleaning"),
  ];
}

DATA.carrier = carrierFamily("Carrier");
DATA.bryant = carrierFamily("Bryant");
DATA.payne = carrierFamily("Payne");

// Lennox-style slow/fast flash codes
function lennoxFamily(brand: string): ReturnType<typeof c>[] {
  return [
    c(brand, "200", "No Signal from Thermostat", "The control board is not receiving a heat call from the thermostat.", "diy-possible", ["Thermostat set to off or cool", "Loose thermostat wire", "Dead thermostat batteries"], ["Confirm the thermostat is set to heat.", "Replace batteries if applicable.", "Check that the furnace door is secure."], "If the thermostat is calling for heat but the code remains, wiring may need service.", 100, 350, "thermostat-replacement"),
    c(brand, "201", "Invalid Thermostat Signal", "The board received an out-of-range signal from a communicating thermostat.", "call-pro-soon", ["Incompatible thermostat", "Loose comm wire", "Board comm port fault"], ["Verify thermostat model compatibility.", "Reseat thermostat wiring.", "Power-cycle the furnace once."], "Communicating thermostat faults often need a matched replacement stat or board.", 100, 400, "thermostat-replacement"),
    c(brand, "220", "Pressure Switch Open on Startup", "The pressure switch did not close when the inducer started.", "call-pro-soon", ["Blocked vent", "Failed inducer", "Cracked pressure hose"], ["Inspect vent and intake.", "Check pressure switch tubing.", "Clear condensate from trap."], "Replace a failed pressure switch or inducer if obstructions are ruled out.", 175, 900, "pressure-switch-replacement"),
    c(brand, "221", "Pressure Switch Stuck Closed", "The pressure switch remained closed when the inducer was off.", "call-pro-soon", ["Stuck switch diaphragm", "Water in pressure line", "Blocked vent"], ["Drain water from pressure tubing.", "Inspect vent for restrictions.", "Reset power once."], "A stuck pressure switch should be replaced.", 175, 550, "pressure-switch-replacement"),
    c(brand, "270", "Ignition Failure", "The furnace could not light the burners during the ignition trial.", "call-pro-soon", ["Worn ignitor", "Gas valve not opening", "Dirty flame sensor"], ["Verify gas supply.", "Watch for ignitor glow on one cycle.", "Reset power once."], "Repeated ignition failures need ignitor or gas valve service.", 150, 450, "ignitor-replacement"),
    c(brand, "271", "Flame Lost During Operation", "The board detected flame loss while the thermostat was still calling for heat.", "call-pro-soon", ["Dirty flame sensor", "Cracked heat exchanger draft", "Flame rollout"], ["Turn off power.", "Inspect the flame sensor.", "Look for soot around the burner area."], "Flame loss during run requires professional combustion inspection.", 100, 3500, "flame-sensor-cleaning"),
    c(brand, "272", "Flame Sensed Without Call", "Flame was detected when the thermostat was not calling for heat.", "emergency", ["Leaking gas valve", "Stuck valve relay", "Board fault"], [], "Unexpected flame is a safety hazard requiring immediate service.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
    c(brand, "273", "Rollout Switch Open", "The rollout switch opened due to flames or heat at the burner front.", "emergency", ["Blocked flue", "Cracked heat exchanger", "Improper burner alignment"], [], "Rollout trips indicate a combustion safety issue.", 500, 3500, "heat-exchanger-replacement", "If you smell gas or see soot, leave the area and call a technician."),
    c(brand, "274", "Limit Switch Open", "The high-limit switch opened because the furnace overheated.", "call-pro-soon", ["Dirty filter", "Weak blower", "Closed vents"], ["Replace the air filter.", "Open all supply vents.", "Allow the unit to cool before resetting."], "Repeated limit trips need blower or limit switch service.", 150, 600, "limit-switch-replacement"),
    c(brand, "275", "Blower Motor Failure", "The blower motor did not start or did not reach required speed.", "call-pro-soon", ["Failed blower motor", "Bad capacitor", "Loose wiring"], ["Turn off power.", "Check the blower wheel for obstruction.", "Verify the access panel is closed."], "Blower motor or capacitor replacement is usually required.", 450, 1200, "blower-motor-replacement"),
    c(brand, "276", "Inducer Motor Failure", "The inducer motor failed to start during the venting cycle.", "call-pro-soon", ["Seized inducer", "Blocked vent", "Failed inducer capacitor"], ["Clear the vent terminal.", "Listen for hum without spin.", "Do not force the motor."], "Inducer replacement is needed if the motor will not run.", 400, 900, "inducer-motor-replacement"),
    c(brand, "277", "Gas Valve Fault", "The control detected an error in the gas valve circuit.", "emergency", ["Failed gas valve", "Open valve coil", "Board relay fault"], [], "Gas valve faults require licensed repair.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
    c(brand, "278", "Control Board Error", "The integrated control reported an internal fault.", "call-pro-soon", ["Power surge damage", "Moisture on board", "Failed relay"], ["Turn off power.", "Inspect for water near the board.", "Ensure condensate is draining properly."], "Board errors typically require control board replacement.", 300, 800, "control-board-replacement"),
    c(brand, "279", "Low Flame Signal", "The flame current dropped below the minimum threshold.", "call-pro-soon", ["Dirty flame sensor", "Low gas pressure", "Draft interference"], ["Clean the flame sensor.", "Check return airflow.", "Run one test cycle."], "If flame current stays low, gas pressure and venting should be checked.", 100, 400, "flame-sensor-cleaning"),
    c(brand, "280", "Auxiliary Switch Open", "An auxiliary limit or safety switch in series opened.", "call-pro-soon", ["Tripped rollout switch", "Open fuse link", "Loose harness connection"], ["Turn off power.", "Inspect auxiliary switches near the burner.", "Do not bypass safety switches."], "Auxiliary switch faults need a technician to identify which safety opened.", 150, 600, "limit-switch-replacement"),
    c(brand, "441", "Blower Communication Fault", "The board lost communication with an ECM blower motor module.", "call-pro-soon", ["Failed ECM module", "Loose comm harness", "Board output fault"], ["Turn off power.", "Reseat blower harness connectors.", "Verify the blower door is secure."], "ECM communication faults often require blower motor replacement.", 450, 1200, "blower-motor-replacement"),
    c(brand, "442", "Inducer Speed Fault", "The inducer did not reach the commanded speed.", "call-pro-soon", ["Blocked vent", "Worn inducer motor", "Failed speed sensor"], ["Inspect vent for blockages.", "Listen for abnormal inducer noise.", "Clear ice or debris at the vent cap."], "Inducer speed faults may require motor replacement.", 400, 900, "inducer-motor-replacement"),
    c(brand, "443", "Condensate Blockage", "The condensate drainage system triggered a safety lockout.", "diy-possible", ["Clogged condensate trap", "Frozen drain line", "Full condensate pump"], ["Clear the condensate trap.", "Check the drain hose for kinks.", "Empty or reset the condensate pump if present."], "If drainage is clear but the code persists, the pressure switch or pump may have failed.", 150, 450, "condensate-pump-replacement"),
  ];
}

DATA.lennox = lennoxFamily("Lennox");
DATA["armstrong-air"] = lennoxFamily("Armstrong Air");

// Trane / American Standard flash codes
function traneFamily(brand: string): ReturnType<typeof c>[] {
  return [
    c(brand, "2 Flashes", "External Lockout", "An external safety device locked the furnace out.", "call-pro-soon", ["Tripped limit switch", "Open rollout switch", "Loose safety harness"], ["Turn off power.", "Check that all access panels are secure.", "Allow the unit to cool before resetting."], "External lockouts require identifying which safety device opened.", 150, 600, "limit-switch-replacement"),
    c(brand, "3 Flashes", "Pressure Switch Error", "The pressure switch circuit failed during the venting sequence.", "call-pro-soon", ["Blocked vent", "Failed inducer", "Stuck pressure switch"], ["Inspect vent pipes.", "Check pressure switch tubing.", "Clear condensate blockages."], "Pressure switch or inducer service is usually needed.", 175, 900, "pressure-switch-replacement"),
    c(brand, "4 Flashes", "Open Limit Switch", "The primary limit switch opened during the heating cycle.", "call-pro-soon", ["Dirty air filter", "Blower failure", "Blocked return"], ["Replace the filter.", "Open supply vents.", "Reset after cooling down."], "Repeated limit trips need blower or limit switch replacement.", 150, 600, "limit-switch-replacement"),
    c(brand, "5 Flashes", "Flame Detected When Off", "The control sensed flame without a call for heat.", "emergency", ["Leaking gas valve", "Stuck gas valve relay", "Control fault"], [], "Unexpected flame requires immediate professional inspection.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
    c(brand, "6 Flashes", "Line Voltage Out of Range", "Supply voltage to the furnace was too high or too low.", "call-pro-soon", ["Utility voltage issue", "Loose line connection", "Shared circuit overload"], ["Do not cycle power repeatedly.", "Note whether lights dim when the furnace runs.", "Contact an electrician if voltage issues are suspected."], "Persistent voltage faults need electrical diagnosis.", 150, 400, "control-board-replacement"),
    c(brand, "7 Flashes", "Gas Valve Circuit Error", "The gas valve circuit failed an electrical check.", "emergency", ["Failed gas valve coil", "Open valve wire", "Board relay fault"], [], "Gas valve electrical faults require licensed service.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
    c(brand, "8 Flashes", "Ignition Failure", "The furnace failed to establish flame within the trial period.", "call-pro-soon", ["Worn ignitor", "Dirty flame sensor", "Gas supply issue"], ["Verify gas is on.", "Reset and watch one ignition attempt.", "Stop if you smell gas."], "Ignition failures usually need ignitor or flame sensor service.", 150, 450, "ignitor-replacement"),
    c(brand, "9 Flashes", "High-Stage Pressure Fault", "The high-stage pressure switch did not respond correctly on two-stage units.", "call-pro-soon", ["Blocked vent", "Failed high-stage switch", "Inducer speed fault"], ["Inspect venting.", "Check both pressure switch hoses.", "Clear condensate traps."], "Two-stage pressure faults need switch or inducer diagnosis.", 175, 900, "pressure-switch-replacement"),
    c(brand, "10 Flashes", "Grounding Fault", "The control detected a grounding or polarity problem.", "call-pro-soon", ["Missing ground", "Reversed polarity", "Loose neutral"], ["Turn off power.", "Do not operate until wiring is verified."], "Grounding issues should be corrected by a qualified technician.", 150, 350, "control-board-replacement"),
    c(brand, "11 Flashes", "Blower Motor Fault", "The blower motor did not respond to the control signal.", "call-pro-soon", ["Failed blower", "Open harness", "Bad capacitor"], ["Turn off power.", "Spin the blower wheel to check for binding.", "Verify the blower door switch."], "Blower motor or capacitor replacement is typically required.", 450, 1200, "blower-motor-replacement"),
    c(brand, "12 Flashes", "Inducer Motor Fault", "The inducer motor failed during the pre-purge cycle.", "call-pro-soon", ["Seized inducer", "Blocked flue", "Failed capacitor"], ["Clear the vent outlet.", "Listen for inducer hum.", "Do not force the motor."], "Inducer motor replacement is needed if it will not start.", 400, 900, "inducer-motor-replacement"),
    c(brand, "13 Flashes", "Flame Rollout Trip", "The rollout switch opened due to abnormal flame pattern.", "emergency", ["Cracked heat exchanger", "Blocked heat exchanger cells", "Improper gas pressure"], [], "Rollout conditions require combustion safety inspection.", 500, 3500, "heat-exchanger-replacement", "If you smell gas or see soot, leave the area and call a technician."),
    c(brand, "14 Flashes", "Ignitor Circuit Fault", "The ignitor circuit failed a continuity or timing check.", "call-pro-soon", ["Cracked ignitor", "Loose connector", "Board output fault"], ["Turn off power.", "Inspect the ignitor for cracks.", "Reseat the ignitor plug."], "Replace a failed ignitor or call for board diagnosis.", 150, 450, "ignitor-replacement"),
    c(brand, "15 Flashes", "Flame Sensor Fault", "The flame sensor signal was out of range after ignition.", "call-pro-soon", ["Corroded sensor", "Weak flame", "Loose sensor wire"], ["Clean the flame sensor.", "Verify stable blue flame.", "Reset and test once."], "Replace the flame sensor if cleaning does not restore signal.", 100, 300, "flame-sensor-cleaning"),
    c(brand, "16 Flashes", "Control Board Fault", "The integrated control failed an internal self-test.", "call-pro-soon", ["Moisture damage", "Surge damage", "Failed relay"], ["Turn off power.", "Inspect the board area for moisture.", "Check condensate routing."], "Control board replacement is usually required.", 300, 800, "control-board-replacement"),
    c(brand, "17 Flashes", "Low Flame Lockout", "The flame signal dropped too low during sustained operation.", "call-pro-soon", ["Dirty sensor", "Draft issues", "Low gas pressure"], ["Clean the flame sensor.", "Ensure returns are open.", "Run one heat cycle."], "Low flame lockouts need gas pressure and venting checks.", 100, 400, "flame-sensor-cleaning"),
    c(brand, "18 Flashes", "Reverse Polarity", "Line and neutral may be reversed at the furnace disconnect.", "call-pro-soon", ["Reversed wiring", "Non-polarized disconnect", "Improper installation"], ["Turn off power.", "Do not operate until polarity is corrected."], "Have an electrician or HVAC tech verify line voltage wiring.", 150, 350, "control-board-replacement"),
  ];
}

DATA.trane = traneFamily("Trane");
DATA["american-standard"] = traneFamily("American Standard");

// Rheem / Ruud family
function rheemFamily(brand: string): ReturnType<typeof c>[] {
  return [
    c(brand, "10", "Ignition Lockout", "The furnace stopped trying to ignite after multiple failed attempts.", "call-pro-soon", ["Failed ignitor", "Dirty flame sensor", "Gas valve fault"], ["Verify gas supply.", "Reset power once.", "Watch for ignitor glow."], "Ignition lockouts usually need ignitor or sensor service.", 150, 450, "ignitor-replacement"),
    c(brand, "11", "Ignition Failure", "Flame was not established during the ignition sequence.", "call-pro-soon", ["Worn ignitor", "Low gas pressure", "Dirty burners"], ["Confirm gas valve is open.", "Observe one ignition cycle.", "Stop if you smell gas."], "Persistent ignition failure requires professional diagnosis.", 150, 450, "ignitor-replacement"),
    c(brand, "12", "Flame Rollout", "The rollout switch opened due to abnormal heat at the burner.", "emergency", ["Blocked flue", "Cracked heat exchanger", "Overfiring burners"], [], "Rollout trips indicate a serious combustion issue.", 500, 3500, "heat-exchanger-replacement", "If you smell gas or see soot, leave the area and call a technician."),
    c(brand, "13", "Limit Switch Open", "The limit switch opened because the furnace overheated.", "call-pro-soon", ["Dirty filter", "Weak blower", "Closed vents"], ["Replace the filter.", "Open vents.", "Cool down before resetting."], "Repeated limit trips need blower or limit switch service.", 150, 600, "limit-switch-replacement"),
    c(brand, "14", "Igniter Fault", "The igniter circuit failed a resistance or timing check.", "call-pro-soon", ["Cracked ignitor", "Open ignitor wire", "Board fault"], ["Turn off power.", "Inspect ignitor for cracks.", "Reseat the connector."], "Replace a visibly failed ignitor.", 150, 450, "ignitor-replacement"),
    c(brand, "21", "Pressure Switch Stuck Open", "The pressure switch never closed during inducer operation.", "call-pro-soon", ["Blocked vent", "Failed inducer", "Loose pressure hose"], ["Inspect vent and hoses.", "Clear condensate trap.", "Reset once."], "Replace failed pressure switch or inducer.", 175, 900, "pressure-switch-replacement"),
    c(brand, "22", "Pressure Switch Stuck Closed", "The pressure switch stayed closed when the inducer was off.", "call-pro-soon", ["Water in pressure line", "Stuck diaphragm", "Blocked vent"], ["Clear pressure tubing.", "Inspect vent.", "Reset power."], "Replace a stuck pressure switch.", 175, 550, "pressure-switch-replacement"),
    c(brand, "31", "Gas Valve Fault", "The control detected a gas valve circuit error.", "emergency", ["Failed valve coil", "Board relay fault", "Loose wiring"], [], "Gas valve faults require licensed repair.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
    c(brand, "33", "Flame Sensor Fault", "The flame sensor did not prove flame after ignition.", "call-pro-soon", ["Dirty sensor", "Weak flame", "Loose wire"], ["Clean the flame sensor.", "Verify burners light fully.", "Reset and test."], "Replace the sensor if cleaning fails.", 100, 300, "flame-sensor-cleaning"),
    c(brand, "41", "Blower Motor Fault", "The blower motor failed to start or tripped on overcurrent.", "call-pro-soon", ["Failed motor", "Bad capacitor", "Restricted wheel"], ["Turn off power.", "Check blower wheel for debris.", "Verify access panel is closed."], "Blower motor or capacitor replacement is usually needed.", 450, 1200, "blower-motor-replacement"),
    c(brand, "42", "Inducer Motor Fault", "The inducer motor did not operate during venting.", "call-pro-soon", ["Seized inducer", "Blocked vent", "Failed capacitor"], ["Clear vent terminal.", "Listen for hum without spin.", "Do not force motor."], "Inducer motor replacement if it will not start.", 400, 900, "inducer-motor-replacement"),
    c(brand, "43", "Control Board Fault", "The control board reported an internal error.", "call-pro-soon", ["Surge damage", "Moisture on board", "Failed relay"], ["Turn off power.", "Inspect for moisture.", "Check condensate drain."], "Board replacement is typically required.", 300, 800, "control-board-replacement"),
    c(brand, "44", "Low Flame Signal", "Flame current dropped below the minimum during operation.", "call-pro-soon", ["Dirty sensor", "Draft issue", "Low gas pressure"], ["Clean flame sensor.", "Ensure good airflow.", "Test one cycle."], "Low flame signals need gas and venting checks.", 100, 400, "flame-sensor-cleaning"),
    c(brand, "45", "Rollout Switch Open", "The rollout switch tripped during burner operation.", "emergency", ["Heat exchanger issue", "Blocked flue", "Flame impingement"], [], "Rollout conditions require combustion inspection.", 500, 3500, "heat-exchanger-replacement", "If you smell gas, leave the area and call a technician."),
    c(brand, "51", "Thermostat Communication Error", "The board lost communication with a smart thermostat.", "call-pro-soon", ["Incompatible stat", "Loose wire", "Board comm fault"], ["Verify thermostat compatibility.", "Reseat wiring.", "Power-cycle once."], "May need thermostat or board replacement.", 100, 400, "thermostat-replacement"),
    c(brand, "61", "Condensate Overflow", "The condensate safety switch detected a drainage problem.", "diy-possible", ["Clogged trap", "Full pump", "Frozen drain"], ["Clear condensate trap.", "Check drain hose.", "Reset pump if equipped."], "If drainage is clear, replace the switch or pump.", 150, 450, "condensate-pump-replacement"),
  ];
}

DATA.rheem = rheemFamily("Rheem");
DATA.ruud = rheemFamily("Ruud");

// Amana (Goodman sister — E-codes)
function amanaCodes(): ReturnType<typeof c>[] {
  const base = DATA.goodman.slice(0, 15);
  return base.map((entry) => ({
    ...entry,
    title: entry.title.replace("Goodman", "Amana"),
  }));
}
DATA.amana = amanaCodes();

// York / Luxaire family
function yorkFamily(brand: string): ReturnType<typeof c>[] {
  return [
    c(brand, "1 Blink", "Ignition Failure", "One blink indicates the furnace failed to light during the ignition trial.", "call-pro-soon", ["Failed ignitor", "Gas valve issue", "Dirty flame sensor"], ["Verify gas is on.", "Reset once.", "Watch for ignitor glow."], "Ignition failures need ignitor or gas valve service.", 150, 450, "ignitor-replacement"),
    c(brand, "2 Blinks", "Pressure Switch Open", "Two blinks mean the pressure switch did not close.", "call-pro-soon", ["Blocked vent", "Failed inducer", "Loose pressure hose"], ["Inspect vent.", "Check pressure tubing.", "Clear condensate."], "Replace switch or inducer if needed.", 175, 900, "pressure-switch-replacement"),
    c(brand, "3 Blinks", "Limit Switch Open", "Three blinks signal the high-limit switch opened.", "call-pro-soon", ["Dirty filter", "Weak blower", "Closed vents"], ["Replace filter.", "Open vents.", "Cool before reset."], "Repeated trips need limit or blower service.", 150, 600, "limit-switch-replacement"),
    c(brand, "4 Blinks", "Rollout Switch Open", "Four blinks indicate the rollout switch tripped.", "emergency", ["Cracked heat exchanger", "Blocked flue", "Flame rollout"], [], "Rollout requires combustion safety inspection.", 500, 3500, "heat-exchanger-replacement", "If you smell gas, leave the area and call a technician."),
    c(brand, "5 Blinks", "Flame Sense Failure", "Five blinks mean flame was not proven after ignition.", "call-pro-soon", ["Dirty flame sensor", "Weak ignitor", "Gas pressure low"], ["Clean flame sensor.", "Verify burners light.", "Reset once."], "Replace sensor or ignitor if fault persists.", 100, 450, "flame-sensor-cleaning"),
    c(brand, "6 Blinks", "Gas Valve Fault", "Six blinks indicate a gas valve circuit problem.", "emergency", ["Failed gas valve", "Board relay fault", "Loose wiring"], [], "Gas valve faults need licensed repair.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
    c(brand, "7 Blinks", "Blower Motor Fault", "Seven blinks signal a blower motor error.", "call-pro-soon", ["Failed blower", "Bad capacitor", "Restricted wheel"], ["Turn off power.", "Check blower wheel.", "Verify door switch."], "Blower motor replacement is usually required.", 450, 1200, "blower-motor-replacement"),
    c(brand, "8 Blinks", "Inducer Motor Fault", "Eight blinks indicate the inducer did not start.", "call-pro-soon", ["Seized inducer", "Blocked vent", "Failed capacitor"], ["Clear vent.", "Listen for inducer hum.", "Do not force motor."], "Inducer replacement if motor will not run.", 400, 900, "inducer-motor-replacement"),
    c(brand, "9 Blinks", "Control Board Fault", "Nine blinks mean the control board detected an internal fault.", "call-pro-soon", ["Surge damage", "Moisture", "Failed relay"], ["Turn off power.", "Inspect for moisture.", "Check condensate routing."], "Board replacement is typically needed.", 300, 800, "control-board-replacement"),
    c(brand, "10 Blinks", "Low Flame Signal", "Ten blinks indicate weak flame current during operation.", "call-pro-soon", ["Dirty sensor", "Draft issue", "Low gas pressure"], ["Clean sensor.", "Ensure returns open.", "Test one cycle."], "Gas pressure and venting should be checked.", 100, 400, "flame-sensor-cleaning"),
    c(brand, "11 Blinks", "Reverse Polarity", "Eleven blinks suggest reversed line/neutral wiring.", "call-pro-soon", ["Reversed disconnect wiring", "Missing ground", "Improper install"], ["Turn off power.", "Do not operate until wiring is verified."], "Have wiring corrected by a qualified technician.", 150, 350, "control-board-replacement"),
    c(brand, "12 Blinks", "Condensate Blockage", "Twelve blinks indicate a condensate drainage fault on high-efficiency models.", "diy-possible", ["Clogged trap", "Frozen drain", "Full pump"], ["Clear condensate trap.", "Check drain line.", "Reset pump if present."], "Replace pump or switch if drainage is clear.", 150, 450, "condensate-pump-replacement"),
    c(brand, "13 Blinks", "External Lockout", "Thirteen blinks mean an external safety opened the circuit.", "call-pro-soon", ["Tripped limit", "Open rollout", "Loose harness"], ["Turn off power.", "Check access panels.", "Allow cooldown before reset."], "Identify which external safety opened.", 150, 600, "limit-switch-replacement"),
    c(brand, "14 Blinks", "Thermostat Fault", "Fourteen blinks indicate a thermostat signal problem.", "diy-possible", ["Stat off or in cool", "Loose wire", "Dead batteries"], ["Set stat to heat.", "Replace batteries.", "Check furnace door."], "Wiring service if stat is calling but code remains.", 100, 350, "thermostat-replacement"),
    c(brand, "15 Blinks", "Ignitor Circuit Fault", "Fifteen blinks mean the ignitor circuit failed a check.", "call-pro-soon", ["Cracked ignitor", "Open wire", "Board fault"], ["Turn off power.", "Inspect ignitor.", "Reseat connector."], "Replace ignitor or call for board service.", 150, 450, "ignitor-replacement"),
    c(brand, "16 Blinks", "Flame Lost During Run", "Sixteen blinks indicate flame was lost while heating.", "call-pro-soon", ["Dirty sensor", "Draft", "Cracked exchanger"], ["Clean sensor.", "Check for soot.", "Reset once."], "Flame loss during run needs professional inspection.", 100, 3500, "flame-sensor-cleaning"),
  ];
}

DATA.york = yorkFamily("York");
DATA.luxaire = yorkFamily("Luxaire");

// ICP family (Heil, Tempstar)
function icpFamily(brand: string): ReturnType<typeof c>[] {
  return [
    c(brand, "1 Flash", "Ignition Failure", "One flash indicates failed ignition during the trial period.", "call-pro-soon", ["Worn ignitor", "Gas valve issue", "Dirty sensor"], ["Verify gas on.", "Reset once.", "Watch ignition cycle."], "Ignition service usually needed.", 150, 450, "ignitor-replacement"),
    c(brand, "2 Flash", "Pressure Switch Open", "Two flashes mean the pressure switch did not close.", "call-pro-soon", ["Blocked vent", "Failed inducer", "Loose hose"], ["Inspect vent.", "Check tubing.", "Clear condensate."], "Switch or inducer replacement may be needed.", 175, 900, "pressure-switch-replacement"),
    c(brand, "3 Flash", "Limit Switch Open", "Three flashes signal high-limit switch opened.", "call-pro-soon", ["Dirty filter", "Weak blower", "Closed vents"], ["Replace filter.", "Open vents.", "Cool before reset."], "Limit or blower service if repeated.", 150, 600, "limit-switch-replacement"),
    c(brand, "4 Flash", "Rollout Trip", "Four flashes indicate rollout switch opened.", "emergency", ["Heat exchanger issue", "Blocked flue", "Flame rollout"], [], "Rollout requires combustion inspection.", 500, 3500, "heat-exchanger-replacement", "If you smell gas, leave the area and call a technician."),
    c(brand, "5 Flash", "Flame Sense Error", "Five flashes mean flame was not proven.", "call-pro-soon", ["Dirty sensor", "Weak flame", "Loose wire"], ["Clean sensor.", "Verify ignition.", "Reset once."], "Sensor replacement if cleaning fails.", 100, 300, "flame-sensor-cleaning"),
    c(brand, "6 Flash", "Gas Valve Fault", "Six flashes indicate gas valve circuit error.", "emergency", ["Failed valve", "Relay fault", "Loose wiring"], [], "Licensed gas valve service required.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
    c(brand, "7 Flash", "Blower Fault", "Seven flashes signal blower motor error.", "call-pro-soon", ["Failed motor", "Bad capacitor", "Debris in wheel"], ["Turn off power.", "Check blower wheel.", "Verify door closed."], "Blower motor replacement usually required.", 450, 1200, "blower-motor-replacement"),
    c(brand, "8 Flash", "Inducer Fault", "Eight flashes indicate inducer motor problem.", "call-pro-soon", ["Seized inducer", "Blocked vent", "Failed capacitor"], ["Clear vent.", "Listen for hum.", "Do not force motor."], "Inducer replacement if needed.", 400, 900, "inducer-motor-replacement"),
    c(brand, "9 Flash", "Board Fault", "Nine flashes mean control board internal error.", "call-pro-soon", ["Surge damage", "Moisture", "Failed relay"], ["Turn off power.", "Inspect for moisture.", "Check condensate."], "Board replacement typically required.", 300, 800, "control-board-replacement"),
    c(brand, "10 Flash", "Low Flame", "Ten flashes indicate weak flame signal.", "call-pro-soon", ["Dirty sensor", "Draft", "Low gas"], ["Clean sensor.", "Open returns.", "Test cycle."], "Gas and venting checks if persistent.", 100, 400, "flame-sensor-cleaning"),
  ];
}

DATA.heil = icpFamily("Heil");
DATA.tempstar = icpFamily("Tempstar");

// Coleman
DATA.coleman = [
  c("Coleman", "3 Blinks", "Pressure Switch Fault", "Three blinks indicate the pressure switch did not close during venting.", "call-pro-soon", ["Blocked vent", "Failed inducer", "Loose hose"], ["Inspect vent.", "Check pressure tubing.", "Clear condensate."], "Switch or inducer service if needed.", 175, 900, "pressure-switch-replacement"),
  c("Coleman", "4 Blinks", "Open Limit", "Four blinks signal the limit switch opened from overheating.", "call-pro-soon", ["Dirty filter", "Weak blower", "Closed vents"], ["Replace filter.", "Open vents.", "Cool before reset."], "Limit or blower service if repeated.", 150, 600, "limit-switch-replacement"),
  c("Coleman", "5 Blinks", "Flame Failure", "Five blinks mean flame was not detected after ignition.", "call-pro-soon", ["Dirty sensor", "Failed ignitor", "Gas issue"], ["Clean sensor.", "Verify gas on.", "Reset once."], "Ignitor or sensor service needed.", 150, 450, "ignitor-replacement"),
  c("Coleman", "6 Blinks", "Rollout Trip", "Six blinks indicate rollout switch opened.", "emergency", ["Heat exchanger crack", "Blocked flue", "Flame rollout"], [], "Rollout requires combustion inspection.", 500, 3500, "heat-exchanger-replacement", "If you smell gas, leave the area and call a technician."),
  c("Coleman", "7 Blinks", "Gas Valve Error", "Seven blinks indicate gas valve circuit fault.", "emergency", ["Failed valve", "Relay fault", "Loose wire"], [], "Licensed gas valve repair required.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
  c("Coleman", "8 Blinks", "Ignitor Fault", "Eight blinks mean ignitor circuit failure.", "call-pro-soon", ["Cracked ignitor", "Open wire", "Board fault"], ["Turn off power.", "Inspect ignitor.", "Reseat plug."], "Replace ignitor if cracked.", 150, 450, "ignitor-replacement"),
  c("Coleman", "9 Blinks", "Blower Fault", "Nine blinks signal blower motor error.", "call-pro-soon", ["Failed motor", "Bad capacitor", "Obstruction"], ["Turn off power.", "Check wheel.", "Verify door."], "Blower replacement usually needed.", 450, 1200, "blower-motor-replacement"),
  c("Coleman", "10 Blinks", "Inducer Fault", "Ten blinks indicate inducer motor problem.", "call-pro-soon", ["Seized inducer", "Blocked vent", "Failed capacitor"], ["Clear vent.", "Listen for hum.", "Do not force."], "Inducer replacement if needed.", 400, 900, "inducer-motor-replacement"),
  c("Coleman", "11 Blinks", "Control Fault", "Eleven blinks mean board internal error.", "call-pro-soon", ["Surge", "Moisture", "Relay failure"], ["Turn off power.", "Check for moisture.", "Inspect condensate."], "Board replacement typically required.", 300, 800, "control-board-replacement"),
  c("Coleman", "12 Blinks", "Low Flame", "Twelve blinks indicate weak flame signal.", "call-pro-soon", ["Dirty sensor", "Draft", "Low gas"], ["Clean sensor.", "Open returns.", "Test once."], "Gas and venting checks if persistent.", 100, 400, "flame-sensor-cleaning"),
];

// Daikin
DATA.daikin = [
  c("Daikin", "A01", "Ignition Failure", "The furnace failed to establish flame during the ignition sequence.", "call-pro-soon", ["Worn ignitor", "Gas valve fault", "Dirty flame sensor"], ["Verify gas supply.", "Reset once.", "Watch ignition cycle."], "Ignitor or sensor service usually needed.", 150, 450, "ignitor-replacement"),
  c("Daikin", "A02", "Flame Loss", "Flame was lost during heating operation.", "call-pro-soon", ["Dirty sensor", "Draft issue", "Low gas pressure"], ["Clean flame sensor.", "Check returns.", "Reset once."], "Professional inspection if flame loss repeats.", 100, 400, "flame-sensor-cleaning"),
  c("Daikin", "A03", "Pressure Switch Open", "The pressure switch did not close during venting.", "call-pro-soon", ["Blocked vent", "Failed inducer", "Loose hose"], ["Inspect vent.", "Check tubing.", "Clear condensate."], "Switch or inducer replacement may be needed.", 175, 900, "pressure-switch-replacement"),
  c("Daikin", "A04", "Limit Switch Open", "The high-limit switch opened from overheating.", "call-pro-soon", ["Dirty filter", "Weak blower", "Closed vents"], ["Replace filter.", "Open vents.", "Cool before reset."], "Limit or blower service if repeated.", 150, 600, "limit-switch-replacement"),
  c("Daikin", "A05", "Rollout Switch Open", "The rollout switch tripped during burner operation.", "emergency", ["Heat exchanger issue", "Blocked flue", "Flame rollout"], [], "Rollout requires combustion inspection.", 500, 3500, "heat-exchanger-replacement", "If you smell gas, leave the area and call a technician."),
  c("Daikin", "A06", "Gas Valve Fault", "The control detected a gas valve circuit error.", "emergency", ["Failed valve", "Relay fault", "Loose wiring"], [], "Licensed gas valve service required.", 350, 900, "gas-valve-replacement", "If you smell gas, leave the house and call your gas utility before anything else."),
  c("Daikin", "A07", "Blower Motor Fault", "The blower motor did not start or tripped.", "call-pro-soon", ["Failed motor", "Bad capacitor", "Obstruction"], ["Turn off power.", "Check wheel.", "Verify door."], "Blower replacement usually required.", 450, 1200, "blower-motor-replacement"),
  c("Daikin", "A08", "Inducer Motor Fault", "The inducer motor failed during venting.", "call-pro-soon", ["Seized inducer", "Blocked vent", "Failed capacitor"], ["Clear vent.", "Listen for hum.", "Do not force."], "Inducer replacement if needed.", 400, 900, "inducer-motor-replacement"),
  c("Daikin", "A09", "Control Board Fault", "The control board reported an internal error.", "call-pro-soon", ["Surge damage", "Moisture", "Failed relay"], ["Turn off power.", "Inspect for moisture.", "Check condensate."], "Board replacement typically required.", 300, 800, "control-board-replacement"),
  c("Daikin", "A10", "Condensate Fault", "A condensate drainage fault triggered lockout on high-efficiency models.", "diy-possible", ["Clogged trap", "Full pump", "Frozen drain"], ["Clear trap.", "Check drain line.", "Reset pump."], "Replace pump or switch if drainage is clear.", 150, 450, "condensate-pump-replacement"),
];

const codesDir = path.join(process.cwd(), "data", "codes");
fs.mkdirSync(codesDir, { recursive: true });

for (const [slug, codes] of Object.entries(DATA)) {
  fs.writeFileSync(path.join(codesDir, `${slug}.json`), JSON.stringify(codes, null, 2) + "\n");
  console.log(`Wrote ${slug}.json (${codes.length} codes)`);
}

console.log(`\nTotal brands seeded: ${Object.keys(DATA).length}`);
console.log(`Total codes: ${Object.values(DATA).reduce((n, arr) => n + arr.length, 0)}`);

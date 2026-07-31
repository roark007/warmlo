/** Maps repair slugs from FixCode pages to nearest QuoteCheck job type. */
export const repairToJobType: Record<string, string> = {
  "ignitor-replacement": "furnace-replacement-gas-80",
  "flame-sensor-cleaning": "furnace-replacement-gas-80",
  "limit-switch-replacement": "furnace-replacement-gas-80",
  "pressure-switch-replacement": "furnace-replacement-gas-80",
  "blower-motor-replacement": "furnace-replacement-gas-80",
  "control-board-replacement": "furnace-replacement-gas-80",
  "inducer-motor-replacement": "furnace-replacement-gas-80",
  "gas-valve-replacement": "furnace-replacement-gas-80",
  "thermostat-replacement": "furnace-replacement-gas-80",
  "thermocouple-replacement": "furnace-replacement-gas-80",
  "capacitor-replacement": "ac-condenser-2-3-ton",
  "heat-exchanger-replacement": "furnace-replacement-gas-96",
  "condensate-pump-replacement": "furnace-replacement-gas-96",
  "filter-replacement": "furnace-replacement-gas-80",
  "furnace-replacement-80": "furnace-replacement-gas-80",
  "furnace-replacement-96": "furnace-replacement-gas-96",
  "ac-condenser-replacement": "ac-condenser-2-3-ton",
  "full-hvac-system-replacement": "full-system-furnace-ac",
};

export function repairSlugToJobType(repairSlug: string): string {
  return repairToJobType[repairSlug] ?? "furnace-replacement-gas-80";
}

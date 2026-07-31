import { describe, expect, it } from "vitest";
import { computeVerdict } from "../src/lib/verdict";

const furnace96Benchmark = {
  fairLow: 4500,
  fairHigh: 8000,
  redFlagAbovePct: 40,
  factors: [
    { id: "ductwork-mods", label: "Ductwork modifications included", adjustPct: 20 },
  ],
};

describe("computeVerdict", () => {
  it("returns fair for price 6000 with no factors", () => {
    const result = computeVerdict(furnace96Benchmark, 6000, []);
    expect(result.verdict).toBe("fair");
    expect(result.adjustedLow).toBe(4500);
    expect(result.adjustedHigh).toBe(8000);
  });

  it("returns suspiciously-low for price 3500 with no factors", () => {
    const result = computeVerdict(furnace96Benchmark, 3500, []);
    expect(result.verdict).toBe("suspiciously-low");
  });

  it("returns high for price 9000 with no factors", () => {
    const result = computeVerdict(furnace96Benchmark, 9000, []);
    expect(result.verdict).toBe("high");
  });

  it("returns red-flag for price 12000 with no factors", () => {
    const result = computeVerdict(furnace96Benchmark, 12000, []);
    expect(result.verdict).toBe("red-flag");
  });

  it("returns fair for price 9000 with one +20% factor", () => {
    const result = computeVerdict(furnace96Benchmark, 9000, ["ductwork-mods"]);
    expect(result.verdict).toBe("fair");
    expect(result.adjustedLow).toBe(5400);
    expect(result.adjustedHigh).toBe(9600);
  });
});

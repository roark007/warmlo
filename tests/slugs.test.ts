import { describe, expect, it } from "vitest";
import { codeToSlug } from "../src/lib/slugs";

describe("codeToSlug", () => {
  it('converts "E4" to "e4"', () => {
    expect(codeToSlug("E4")).toBe("e4");
  });

  it('converts "33" to "33"', () => {
    expect(codeToSlug("33")).toBe("33");
  });

  it('converts "Lc" to "lc"', () => {
    expect(codeToSlug("Lc")).toBe("lc");
  });

  it('rejects "E 4" with spaces', () => {
    expect(() => codeToSlug("E 4")).toThrow();
  });

  it("rejects empty strings", () => {
    expect(() => codeToSlug("")).toThrow();
    expect(() => codeToSlug("   ")).toThrow();
  });
});

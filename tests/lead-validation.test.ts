import { describe, expect, it } from "vitest";
import { leadSchema } from "../src/lib/lead";

const validPayload = {
  name: "Jane Homeowner",
  zip: "90210",
  phone: "5551234567",
  email: "jane@example.com",
  jobType: "furnace-replacement-gas-96",
  quotedPrice: 7500,
  tcpaConsent: true as const,
};

describe("leadSchema", () => {
  it("accepts a fully valid payload", () => {
    const result = leadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects missing TCPA consent", () => {
    const result = leadSchema.safeParse({ ...validPayload, tcpaConsent: false });
    expect(result.success).toBe(false);
  });

  it("rejects invalid ZIP (must be 5 digits)", () => {
    expect(leadSchema.safeParse({ ...validPayload, zip: "9021" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...validPayload, zip: "902101" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...validPayload, zip: "abcde" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = leadSchema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

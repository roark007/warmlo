import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  zip: z.string().regex(/^\d{5}$/, "ZIP must be 5 digits"),
  phone: z.string().min(10, "Phone is required"),
  email: z.string().email("Invalid email address"),
  jobType: z.string().min(1, "Job type is required"),
  quotedPrice: z.number().optional(),
  tcpaConsent: z.literal(true, { message: "TCPA consent is required" }),
  sourcePage: z.string().optional(),
});

export type LeadPayload = z.infer<typeof leadSchema>;

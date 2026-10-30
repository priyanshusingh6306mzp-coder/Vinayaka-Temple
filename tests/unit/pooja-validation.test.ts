import { describe, it, expect } from "vitest";
import { poojaRequestSchema } from "@/schemas/poojaRequest.schema";

describe("Pooja Request Validation Schema", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  it("accepts a valid pooja request payload", () => {
    const validData = {
      name: "Ramesh Sharma",
      phone: "9876543210",
      email: "ramesh@example.com",
      poojaType: "sankashti_ganapathi_homam",
      dateRequested: tomorrowStr,
      notes: "Seeking blessings for family health.",
      honeypot: "",
    };

    const result = poojaRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid Indian phone number", () => {
    const invalidPhoneData = {
      name: "Ramesh Sharma",
      phone: "12345", // too short, does not start with 6-9
      poojaType: "sankashti_ganapathi_homam",
      dateRequested: tomorrowStr,
    };

    const result = poojaRequestSchema.safeParse(invalidPhoneData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.phone).toBeDefined();
    }
  });

  it("rejects a preferred date in the past", () => {
    const pastDateData = {
      name: "Ramesh Sharma",
      phone: "9876543210",
      poojaType: "sankashti_ganapathi_homam",
      dateRequested: yesterdayStr,
    };

    const result = poojaRequestSchema.safeParse(pastDateData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.dateRequested).toBeDefined();
    }
  });

  it("rejects oversized name and notes", () => {
    const oversizedData = {
      name: "A".repeat(105), // max 100
      phone: "9876543210",
      poojaType: "sankashti_ganapathi_homam",
      dateRequested: tomorrowStr,
      notes: "N".repeat(505), // max 500
    };

    const result = poojaRequestSchema.safeParse(oversizedData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.name).toBeDefined();
      expect(fieldErrors.notes).toBeDefined();
    }
  });

  it("allows honeypot in schema so server action can inspect and silently drop", () => {
    const botData = {
      name: "Bot User",
      phone: "9876543210",
      poojaType: "sankashti_ganapathi_homam",
      dateRequested: tomorrowStr,
      honeypot: "spam_content_from_bot",
    };

    const result = poojaRequestSchema.safeParse(botData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.honeypot).toBe("spam_content_from_bot");
    }
  });
});

import { describe, it, expect } from "vitest";
import { changePasswordSchema } from "@/schemas/auth.schema";

describe("Auth Security & Password Rules", () => {
  it("rejects new password shorter than 10 characters", () => {
    const input = {
      currentPassword: "InitialPassword123!",
      newPassword: "Short9!",
      confirmPassword: "Short9!",
    };

    const res = changePasswordSchema.safeParse(input);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.newPassword).toBeDefined();
    }
  });

  it("rejects new password if identical to current temporary password", () => {
    const input = {
      currentPassword: "InitialPassword123!",
      newPassword: "InitialPassword123!",
      confirmPassword: "InitialPassword123!",
    };

    const res = changePasswordSchema.safeParse(input);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.newPassword).toContain(
        "New password cannot be the same as your current password"
      );
    }
  });

  it("rejects password confirmation mismatch", () => {
    const input = {
      currentPassword: "InitialPassword123!",
      newPassword: "BrandNewSecurePassword123!",
      confirmPassword: "MismatchedPassword123!",
    };

    const res = changePasswordSchema.safeParse(input);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.confirmPassword).toContain(
        "New passwords do not match"
      );
    }
  });

  it("accepts a strong, distinct new password", () => {
    const input = {
      currentPassword: "InitialPassword123!",
      newPassword: "TemplePurohit@2026#Secure",
      confirmPassword: "TemplePurohit@2026#Secure",
    };

    const res = changePasswordSchema.safeParse(input);
    expect(res.success).toBe(true);
  });
});

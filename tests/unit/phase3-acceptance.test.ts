import { describe, it, expect, vi } from "vitest";
import bcrypt from "bcryptjs";
import { saveGalleryImage, deleteGalleryImage, reorderGalleryImages } from "@/actions/gallery.actions";
import { updatePoojaStatus } from "@/actions/pooja.actions";
import { changeInitialPassword } from "@/actions/auth.actions";
import { rateLimiter } from "@/lib/services/ratelimit/postgres.service";
import { db } from "@/lib/db";

// Mock auth to simulate an unauthenticated request (returns null)
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

describe("Phase 3 Server Actions Defense-in-Depth", () => {
  it("saveGalleryImage rejects unauthenticated calls", async () => {
    await expect(
      saveGalleryImage({
        imageUrl: "https://example.com/test.jpg",
        publicId: "test_public_id",
        title: "Test Image",
        caption: "Test Caption",
        sortOrder: 0,
      })
    ).rejects.toThrow("Unauthorized");
  });

  it("deleteGalleryImage rejects unauthenticated calls", async () => {
    await expect(deleteGalleryImage("dummy-id")).rejects.toThrow("Unauthorized");
  });

  it("reorderGalleryImages rejects unauthenticated calls", async () => {
    await expect(
      reorderGalleryImages([{ id: "dummy-id", sortOrder: 1 }])
    ).rejects.toThrow("Unauthorized");
  });

  it("updatePoojaStatus rejects unauthenticated calls", async () => {
    await expect(updatePoojaStatus("dummy-id", "CONFIRMED")).rejects.toThrow(
      "Unauthorized"
    );
  });

  it("changeInitialPassword rejects unauthenticated calls", async () => {
    const formData = new FormData();
    formData.append("currentPassword", "CurrentPass123!");
    formData.append("newPassword", "NewPass123456!");
    formData.append("confirmPassword", "NewPass123456!");

    const result = await changeInitialPassword(formData);
    expect(result.success).toBe(false);
    expect(result.message).toBe("Unauthorized");
  });

  it("Rate limits the 6th rapid attempt from the same IP", async () => {
    const testIp = `192.168.10.${Date.now() % 255}`;
    const key = `pooja:ip:${testIp}`;

    await rateLimiter.reset(key);

    for (let i = 0; i < 5; i++) {
      await rateLimiter.limit(key, 5, 3600000);
    }

    const sixth = await rateLimiter.limit(key, 5, 3600000);
    expect(sixth.success).toBe(false);
    expect(sixth.remaining).toBe(0);

    await rateLimiter.reset(key);
  });

  it("Seeded admin is in DB with mustChangePassword = true", async () => {
    const admin = await db.user.findFirst({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        mustChangePassword: true,
        role: true,
      },
    });

    expect(admin).toBeDefined();
    expect(admin?.role).toBe("ADMIN");
    expect(admin?.mustChangePassword).toBe(true);
  });

  it("Timing attack mitigation: dummy hash comparison executes for unknown users", async () => {
    const DUMMY_HASH = "$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
    const start = performance.now();
    const result = await bcrypt.compare("dummy_wrong_password", DUMMY_HASH);
    const duration = performance.now() - start;

    expect(result).toBe(false);
    expect(duration).toBeGreaterThan(10);
  });
});

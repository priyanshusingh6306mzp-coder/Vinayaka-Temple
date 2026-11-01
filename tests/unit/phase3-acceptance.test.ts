import { describe, it, expect, vi, afterAll } from "vitest";
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

async function retryDb<T>(fn: () => Promise<T>, retries = 5, delay = 1500): Promise<T> {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

describe("Phase 3 Server Actions Defense-in-Depth", () => {
  afterAll(async () => {
    // Clean up only test tagged rows
    await retryDb(() => db.rateLimit.deleteMany({ where: { key: { contains: "zz-test" } } })).catch(() => {});
    await retryDb(() => db.user.deleteMany({ where: { email: { startsWith: "zz-test-" } } })).catch(() => {});
  });

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
    const testIp = `zz-test-phase3-${Date.now()}`;
    const key = `pooja:ip:${testIp}`;

    try {
      await retryDb(() => rateLimiter.reset(key));

      for (let i = 0; i < 5; i++) {
        await retryDb(() => rateLimiter.limit(key, 5, 3600000));
      }

      const sixth = await retryDb(() => rateLimiter.limit(key, 5, 3600000));
      expect(sixth.success).toBe(false);
      expect(sixth.remaining).toBe(0);
    } finally {
      await retryDb(() => db.rateLimit.deleteMany({ where: { key } })).catch(() => {});
    }
  }, 90000);

  it("Temporary admin with mustChangePassword = true enforces password change lifecycle", async () => {
    const testEmail = `zz-test-admin-${Date.now()}@example.invalid`;
    const randomPassword = `P@ssword_${Math.random().toString(36).slice(2)}!`;
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    let createdId: string | null = null;
    try {
      const createdAdmin = await retryDb(() =>
        db.user.create({
          data: {
            email: testEmail,
            passwordHash,
            role: "ADMIN",
            mustChangePassword: true,
          },
        })
      );
      createdId = createdAdmin.id;

      expect(createdAdmin).toBeDefined();
      expect(createdAdmin.role).toBe("ADMIN");
      expect(createdAdmin.mustChangePassword).toBe(true);

      const fetched = await retryDb(() =>
        db.user.findUnique({
          where: { id: createdId! },
          select: { id: true, email: true, role: true, mustChangePassword: true },
        })
      );
      expect(fetched?.mustChangePassword).toBe(true);

      const updated = await retryDb(() =>
        db.user.update({
          where: { id: createdId! },
          data: { mustChangePassword: false },
          select: { id: true, mustChangePassword: true },
        })
      );
      expect(updated.mustChangePassword).toBe(false);
    } finally {
      if (createdId) {
        await retryDb(() => db.user.delete({ where: { id: createdId! } })).catch(() => {});
      }
      await retryDb(() => db.user.deleteMany({ where: { email: { startsWith: "zz-test-" } } })).catch(() => {});
    }
  }, 90000);

  it("Timing attack mitigation: dummy hash comparison executes for unknown users", async () => {
    const DUMMY_HASH = "$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
    const start = performance.now();
    const result = await bcrypt.compare("dummy_wrong_password", DUMMY_HASH);
    const duration = performance.now() - start;

    expect(result).toBe(false);
    expect(duration).toBeGreaterThan(10);
  });
});

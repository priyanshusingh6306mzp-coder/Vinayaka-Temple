import { describe, it, expect, afterAll } from "vitest";
import { db } from "@/lib/db";

async function retry<T>(fn: () => Promise<T>, retries = 5, delay = 1500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

describe("Global Database Hygiene Teardown Check", () => {
  afterAll(async () => {
    await db.$disconnect();
  });

  it("ensures zero tagged test pooja requests remain in database", async () => {
    const leftoverPooja = await retry(() =>
      db.poojaRequest.count({
        where: {
          OR: [
            { name: { startsWith: "ZZ-TEST-" } },
            { name: { startsWith: "Test Devotee" } },
          ],
        },
      })
    );
    expect(leftoverPooja).toBe(0);
  });

  it("ensures zero tagged test temple events remain in database", async () => {
    const leftoverEvents = await retry(() =>
      db.templeEvent.count({
        where: {
          title: { startsWith: "ZZ-TEST-" },
        },
      })
    );
    expect(leftoverEvents).toBe(0);
  });

  it("ensures zero tagged test gallery images remain in database", async () => {
    const leftoverImages = await retry(() =>
      db.galleryImage.count({
        where: {
          OR: [
            { title: { startsWith: "ZZ-TEST-" } },
            { publicId: { startsWith: "zz-test-" } },
          ],
        },
      })
    );
    expect(leftoverImages).toBe(0);
  });

  it("ensures zero test rate limits remain in database", async () => {
    const leftoverLimits = await retry(() =>
      db.rateLimit.count({
        where: {
          OR: [
            { key: { contains: "zz-test" } },
            { key: { contains: "test" } },
          ],
        },
      })
    );
    expect(leftoverLimits).toBe(0);
  });

  it("ensures zero test users remain in database", async () => {
    const leftoverUsers = await retry(() =>
      db.user.count({
        where: {
          email: { startsWith: "zz-test-" },
        },
      })
    );
    expect(leftoverUsers).toBe(0);
  });
});

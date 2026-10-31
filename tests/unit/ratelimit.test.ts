import { describe, it, expect, afterAll } from "vitest";
import { rateLimiter } from "@/lib/services/ratelimit/postgres.service";
import { db } from "@/lib/db";

describe("Postgres-backed Rate Limiter", () => {
  const testKey = `zz-test:ip:192.168.1.${Date.now()}`;

  const cleanup = async () => {
    let retries = 5;
    while (retries > 0) {
      try {
        await db.rateLimit.deleteMany({
          where: { key: testKey },
        });
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  };

  afterAll(async () => {
    await cleanup();
  }, 30000);

  it("permits requests within max limit (5 attempts)", async () => {
    for (let i = 1; i <= 5; i++) {
      const res = await rateLimiter.limit(testKey, 5, 60 * 1000);
      expect(res.success).toBe(true);
      expect(res.remaining).toBe(5 - i);
    }
  });

  it("blocks the 6th rapid request when limit is 5", async () => {
    const res = await rateLimiter.limit(testKey, 5, 60 * 1000);
    expect(res.success).toBe(false);
    expect(res.remaining).toBe(0);
  });

  it("allows new requests after reset", async () => {
    await rateLimiter.reset(testKey);
    const res = await rateLimiter.limit(testKey, 5, 60 * 1000);
    expect(res.success).toBe(true);
    expect(res.remaining).toBe(4);
  });
});

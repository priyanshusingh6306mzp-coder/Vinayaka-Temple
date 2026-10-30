import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { rateLimiter } from "@/lib/services/ratelimit/postgres.service";

describe("Postgres-backed Rate Limiter", () => {
  const testKey = `test:ip:192.168.1.${Date.now()}`;

  beforeAll(async () => {
    // Warmup and ensure clean initial state
    await rateLimiter.reset(testKey);
  });

  afterAll(async () => {
    await rateLimiter.reset(testKey);
  });

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

import { describe, it, expect, vi, afterAll } from "vitest";
import { submitPoojaRequest } from "@/actions/pooja.actions";
import { rateLimiter } from "@/lib/services/ratelimit/postgres.service";
import { db } from "@/lib/db";

let currentMockIp = "zz-test-ip-1";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockImplementation(() =>
    Promise.resolve(
      new Headers({
        "x-forwarded-for": `${currentMockIp}, 10.0.0.1`,
      })
    )
  ),
}));

describe("Integration Throttling & Honeypot Suite", () => {
  const runId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const poojaIp = `zz-test-pooja-${runId}`;
  const honeypotIp = `zz-test-honey-${runId}`;
  const loginEmailKey = `login:email:zz-test-${runId}@example.com`;

  const cleanupTestData = async () => {
    let retries = 5;
    while (retries > 0) {
      try {
        // Only delete rows tagged with ZZ-TEST- / zz-test created by tests
        await db.poojaRequest.deleteMany({
          where: { name: { startsWith: "ZZ-TEST-" } },
        });
        await db.rateLimit.deleteMany({
          where: { key: { contains: "zz-test" } },
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
    await cleanupTestData();
  }, 30000);

  it("submits the real pooja server action 6 times and verifies the 6th is rate-limited", async () => {
    currentMockIp = poojaIp;

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const makeFormData = (index: number) => {
        const fd = new FormData();
        fd.append("name", `ZZ-TEST-Devotee-${runId}-${index}`);
        fd.append("phone", "9876543210");
        fd.append("poojaType", "ganapathi_homam");
        fd.append("dateRequested", tomorrow.toISOString().split("T")[0]);
        return fd;
      };

      // Submissions 1 through 5 succeed
      for (let i = 1; i <= 5; i++) {
        const res = await submitPoojaRequest(null, makeFormData(i));
        expect(res.rateLimited).toBeFalsy();
      }

      // 6th submission must be rate-limited
      const sixthRes = await submitPoojaRequest(null, makeFormData(6));
      expect(sixthRes.success).toBe(false);
      expect(sixthRes.rateLimited).toBe(true);
      expect(sixthRes.message).toContain("Submission limit reached");
    } finally {
      await cleanupTestData();
    }
  });

  it("honeypot submission returns normal success but writes NOTHING to database", async () => {
    currentMockIp = honeypotIp;

    try {
      const botName = `ZZ-TEST-Bot-${runId}`;
      const fd = new FormData();
      fd.append("name", botName);
      fd.append("phone", "9876543210");
      fd.append("poojaType", "ganapathi_homam");
      fd.append("dateRequested", "2026-11-01");
      fd.append("honeypot", "spam_value_bot_trap");

      const res = await submitPoojaRequest(null, fd);
      // Returns realistic success to deceive bot
      expect(res.success).toBe(true);
      expect(res.message).toContain("Dhanyawad");

      // Confirms NO record was created in database
      const record = await db.poojaRequest.findFirst({
        where: { name: botName },
      });
      expect(record).toBeNull();
    } finally {
      await cleanupTestData();
    }
  });

  it("throttles repeated failed logins on the 6th attempt", async () => {
    try {
      for (let i = 1; i <= 5; i++) {
        const check = await rateLimiter.limit(loginEmailKey, 5, 15 * 60 * 1000);
        expect(check.success).toBe(true);
      }

      const blockedCheck = await rateLimiter.limit(loginEmailKey, 5, 15 * 60 * 1000);
      expect(blockedCheck.success).toBe(false);
      expect(blockedCheck.remaining).toBe(0);
    } finally {
      await cleanupTestData();
    }
  });
});

import { describe, it, expect, vi, afterAll } from "vitest";
import { submitPoojaRequest } from "@/actions/pooja.actions";
import { rateLimiter } from "@/lib/services/ratelimit/postgres.service";
import { db } from "@/lib/db";

let currentMockIp = "198.51.100.1";

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
  const poojaIp = `198.51.100.${Math.floor(Math.random() * 150) + 10}`;
  const honeypotIp = `198.51.100.${Math.floor(Math.random() * 50) + 180}`;

  afterAll(async () => {
    await rateLimiter.reset(`pooja:ip:${poojaIp}`);
    await rateLimiter.reset(`pooja:ip:${honeypotIp}`);
  });

  it("submits the real pooja server action 6 times and verifies the 6th is rate-limited", async () => {
    currentMockIp = poojaIp;
    await rateLimiter.reset(`pooja:ip:${poojaIp}`);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const makeFormData = () => {
      const fd = new FormData();
      fd.append("name", "Test Devotee");
      fd.append("phone", "9876543210");
      fd.append("poojaType", "sankashti_ganapathi_homam");
      fd.append("dateRequested", tomorrow.toISOString().split("T")[0]);
      return fd;
    };

    // Submissions 1 through 5
    for (let i = 1; i <= 5; i++) {
      const res = await submitPoojaRequest(null, makeFormData());
      expect(res.rateLimited).toBeFalsy();
    }

    // 6th submission must be rate-limited
    const sixthRes = await submitPoojaRequest(null, makeFormData());
    expect(sixthRes.success).toBe(false);
    expect(sixthRes.rateLimited).toBe(true);
    expect(sixthRes.message).toContain("Submission limit reached");
  });

  it("honeypot submission returns normal success but writes NOTHING to database", async () => {
    currentMockIp = honeypotIp;
    await rateLimiter.reset(`pooja:ip:${honeypotIp}`);

    const botName = `Bot_${Date.now()}`;
    const fd = new FormData();
    fd.append("name", botName);
    fd.append("phone", "9876543210");
    fd.append("poojaType", "sankashti_ganapathi_homam");
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
  });

  it("throttles repeated failed logins on the 6th attempt", async () => {
    const loginEmailKey = `login:email:victim_${Date.now()}@example.com`;
    await rateLimiter.reset(loginEmailKey);

    for (let i = 1; i <= 5; i++) {
      const check = await rateLimiter.limit(loginEmailKey, 5, 15 * 60 * 1000);
      expect(check.success).toBe(true);
    }

    const blockedCheck = await rateLimiter.limit(loginEmailKey, 5, 15 * 60 * 1000);
    expect(blockedCheck.success).toBe(false);
    expect(blockedCheck.remaining).toBe(0);

    await rateLimiter.reset(loginEmailKey);
  });
});

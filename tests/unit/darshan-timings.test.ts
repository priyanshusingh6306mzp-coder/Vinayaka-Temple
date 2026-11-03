import { describe, it, expect, vi, afterAll } from "vitest";
import {
  darshanTimingsSchema,
  format12Hour,
  formatDarshanTimings,
  getDarshanTimings,
  DEFAULT_DARSHAN_TIMINGS,
  DARSHAN_TIMINGS_SETTING_KEY,
} from "@/lib/darshan-timings";
import { getDarshanStatus } from "@/lib/darshan-status";
import {
  saveDarshanTimings,
  resetDarshanTimings,
} from "@/actions/timings.actions";
import { db } from "@/lib/db";

// Mock auth for actions test
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";

const TEST_SETTING_KEY = "zz-test-darshan_timings";

async function retryDb<T>(fn: () => Promise<T>, retries = 5, delay = 1500): Promise<T> {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await db.$disconnect().catch(() => {});
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

describe("Part 4: Darshan Timings Editable by Priest", () => {
  afterAll(async () => {
    // Clean up test setting rows only
    await retryDb(() =>
      db.siteSetting.deleteMany({
        where: { key: { startsWith: "zz-test" } },
      })
    ).catch(() => {});
  });

  describe("Validation Schema (darshanTimingsSchema)", () => {
    it("validates correct timings data", () => {
      const valid = {
        morning: { start: "06:00", end: "10:30" },
        evening: { start: "17:30", end: "20:30" },
      };
      const result = darshanTimingsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects non-HH:mm strings", () => {
      const invalid = {
        morning: { start: "6:00", end: "10:30" },
        evening: { start: "17:30", end: "20:30" },
      };
      const result = darshanTimingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects morning opening after or equal to morning closing", () => {
      const invalid = {
        morning: { start: "10:30", end: "10:30" },
        evening: { start: "17:30", end: "20:30" },
      };
      const result = darshanTimingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("earlier than closing time");
      }
    });

    it("rejects evening opening after or equal to evening closing", () => {
      const invalid = {
        morning: { start: "06:00", end: "10:30" },
        evening: { start: "21:00", end: "20:30" },
      };
      const result = darshanTimingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("earlier than closing time");
      }
    });

    it("rejects evening opening before morning closing", () => {
      const invalid = {
        morning: { start: "06:00", end: "12:00" },
        evening: { start: "11:30", end: "20:30" },
      };
      const result = darshanTimingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("after morning darshan closes");
      }
    });
  });

  describe("Time Formatting Helpers", () => {
    it("converts 24-hour HH:mm to 12-hour format properly", () => {
      expect(format12Hour("06:00")).toBe("6:00 AM");
      expect(format12Hour("10:30")).toBe("10:30 AM");
      expect(format12Hour("12:00")).toBe("12:00 PM");
      expect(format12Hour("17:30")).toBe("5:30 PM");
      expect(format12Hour("20:30")).toBe("8:30 PM");
      expect(format12Hour("00:00")).toBe("12:00 AM");
    });

    it("formats darshan timings object into summary and sessions", () => {
      const formatted = formatDarshanTimings({
        morning: { start: "06:00", end: "10:30" },
        evening: { start: "17:30", end: "20:30" },
      });
      expect(formatted.morning.formatted).toBe("6:00 AM – 10:30 AM");
      expect(formatted.evening.formatted).toBe("5:30 PM – 8:30 PM");
      expect(formatted.summary).toBe(
        "Morning 6:00 AM – 10:30 AM · Evening 5:30 PM – 8:30 PM"
      );
    });
  });

  describe("getDarshanTimings Fallback Safety", () => {
    it("falls back to site.ts defaults when setting row is missing", async () => {
      const res = await getDarshanTimings("zz-test-non-existent-key");
      expect(res.morning.start).toBe(DEFAULT_DARSHAN_TIMINGS.morning.start);
      expect(res.morning.end).toBe(DEFAULT_DARSHAN_TIMINGS.morning.end);
      expect(res.evening.start).toBe(DEFAULT_DARSHAN_TIMINGS.evening.start);
      expect(res.evening.end).toBe(DEFAULT_DARSHAN_TIMINGS.evening.end);
    });

    it("falls back to site.ts defaults when setting row has malformed JSON value", async () => {
      try {
        await retryDb(() =>
          db.siteSetting.create({
            data: {
              key: TEST_SETTING_KEY,
              value: { invalid: "garbage" },
            },
          })
        );

        const res = await getDarshanTimings(TEST_SETTING_KEY);
        expect(res.morning.start).toBe(DEFAULT_DARSHAN_TIMINGS.morning.start);
        expect(res.evening.end).toBe(DEFAULT_DARSHAN_TIMINGS.evening.end);
      } finally {
        await retryDb(() =>
          db.siteSetting.deleteMany({ where: { key: TEST_SETTING_KEY } })
        ).catch(() => {});
      }
    });

    it("reads custom valid timings when present", async () => {
      const custom = {
        morning: { start: "07:00", end: "11:00" },
        evening: { start: "18:00", end: "21:00" },
      };

      try {
        await retryDb(() =>
          db.siteSetting.create({
            data: {
              key: TEST_SETTING_KEY,
              value: custom,
            },
          })
        );

        const res = await getDarshanTimings(TEST_SETTING_KEY);
        expect(res.morning.start).toBe("07:00");
        expect(res.morning.end).toBe("11:00");
        expect(res.morning.formatted).toBe("7:00 AM – 11:00 AM");
        expect(res.evening.start).toBe("18:00");
        expect(res.evening.end).toBe("21:00");
        expect(res.evening.formatted).toBe("6:00 PM – 9:00 PM");
      } finally {
        await retryDb(() =>
          db.siteSetting.deleteMany({ where: { key: TEST_SETTING_KEY } })
        ).catch(() => {});
      }
    });
  });

  describe("Badge Boundary Tests with Parameterised Timings", () => {
    const customTimings = formatDarshanTimings({
      morning: { start: "07:00", end: "11:00" },
      evening: { start: "18:00", end: "21:00" },
    });

    it("evaluates open/closed based on custom timings", () => {
      // 06:30 IST: default is open, but custom (opens at 7:00) is closed
      const d1 = new Date("2026-10-30T06:30:00+05:30");
      const status1 = getDarshanStatus(d1, customTimings);
      expect(status1.isOpen).toBe(false);
      expect(status1.label).toBe("Opens at 7:00 AM");
      expect(status1.state).toBe("closed_morning");

      // 07:15 IST: custom is open
      const d2 = new Date("2026-10-30T07:15:00+05:30");
      const status2 = getDarshanStatus(d2, customTimings);
      expect(status2.isOpen).toBe(true);
      expect(status2.label).toBe("Open now · Morning darshan until 11:00 AM");
      expect(status2.state).toBe("open_morning");

      // 12:00 IST: between sessions
      const d3 = new Date("2026-10-30T12:00:00+05:30");
      const status3 = getDarshanStatus(d3, customTimings);
      expect(status3.isOpen).toBe(false);
      expect(status3.label).toBe("Opens at 6:00 PM");
      expect(status3.state).toBe("between_sessions");

      // 18:30 IST: evening darshan open
      const d4 = new Date("2026-10-30T18:30:00+05:30");
      const status4 = getDarshanStatus(d4, customTimings);
      expect(status4.isOpen).toBe(true);
      expect(status4.label).toBe("Open now · Evening darshan until 9:00 PM");
      expect(status4.state).toBe("open_evening");

      // 21:15 IST: closed night
      const d5 = new Date("2026-10-30T21:15:00+05:30");
      const status5 = getDarshanStatus(d5, customTimings);
      expect(status5.isOpen).toBe(false);
      expect(status5.label).toBe("Opens tomorrow at 7:00 AM");
      expect(status5.state).toBe("closed_night");
    });
  });

  describe("Server Actions Security & Lifecycle", () => {
    it("rejects saveDarshanTimings without an active session", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      const res = await saveDarshanTimings(
        {
          morning: { start: "06:00", end: "10:30" },
          evening: { start: "17:30", end: "20:30" },
        },
        TEST_SETTING_KEY
      );
      expect(res.success).toBe(false);
      expect(res.message).toContain("Unauthorized");
    });

    it("rejects resetDarshanTimings without an active session", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      const res = await resetDarshanTimings(TEST_SETTING_KEY);
      expect(res.success).toBe(false);
      expect(res.message).toContain("Unauthorized");
    });

    it("saves and resets timings with ADMIN session using test key", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "test-admin", role: "ADMIN", email: "admin@test.invalid" },
      } as any);

      try {
        const saveRes = await saveDarshanTimings(
          {
            morning: { start: "06:30", end: "10:30" },
            evening: { start: "18:00", end: "20:30" },
          },
          TEST_SETTING_KEY
        );
        expect(saveRes.success).toBe(true);

        const saved = await retryDb(() =>
          db.siteSetting.findUnique({
            where: { key: TEST_SETTING_KEY },
          })
        );
        expect(saved).toBeDefined();

        const resetRes = await resetDarshanTimings(TEST_SETTING_KEY);
        expect(resetRes.success).toBe(true);

        const afterReset = await retryDb(() =>
          db.siteSetting.findUnique({
            where: { key: TEST_SETTING_KEY },
          })
        );
        expect(afterReset).toBeNull();
      } finally {
        await retryDb(() =>
          db.siteSetting.deleteMany({ where: { key: TEST_SETTING_KEY } })
        ).catch(() => {});
      }
    });
  });
});

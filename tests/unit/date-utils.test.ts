import { describe, it, expect } from "vitest";
import {
  getKolkataDateString,
  getKolkataToday,
  formatDisplayDate,
  formatDisplayTime,
  getRelativeDateChip,
} from "@/lib/date-utils";

describe("Asia/Kolkata Date & Time Utilities Suite", () => {
  it("formats display dates correctly into 'Sat, 14 Nov 2026'", () => {
    const formatted = formatDisplayDate("2026-11-14");
    expect(formatted).toBe("Sat, 14 Nov 2026");

    const diwali = formatDisplayDate("2026-11-08");
    expect(diwali).toBe("Sun, 8 Nov 2026");
  });

  it("formats event times correctly into 12-hour format with AM/PM", () => {
    expect(formatDisplayTime("06:00")).toBe("6:00 AM");
    expect(formatDisplayTime("10:30")).toBe("10:30 AM");
    expect(formatDisplayTime("17:30")).toBe("5:30 PM");
    expect(formatDisplayTime("20:30")).toBe("8:30 PM");
    expect(formatDisplayTime("12:00")).toBe("12:00 PM");
    expect(formatDisplayTime("00:00")).toBe("12:00 AM");
    expect(formatDisplayTime(null)).toBeNull();
    expect(formatDisplayTime("")).toBeNull();
  });

  it("calculates relative date chips for Today, Yesterday, and Tomorrow", () => {
    // Reference date: 2026-10-31 10:00:00 IST
    const reference = new Date("2026-10-31T10:00:00+05:30");

    // Today (2026-10-31)
    expect(getRelativeDateChip("2026-10-31", reference)).toBe("Today");

    // Tomorrow (2026-11-01)
    expect(getRelativeDateChip("2026-11-01", reference)).toBe("Tomorrow");

    // In 5 days (2026-11-05)
    expect(getRelativeDateChip("2026-11-05", reference)).toBe("In 5 days");

    // Yesterday (2026-10-30) -> Should return null (not an upcoming chip)
    expect(getRelativeDateChip("2026-10-30", reference)).toBeNull();

    // Past date (2026-10-01) -> null
    expect(getRelativeDateChip("2026-10-01", reference)).toBeNull();
  });

  it("handles midnight boundaries in Asia/Kolkata timezone", () => {
    // 23:59 IST on 2026-10-31
    const lateNight = new Date("2026-10-31T23:59:00+05:30");
    expect(getKolkataDateString(lateNight)).toBe("2026-10-31");

    // 00:01 IST on 2026-11-01
    const earlyMorning = new Date("2026-11-01T00:01:00+05:30");
    expect(getKolkataDateString(earlyMorning)).toBe("2026-11-01");
  });

  it("generates a UTC midnight Date representing today in Asia/Kolkata", () => {
    const todayKolkata = getKolkataToday(new Date("2026-10-31T15:00:00+05:30"));
    expect(todayKolkata.toISOString()).toBe("2026-10-31T00:00:00.000Z");
  });
});

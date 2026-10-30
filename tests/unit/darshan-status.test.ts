import { describe, it, expect } from "vitest";
import { getDarshanStatus, FALLBACK_DARSHAN_STATUS } from "@/lib/darshan-status";

describe("Asia/Kolkata Darshan Status Boundary Tests", () => {
  it("exports a neutral fallback for SSR", () => {
    expect(FALLBACK_DARSHAN_STATUS).toBe("Daily darshan timings below");
  });

  it("handles 00:00 IST: closed, opens at 6:00 AM", () => {
    const d = new Date("2026-10-30T00:00:00+05:30");
    const status = getDarshanStatus(d);
    expect(status.isOpen).toBe(false);
    expect(status.label).toBe("Opens at 6:00 AM");
    expect(status.state).toBe("closed_morning");
  });

  it("handles 05:59 IST: closed, opens at 6:00 AM (1 minute before morning darshan)", () => {
    const d = new Date("2026-10-30T05:59:00+05:30");
    const status = getDarshanStatus(d);
    expect(status.isOpen).toBe(false);
    expect(status.label).toBe("Opens at 6:00 AM");
    expect(status.state).toBe("closed_morning");
  });

  it("handles 06:00 IST: open, morning darshan starts", () => {
    const d = new Date("2026-10-30T06:00:00+05:30");
    const status = getDarshanStatus(d);
    expect(status.isOpen).toBe(true);
    expect(status.label).toBe("Open now · Morning darshan until 11:30 AM");
    expect(status.state).toBe("open_morning");
  });

  it("handles 11:29 IST: open, last minute of morning darshan", () => {
    const d = new Date("2026-10-30T11:29:59+05:30");
    const status = getDarshanStatus(d);
    expect(status.isOpen).toBe(true);
    expect(status.label).toBe("Open now · Morning darshan until 11:30 AM");
    expect(status.state).toBe("open_morning");
  });

  it("handles 11:30 IST: closed, opens at 4:30 PM (between sessions)", () => {
    const d = new Date("2026-10-30T11:30:00+05:30");
    const status = getDarshanStatus(d);
    expect(status.isOpen).toBe(false);
    expect(status.label).toBe("Opens at 4:30 PM");
    expect(status.state).toBe("between_sessions");
  });

  it("handles 16:29 IST: closed, 1 minute before evening darshan", () => {
    const d = new Date("2026-10-30T16:29:00+05:30");
    const status = getDarshanStatus(d);
    expect(status.isOpen).toBe(false);
    expect(status.label).toBe("Opens at 4:30 PM");
    expect(status.state).toBe("between_sessions");
  });

  it("handles 16:30 IST: open, evening darshan starts", () => {
    const d = new Date("2026-10-30T16:30:00+05:30");
    const status = getDarshanStatus(d);
    expect(status.isOpen).toBe(true);
    expect(status.label).toBe("Open now · Evening darshan until 8:30 PM");
    expect(status.state).toBe("open_evening");
  });

  it("handles 20:29 IST: open, last minute of evening darshan", () => {
    const d = new Date("2026-10-30T20:29:59+05:30");
    const status = getDarshanStatus(d);
    expect(status.isOpen).toBe(true);
    expect(status.label).toBe("Open now · Evening darshan until 8:30 PM");
    expect(status.state).toBe("open_evening");
  });

  it("handles 20:30 IST: closed, opens tomorrow at 6:00 AM", () => {
    const d = new Date("2026-10-30T20:30:00+05:30");
    const status = getDarshanStatus(d);
    expect(status.isOpen).toBe(false);
    expect(status.label).toBe("Opens tomorrow at 6:00 AM");
    expect(status.state).toBe("closed_night");
  });

  it("handles 23:59 IST: closed, opens tomorrow at 6:00 AM (last minute of day)", () => {
    const d = new Date("2026-10-30T23:59:00+05:30");
    const status = getDarshanStatus(d);
    expect(status.isOpen).toBe(false);
    expect(status.label).toBe("Opens tomorrow at 6:00 AM");
    expect(status.state).toBe("closed_night");
  });
});

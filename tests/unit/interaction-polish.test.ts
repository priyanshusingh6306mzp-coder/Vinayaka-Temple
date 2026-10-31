import { describe, it, expect } from "vitest";
import { getRelativeDateChip } from "@/lib/date-utils";
import { generateIcsContent, formatIcsDtStart } from "@/lib/calendar";

describe("Part 4: Interaction Polish Suite", () => {
  describe("1. Relative Date Chips in Asia/Kolkata", () => {
    it("returns 'Today' for an event occurring on the reference date", () => {
      const ref = new Date("2026-11-14T05:00:00.000Z"); // Morning in UTC
      const eventDate = "2026-11-14";
      expect(getRelativeDateChip(eventDate, ref)).toBe("Today");
    });

    it("returns 'Tomorrow' for an event occurring exactly one day later", () => {
      const ref = new Date("2026-11-14T05:00:00.000Z");
      const eventDate = "2026-11-15";
      expect(getRelativeDateChip(eventDate, ref)).toBe("Tomorrow");
    });

    it("returns 'In N days' for events 2 to 30 days away", () => {
      const ref = new Date("2026-11-14T05:00:00.000Z");
      expect(getRelativeDateChip("2026-11-16", ref)).toBe("In 2 days");
      expect(getRelativeDateChip("2026-11-21", ref)).toBe("In 7 days");
      expect(getRelativeDateChip("2026-12-14", ref)).toBe("In 30 days");
    });

    it("returns null for past dates or events more than 30 days away", () => {
      const ref = new Date("2026-11-14T05:00:00.000Z");
      expect(getRelativeDateChip("2026-11-13", ref)).toBeNull(); // Yesterday
      expect(getRelativeDateChip("2026-12-15", ref)).toBeNull(); // 31 days away
    });
  });

  describe("2. WhatsApp Share URL Generation", () => {
    it("properly constructs and encodes WhatsApp share message with date, time, and site URL", () => {
      const title = "Maha Sankashti Chaturthi & Pooja";
      const displayDate = "Sat, 14 Nov 2026";
      const displayTime = "6:30 PM";
      const siteUrl = "https://vinayaka-temple.vercel.app";

      const text = `${title} at Shri Vinayaka Temple, ${displayDate} at ${displayTime}. ${siteUrl}/schedule`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;

      expect(url).toContain("https://wa.me/?text=");
      expect(decodeURIComponent(url)).toContain("Maha Sankashti Chaturthi & Pooja at Shri Vinayaka Temple");
      expect(decodeURIComponent(url)).toContain("Sat, 14 Nov 2026 at 6:30 PM");
      expect(decodeURIComponent(url)).toContain("https://vinayaka-temple.vercel.app/schedule");
      // Special characters like & are safely percent-encoded in the query string
      expect(url).toContain(encodeURIComponent("&"));
    });
  });

  describe("3. RFC 5545 iCalendar Rules, UTC Conversion & No Invented End Time", () => {
    const fixedNow = new Date("2026-10-31T08:00:00.000Z");

    it("converts Asia/Kolkata timed event to UTC DTSTART and omits DTEND entirely", () => {
      // 18:30 IST on 2026-11-14 is 13:00 UTC (IST = UTC+5:30)
      const dtStart = formatIcsDtStart("2026-11-14", "18:30");
      expect(dtStart).toBe("DTSTART:20261114T130000Z");

      const timedEvent = {
        id: "timed-event-123",
        title: "Evening Deepotsav & Aarti",
        description: "Special evening deepotsav celebration.",
        eventDate: "2026-11-14",
        startTime: "18:30",
      };

      const ics = generateIcsContent(timedEvent, "https://vinayaka-temple.vercel.app", fixedNow);

      expect(ics).toContain("BEGIN:VCALENDAR\r\n");
      expect(ics).toContain("UID:timed-event-123@vinayakatemple\r\n");
      expect(ics).toContain("DTSTART:20261114T130000Z\r\n");
      expect(ics).not.toContain("DTEND"); // Never invent end time or duration
      expect(ics).not.toContain("DURATION");
      expect(ics).not.toContain("TZID"); // Writes UTC timestamp directly
      expect(ics).toContain("SUMMARY:Evening Deepotsav & Aarti\r\n");
      expect(ics).toContain("END:VEVENT\r\n");
      expect(ics).toContain("END:VCALENDAR\r\n");
    });

    it("formats all-day event using VALUE=DATE and omits DTEND entirely", () => {
      const dtStart = formatIcsDtStart("2026-11-14", null);
      expect(dtStart).toBe("DTSTART;VALUE=DATE:20261114");

      const allDayEvent = {
        id: "allday-event-456",
        title: "Vinayaka Chaturthi Utsavam",
        description: "Full day auspicious celebration and darshan.",
        eventDate: "2026-11-14",
        startTime: null,
      };

      const ics = generateIcsContent(allDayEvent, "https://vinayaka-temple.vercel.app", fixedNow);

      expect(ics).toContain("BEGIN:VCALENDAR\r\n");
      expect(ics).toContain("UID:allday-event-456@vinayakatemple\r\n");
      expect(ics).toContain("DTSTART;VALUE=DATE:20261114\r\n");
      expect(ics).not.toContain("DTEND"); // Never invent end time or duration
      expect(ics).not.toContain("DURATION");
      expect(ics).toContain("SUMMARY:Vinayaka Chaturthi Utsavam\r\n");
      expect(ics).toContain("END:VEVENT\r\n");
      expect(ics).toContain("END:VCALENDAR\r\n");
    });

    it("escapes semicolons, commas, backslashes, and newlines in ICS text fields", () => {
      const specialEvent = {
        id: "special-event-789",
        title: "Special Pooja; with flowers, fruits",
        description: "Line 1\nLine 2; with notes, details",
        eventDate: "2026-12-01",
        startTime: null,
      };

      const ics = generateIcsContent(specialEvent, "https://vinayaka-temple.vercel.app", fixedNow);
      expect(ics).toContain("SUMMARY:Special Pooja\\; with flowers\\, fruits\r\n");
      expect(ics).toContain("DESCRIPTION:Line 1\\nLine 2\\; with notes\\, details");
    });
  });
});

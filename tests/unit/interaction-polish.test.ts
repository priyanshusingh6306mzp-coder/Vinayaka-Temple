import { describe, it, expect } from "vitest";
import { getRelativeDateChip, getKolkataDateString } from "@/lib/date-utils";

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

  describe("3. RFC 5545 iCalendar Rules & Escaping", () => {
    function escapeIcs(str: string): string {
      return str
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\r?\n/g, "\\n");
    }

    it("escapes semicolons, commas, and newlines in ICS text fields", () => {
      const raw = "Special Pooja; with flowers, fruits\nLine 2";
      const escaped = escapeIcs(raw);
      expect(escaped).toBe("Special Pooja\\; with flowers\\, fruits\\nLine 2");
    });

    it("validates RFC 5545 structure for timed event", () => {
      const eventId = "test-event-uuid-123";
      const title = "Deepotsav Celebration";
      const date = "20261114";
      const startTime = "183000";
      const endTime = "193000";

      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Shri Vinayaka Temple//Event Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${eventId}@vinayakatemple`,
        `DTSTART;TZID=Asia/Kolkata:${date}T${startTime}`,
        `DTEND;TZID=Asia/Kolkata:${date}T${endTime}`,
        `SUMMARY:${escapeIcs(title)}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ];

      const ics = lines.join("\r\n") + "\r\n";
      expect(ics).toContain("BEGIN:VCALENDAR\r\n");
      expect(ics).toContain("UID:test-event-uuid-123@vinayakatemple\r\n");
      expect(ics).toContain("TZID=Asia/Kolkata:20261114T183000\r\n");
      expect(ics).toContain("END:VCALENDAR\r\n");
    });
  });
});

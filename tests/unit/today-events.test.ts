import { describe, it, expect, beforeAll, afterAll } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { db } from "@/lib/db";
import { getTodayEvents } from "@/lib/events";
import {
  getKolkataToday,
  getKolkataDateString,
  formatDisplayTime,
} from "@/lib/date-utils";
import { EVENT_CATEGORY_LABELS } from "@/schemas/events";
import { TodayEventCard, TodayEventItem } from "@/components/public/TodayEventCard";

describe("Part 5: Today's Event Card & Logic Suite", () => {
  // -------------------------------------------------------------
  // 1. Pure Unit Tests: Date Boundaries, Timings, & Categories
  // -------------------------------------------------------------
  describe("1. Asia/Kolkata Date Boundaries & Formatting", () => {
    it("identifies 23:59:00 in Asia/Kolkata as current day", () => {
      // 2026-11-03 23:59:00 IST is 2026-11-03 18:29:00 UTC
      const d1 = new Date("2026-11-03T18:29:00.000Z");
      expect(getKolkataDateString(d1)).toBe("2026-11-03");
    });

    it("identifies 00:00:30 on the next day in Asia/Kolkata as tomorrow", () => {
      // 2026-11-04 00:00:30 IST is 2026-11-03 18:30:30 UTC
      const d2 = new Date("2026-11-03T18:30:30.000Z");
      expect(getKolkataDateString(d2)).toBe("2026-11-04");
    });

    it("generates correct UTC midnight Date for Prisma queries", () => {
      const d = new Date("2026-11-03T12:00:00.000Z");
      const kolkataToday = getKolkataToday(d);
      expect(kolkataToday.toISOString()).toBe("2026-11-03T00:00:00.000Z");
    });

    it("formats 24h time strings to 12h display times with AM/PM", () => {
      expect(formatDisplayTime("06:30")).toBe("6:30 AM");
      expect(formatDisplayTime("18:30")).toBe("6:30 PM");
      expect(formatDisplayTime("12:00")).toBe("12:00 PM");
      expect(formatDisplayTime("00:15")).toBe("12:15 AM");
      expect(formatDisplayTime(null)).toBeNull();
      expect(formatDisplayTime(undefined)).toBeNull();
    });

    it("contains user-friendly labels for all event categories", () => {
      expect(EVENT_CATEGORY_LABELS.SANKASHTI).toBe("Sankashti Chaturthi");
      expect(EVENT_CATEGORY_LABELS.FESTIVAL).toBe("Festival / Utsavam");
      expect(EVENT_CATEGORY_LABELS.SPECIAL_POOJA).toBe("Special Pooja");
      expect(EVENT_CATEGORY_LABELS.OTHER).toBe("Temple Event");
    });
  });

  // -------------------------------------------------------------
  // 2. Component Structure, Accessibility & Heading Rules
  // -------------------------------------------------------------
  describe("2. TodayEventCard Component Architecture", () => {
    it("renders nothing (returns null) when events array is empty", () => {
      const html = renderToString(React.createElement(TodayEventCard, { events: [] }));
      expect(html).toBe("");
    });

    it("does not render any heading tags (h1-h6) to maintain strict 1-h1 page outline", () => {
      const sampleEvents: TodayEventItem[] = [
        {
          id: "evt-1",
          title: "Maha Ganapati Homam",
          category: "SPECIAL_POOJA",
          eventDate: "2026-11-03",
          startTime: "09:00",
          description: "Special morning pooja with sankalpa.",
        },
      ];

      const html = renderToString(React.createElement(TodayEventCard, { events: sampleEvents }));

      // Strict check: zero heading tags
      expect(html).not.toMatch(/<h[1-6]/i);
      expect(html).not.toMatch(/<\/h[1-6]>/i);
      // Accessible region label
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label="Today&#x27;s event at the temple"');
      expect(html).toContain("Maha Ganapati Homam");
      expect(html).toContain("9:00 AM");
      expect(html).toContain("Special Pooja");
    });

    it("renders secondary event preview when 2 events are present", () => {
      const sampleEvents: TodayEventItem[] = [
        {
          id: "evt-1",
          title: "Morning Abhishekam",
          category: "SPECIAL_POOJA",
          eventDate: "2026-11-03",
          startTime: "07:00",
          description: "Morning holy bath.",
        },
        {
          id: "evt-2",
          title: "Evening Maha Aarti",
          category: "FESTIVAL",
          eventDate: "2026-11-03",
          startTime: "19:00",
          description: "Grand aarti and deepotsavam.",
        },
      ];

      const html = renderToString(React.createElement(TodayEventCard, { events: sampleEvents }));
      expect(html).toContain("Morning Abhishekam");
      expect(html).toContain("Evening Maha Aarti");
      expect(html).toContain("View details");
    });

    it("shows '+N more' in action link when more than 2 events are scheduled today", () => {
      const sampleEvents: TodayEventItem[] = [
        {
          id: "evt-1",
          title: "Event 1",
          category: "OTHER",
          eventDate: "2026-11-03",
          startTime: "07:00",
          description: null,
        },
        {
          id: "evt-2",
          title: "Event 2",
          category: "OTHER",
          eventDate: "2026-11-03",
          startTime: "12:00",
          description: null,
        },
        {
          id: "evt-3",
          title: "Event 3",
          category: "OTHER",
          eventDate: "2026-11-03",
          startTime: "18:00",
          description: null,
        },
      ];

      const html = renderToString(React.createElement(TodayEventCard, { events: sampleEvents }));
      expect(html).toContain("View all today&#x27;s events (3)");
    });
  });

  // -------------------------------------------------------------
  // 3. Database Query & Isolation (ZZ-TEST- tag with full cleanup)
  // -------------------------------------------------------------
  describe("3. Database Today Query (getTodayEvents)", () => {
    const todayStr = getKolkataDateString(new Date());
    const todayDate = getKolkataToday();

    // Compute yesterday and tomorrow dates
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);

    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);

    const testEventIds: string[] = [];

    const cleanupTestData = async () => {
      let retries = 5;
      while (retries > 0) {
        try {
          await db.templeEvent.deleteMany({
            where: {
              title: { startsWith: "ZZ-TEST-" },
            },
          });
          break;
        } catch (err) {
          retries--;
          await db.$disconnect().catch(() => {});
          if (retries === 0) throw err;
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    };

    beforeAll(async () => {
      await cleanupTestData();

      // 1. Today morning event (published)
      const evMorning = await db.templeEvent.create({
        data: {
          title: "ZZ-TEST-Today-Morning-Abhishekam",
          category: "SPECIAL_POOJA",
          eventDate: todayDate,
          startTime: "08:00",
          published: true,
        },
      });
      testEventIds.push(evMorning.id);

      // 2. Today evening event (published)
      const evEvening = await db.templeEvent.create({
        data: {
          title: "ZZ-TEST-Today-Evening-Aarti",
          category: "FESTIVAL",
          eventDate: todayDate,
          startTime: "18:30",
          published: true,
        },
      });
      testEventIds.push(evEvening.id);

      // 3. Today draft event (published: false) -> must be excluded
      const evDraft = await db.templeEvent.create({
        data: {
          title: "ZZ-TEST-Today-Draft-Event",
          category: "OTHER",
          eventDate: todayDate,
          startTime: "12:00",
          published: false,
        },
      });
      testEventIds.push(evDraft.id);

      // 4. Yesterday event -> must be excluded
      const evYesterday = await db.templeEvent.create({
        data: {
          title: "ZZ-TEST-Yesterday-Event",
          category: "OTHER",
          eventDate: yesterdayDate,
          startTime: "10:00",
          published: true,
        },
      });
      testEventIds.push(evYesterday.id);

      // 5. Tomorrow event -> must be excluded
      const evTomorrow = await db.templeEvent.create({
        data: {
          title: "ZZ-TEST-Tomorrow-Event",
          category: "OTHER",
          eventDate: tomorrowDate,
          startTime: "10:00",
          published: true,
        },
      });
      testEventIds.push(evTomorrow.id);
    }, 30000);

    afterAll(async () => {
      await cleanupTestData();
    }, 30000);

    it("fetches only today's published events sorted by startTime asc", async () => {
      const todayEvents = await getTodayEvents();
      const testEvents = todayEvents.filter((e) => e.title.startsWith("ZZ-TEST-"));

      // Must have exactly the 2 published today events
      expect(testEvents.length).toBe(2);

      // Ordered by startTime ascending
      expect(testEvents[0].title).toBe("ZZ-TEST-Today-Morning-Abhishekam");
      expect(testEvents[0].startTime).toBe("08:00");

      expect(testEvents[1].title).toBe("ZZ-TEST-Today-Evening-Aarti");
      expect(testEvents[1].startTime).toBe("18:30");

      // Verify draft, yesterday, and tomorrow are not included
      const titles = testEvents.map((e) => e.title);
      expect(titles).not.toContain("ZZ-TEST-Today-Draft-Event");
      expect(titles).not.toContain("ZZ-TEST-Yesterday-Event");
      expect(titles).not.toContain("ZZ-TEST-Tomorrow-Event");
    });
  });
});

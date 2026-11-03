import { z } from "zod";
import { db } from "@/lib/db";
import { DARSHAN_SESSIONS } from "@/content/site";

export interface SessionTiming {
  start: string; // "HH:mm" (24h)
  end: string;   // "HH:mm" (24h)
}

export interface DarshanTimingsData {
  morning: SessionTiming;
  evening: SessionTiming;
}

export interface FormattedSession {
  start: string;       // "06:00"
  end: string;         // "10:30"
  openDisplay: string; // "6:00 AM"
  closeDisplay: string;// "10:30 AM"
  formatted: string;   // "6:00 AM – 10:30 AM"
}

export interface FormattedDarshanTimings {
  morning: FormattedSession;
  evening: FormattedSession;
  summary: string;     // "Morning 6:00 AM – 10:30 AM · Evening 5:30 PM – 8:30 PM"
  raw: DarshanTimingsData;
}

export const DARSHAN_TIMINGS_SETTING_KEY = "darshan_timings";

export const DEFAULT_DARSHAN_TIMINGS: DarshanTimingsData = {
  morning: {
    start: DARSHAN_SESSIONS.morning.opens, // "06:00"
    end: DARSHAN_SESSIONS.morning.closes,   // "10:30"
  },
  evening: {
    start: DARSHAN_SESSIONS.evening.opens, // "17:30"
    end: DARSHAN_SESSIONS.evening.closes,   // "20:30"
  },
};

/**
 * Converts "HH:mm" (24h) to "h:mm A" (12h).
 * e.g. "06:00" -> "6:00 AM", "17:30" -> "5:30 PM", "12:00" -> "12:00 PM"
 */
export function format12Hour(timeHHmm: string): string {
  if (!timeHHmm || !timeHHmm.includes(":")) return timeHHmm;
  const [hStr, mStr] = timeHHmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return timeHHmm;

  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m.toString().padStart(2, "0");
  return `${displayH}:${displayM} ${period}`;
}

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const darshanTimingsSchema = z
  .object({
    morning: z.object({
      start: z
        .string()
        .regex(timeRegex, "Please enter a valid time in HH:mm format (e.g. 06:00)"),
      end: z
        .string()
        .regex(timeRegex, "Please enter a valid time in HH:mm format (e.g. 10:30)"),
    }),
    evening: z.object({
      start: z
        .string()
        .regex(timeRegex, "Please enter a valid time in HH:mm format (e.g. 17:30)"),
      end: z
        .string()
        .regex(timeRegex, "Please enter a valid time in HH:mm format (e.g. 20:30)"),
    }),
  })
  .refine(
    (data) => data.morning.start < data.morning.end,
    {
      message: "Morning darshan opening time must be earlier than closing time",
      path: ["morning", "end"],
    }
  )
  .refine(
    (data) => data.evening.start < data.evening.end,
    {
      message: "Evening darshan opening time must be earlier than closing time",
      path: ["evening", "end"],
    }
  )
  .refine(
    (data) => data.morning.end < data.evening.start,
    {
      message: "Evening darshan opening time must be after morning darshan closes",
      path: ["evening", "start"],
    }
  );

/**
 * Formats raw timings into display strings.
 */
export function formatDarshanTimings(
  data: DarshanTimingsData
): FormattedDarshanTimings {
  const morningOpen = format12Hour(data.morning.start);
  const morningClose = format12Hour(data.morning.end);
  const eveningOpen = format12Hour(data.evening.start);
  const eveningClose = format12Hour(data.evening.end);

  const morningFormatted = `${morningOpen} – ${morningClose}`;
  const eveningFormatted = `${eveningOpen} – ${eveningClose}`;

  return {
    morning: {
      start: data.morning.start,
      end: data.morning.end,
      openDisplay: morningOpen,
      closeDisplay: morningClose,
      formatted: morningFormatted,
    },
    evening: {
      start: data.evening.start,
      end: data.evening.end,
      openDisplay: eveningOpen,
      closeDisplay: eveningClose,
      formatted: eveningFormatted,
    },
    summary: `Morning ${morningFormatted} · Evening ${eveningFormatted}`,
    raw: data,
  };
}

async function retryDb<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
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

/**
 * Reads darshan timings from the database setting.
 * Falls back safely to site.ts defaults if the row is missing, invalid, or read fails.
 */
export async function getDarshanTimings(
  settingKey: string = DARSHAN_TIMINGS_SETTING_KEY
): Promise<FormattedDarshanTimings> {
  try {
    const row = await retryDb(() =>
      db.siteSetting.findUnique({
        where: { key: settingKey },
      })
    );

    if (row && row.value) {
      const parsed = darshanTimingsSchema.safeParse(row.value);
      if (parsed.success) {
        return formatDarshanTimings(parsed.data);
      }
    }
  } catch (err) {
    console.error("[getDarshanTimings] Error reading database setting, falling back to defaults:", err);
  }

  return formatDarshanTimings(DEFAULT_DARSHAN_TIMINGS);
}

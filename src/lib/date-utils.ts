/**
 * Asia/Kolkata Date & Time Utilities
 */

/**
 * Returns today's date in Asia/Kolkata formatted as YYYY-MM-DD.
 */
export function getKolkataDateString(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return parts; // "YYYY-MM-DD"
}

/**
 * Returns a UTC midnight Date representing today in Asia/Kolkata,
 * suitable for Prisma @db.Date comparisons.
 */
export function getKolkataToday(date: Date = new Date()): Date {
  const dateStr = getKolkataDateString(date);
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/**
 * Formats a Date or YYYY-MM-DD string into "Sat, 14 Nov 2026" in Asia/Kolkata.
 */
export function formatDisplayDate(date: Date | string): string {
  let d: Date;
  if (typeof date === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      d = new Date(`${date}T12:00:00.000Z`);
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }

  const weekday = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short" }).format(d);
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "numeric" }).format(d);
  const month = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", month: "short" }).format(d);
  const year = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", year: "numeric" }).format(d);

  return `${weekday}, ${day} ${month} ${year}`;
}

/**
 * Formats "HH:mm" time string into "6:30 PM" (12h format).
 */
export function formatDisplayTime(timeHHmm: string | null | undefined): string | null {
  if (!timeHHmm || !/^\d{1,2}:\d{2}$/.test(timeHHmm)) return null;
  const [hStr, mStr] = timeHHmm.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return null;

  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minutePadded = m < 10 ? `0${m}` : `${m}`;
  return `${hour12}:${minutePadded} ${period}`;
}

/**
 * Calculates calendar-day relative chip ("Today", "Tomorrow", "In N days", or null)
 * using calendar-day granularity in Asia/Kolkata.
 */
export function getRelativeDateChip(
  eventDate: Date | string,
  referenceDate: Date = new Date()
): string | null {
  const eventDateStr =
    typeof eventDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(eventDate)
      ? eventDate
      : getKolkataDateString(typeof eventDate === "string" ? new Date(eventDate) : eventDate);

  const refDateStr = getKolkataDateString(referenceDate);

  const [eY, eM, eD] = eventDateStr.split("-").map(Number);
  const [rY, rM, rD] = refDateStr.split("-").map(Number);

  const eUtc = Date.UTC(eY, eM - 1, eD);
  const rUtc = Date.UTC(rY, rM - 1, rD);

  const diffDays = Math.round((eUtc - rUtc) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays <= 30) return `In ${diffDays} days`;
  return null;
}

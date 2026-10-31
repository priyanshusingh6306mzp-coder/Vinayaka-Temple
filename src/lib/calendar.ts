import { SITE_CONFIG } from "@/content/site";
import { getKolkataDateString } from "@/lib/date-utils";

export function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function formatUtcTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

/**
 * Converts Asia/Kolkata date (YYYY-MM-DD) and optional time (HH:mm) to UTC iCalendar string.
 */
export function formatIcsDtStart(dateStr: string, startTime?: string | null): string {
  const compactDate = dateStr.replace(/-/g, "");

  if (startTime && /^\d{1,2}:\d{2}$/.test(startTime)) {
    const [h, m] = startTime.split(":").map(Number);
    const [year, month, day] = dateStr.split("-").map(Number);

    // Asia/Kolkata is UTC+05:30 with no daylight saving time
    const kolkataUtcMs = Date.UTC(year, month - 1, day, h, m, 0) - (5 * 60 + 30) * 60 * 1000;
    const utcDate = new Date(kolkataUtcMs);

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const utcTimeStr =
      utcDate.getUTCFullYear().toString() +
      pad(utcDate.getUTCMonth() + 1) +
      pad(utcDate.getUTCDate()) +
      "T" +
      pad(utcDate.getUTCHours()) +
      pad(utcDate.getUTCMinutes()) +
      "00Z";

    return `DTSTART:${utcTimeStr}`;
  }

  // All-day event: use VALUE=DATE (no invented end time or duration)
  return `DTSTART;VALUE=DATE:${compactDate}`;
}

export function generateIcsContent(
  event: {
    id: string;
    title: string;
    eventDate: Date | string;
    startTime?: string | null;
    description?: string | null;
    [key: string]: unknown;
  },
  origin: string = "https://vinayaka-temple.vercel.app",
  now: Date = new Date()
): string {
  const dtstamp = formatUtcTimestamp(now);
  const dateStr =
    typeof event.eventDate === "string"
      ? event.eventDate.split("T")[0]
      : getKolkataDateString(event.eventDate);
  const dtstartLine = formatIcsDtStart(dateStr, event.startTime);

  const cleanTitle = escapeIcsText(event.title.trim());
  const cleanDesc = event.description
    ? escapeIcsText(event.description.trim())
    : `${cleanTitle} at ${SITE_CONFIG.name}`;

  const address = escapeIcsText(SITE_CONFIG.location.fullAddress);
  const eventUrl = `${origin.replace(/\/$/, "")}/schedule`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shri Vinayaka Temple//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@vinayakatemple`,
    `DTSTAMP:${dtstamp}`,
    dtstartLine,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}\\n\\nVenue: ${address}\\nInfo: ${eventUrl}`,
    `LOCATION:${address}`,
    `URL:${eventUrl}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n") + "\r\n";
}

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/content/site";
import { getKolkataDateString } from "@/lib/date-utils";

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatUtcTimestamp(date: Date = new Date()): string {
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return new Response("Missing event ID", { status: 400 });
  }

  const event = await db.templeEvent.findFirst({
    where: {
      id,
      published: true,
    },
  });

  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vinayaka-temple.vercel.app";
  const dateStr = getKolkataDateString(event.eventDate); // "YYYY-MM-DD"
  const compactDate = dateStr.replace(/-/g, ""); // "YYYYMMDD"
  const dtStamp = formatUtcTimestamp();

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shri Vinayaka Temple//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@vinayakatemple`,
    `DTSTAMP:${dtStamp}`,
  ];

  if (event.startTime && /^\d{1,2}:\d{2}$/.test(event.startTime)) {
    const [hStr, mStr] = event.startTime.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const timeFormatted = `${pad(h)}${pad(m)}00`;

    // Calculate end time 1 hour later
    const endH = (h + 1) % 24;
    const endTimeFormatted = `${pad(endH)}${pad(m)}00`;

    lines.push(`DTSTART;TZID=Asia/Kolkata:${compactDate}T${timeFormatted}`);
    lines.push(`DTEND;TZID=Asia/Kolkata:${compactDate}T${endTimeFormatted}`);
  } else {
    // All-day event
    lines.push(`DTSTART;VALUE=DATE:${compactDate}`);
    lines.push(`DTEND;VALUE=DATE:${compactDate}`);
  }

  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);

  const desc = event.description
    ? `${event.description}\n\nVenue: ${SITE_CONFIG.location.fullAddress}\nInfo: ${siteUrl}/schedule`
    : `Sacred celebration at Shri Vinayaka Temple.\nVenue: ${SITE_CONFIG.location.fullAddress}\nInfo: ${siteUrl}/schedule`;

  lines.push(`DESCRIPTION:${escapeIcsText(desc)}`);
  lines.push(`LOCATION:${escapeIcsText(SITE_CONFIG.location.fullAddress)}`);
  lines.push(`URL:${siteUrl}/schedule`);
  lines.push("STATUS:CONFIRMED");
  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  // CRLF line endings per RFC 5545
  const icsContent = lines.join("\r\n") + "\r\n";

  return new Response(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="event-${event.id}.ics"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

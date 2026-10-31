import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { generateIcsContent } from "@/lib/calendar";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return new Response("Missing event ID", { status: 400 });
  }

  const event = await db.templeEvent.findUnique({
    where: { id },
  });

  if (!event || !event.published) {
    return new Response("Event not found", { status: 404 });
  }

  const ics = generateIcsContent(event);

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="event-${event.id}.ics"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

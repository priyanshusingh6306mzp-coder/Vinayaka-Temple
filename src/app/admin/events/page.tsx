import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { EventsManager, SerializedEvent } from "@/components/admin/EventsManager";
import { getKolkataDateString } from "@/lib/date-utils";

export const metadata = {
  title: "Events Manager | Shri Vinayaka Temple",
};

export default async function AdminEventsPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/admin/login");
  }

  const pendingCount = await db.poojaRequest.count({
    where: { status: "PENDING" },
  });

  const rawEvents = await db.templeEvent.findMany({
    orderBy: { eventDate: "desc" },
    include: {
      _count: {
        select: { images: true },
      },
    },
  });

  const serializedEvents: SerializedEvent[] = rawEvents.map((evt) => ({
    id: evt.id,
    title: evt.title,
    category: evt.category,
    eventDate: getKolkataDateString(evt.eventDate),
    startTime: evt.startTime,
    description: evt.description,
    published: evt.published,
    photoCount: evt._count.images,
  }));

  return (
    <div className="min-h-screen bg-temple-ivory/60 flex flex-col w-full overflow-x-hidden">
      <AdminNav pendingCount={pendingCount} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 overflow-hidden">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-temple-charcoal tracking-tight">
            Temple Events &amp; Festivals
          </h1>
          <p className="text-xs sm:text-sm text-temple-warmGrey mt-0.5">
            Manage upcoming Sankashti Chaturthi, festival dates, and attach photo galleries.
          </p>
        </div>

        <EventsManager initialEvents={serializedEvents} />
      </main>
    </div>
  );
}

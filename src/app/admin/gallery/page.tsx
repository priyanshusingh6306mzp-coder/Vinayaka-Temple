import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { GalleryManager, SerializedGalleryImage, SimpleEvent } from "@/components/admin/GalleryManager";
import { getKolkataDateString } from "@/lib/date-utils";

export const metadata = {
  title: "Gallery Manager | Shri Vinayaka Temple",
};

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams?: Promise<{ eventId?: string }>;
}) {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/admin/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialEventId = resolvedSearchParams?.eventId;

  // Fetch pending requests for badge counter
  const pendingCount = await db.poojaRequest.count({
    where: { status: "PENDING" },
  });

  // Fetch all events for the "Add photos to:" picker
  const rawEvents = await db.templeEvent.findMany({
    orderBy: { eventDate: "desc" },
    select: { id: true, title: true, eventDate: true },
  });

  const serializedEvents: SimpleEvent[] = rawEvents.map((ev) => ({
    id: ev.id,
    title: ev.title,
    eventDate: getKolkataDateString(ev.eventDate),
  }));

  // Fetch all gallery images ordered by sortOrder
  const rawImages = await db.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { uploadedAt: "desc" }],
    include: {
      event: { select: { id: true, title: true } },
    },
  });

  const serializedImages: SerializedGalleryImage[] = rawImages.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    publicId: img.publicId,
    title: img.title,
    caption: img.caption,
    sortOrder: img.sortOrder,
    eventId: img.eventId,
    featured: img.featured,
    featuredOrder: img.featuredOrder,
    event: img.event,
  }));

  return (
    <div className="min-h-screen bg-temple-ivory/60 flex flex-col w-full overflow-x-hidden">
      <AdminNav pendingCount={pendingCount} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-temple-charcoal tracking-tight">
              Temple Gallery Manager
            </h1>
            <p className="text-xs sm:text-sm text-temple-warmGrey mt-0.5">
              Upload, organize, and attach photos to events, or feature up to 4 on the temple homepage.
            </p>
          </div>
        </div>

        <GalleryManager
          initialImages={serializedImages}
          events={serializedEvents}
          initialEventId={initialEventId}
        />
      </main>
    </div>
  );
}

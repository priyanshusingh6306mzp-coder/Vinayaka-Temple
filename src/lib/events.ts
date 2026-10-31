import { db } from "@/lib/db";
import { getKolkataToday } from "@/lib/date-utils";

/**
 * Returns the nearest upcoming published event (eventDate today or later in Asia/Kolkata).
 */
export async function getNextEvent() {
  const today = getKolkataToday();
  return db.templeEvent.findFirst({
    where: {
      published: true,
      eventDate: { gte: today },
    },
    orderBy: [
      { eventDate: "asc" },
      { startTime: "asc" },
    ],
  });
}

/**
 * Returns all upcoming published events (eventDate today or later in Asia/Kolkata),
 * sorted by eventDate ascending, then startTime ascending.
 */
export async function getUpcomingEvents() {
  const today = getKolkataToday();
  return db.templeEvent.findMany({
    where: {
      published: true,
      eventDate: { gte: today },
    },
    orderBy: [
      { eventDate: "asc" },
      { startTime: "asc" },
    ],
  });
}

/**
 * Returns events that have at least one image, ordered newest eventDate first.
 * Includes total photo count and up to 4 preview images.
 */
export async function getAlbums() {
  const events = await db.templeEvent.findMany({
    where: {
      published: true,
      images: { some: {} },
    },
    orderBy: { eventDate: "desc" },
    include: {
      _count: {
        select: { images: true },
      },
      images: {
        take: 4,
        orderBy: [{ sortOrder: "asc" }, { uploadedAt: "desc" }],
        select: {
          id: true,
          imageUrl: true,
          publicId: true,
          title: true,
          caption: true,
        },
      },
    },
  });

  return events.map((ev) => ({
    id: ev.id,
    title: ev.title,
    category: ev.category,
    eventDate: ev.eventDate,
    description: ev.description,
    totalPhotos: ev._count.images,
    previewImages: ev.images,
  }));
}

/**
 * Returns the requested published event and all its photos, ordered by sortOrder then uploadedAt.
 */
export async function getAlbum(id: string) {
  return db.templeEvent.findFirst({
    where: {
      id,
      published: true,
    },
    include: {
      images: {
        orderBy: [{ sortOrder: "asc" }, { uploadedAt: "desc" }],
      },
    },
  });
}

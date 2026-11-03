import { db } from "@/lib/db";
import { getKolkataToday } from "@/lib/date-utils";

/**
 * Resilience helper for database calls against serverless Postgres (Neon).
 */
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
 * Returns all published events occurring today in Asia/Kolkata,
 * ordered by startTime ascending, then title ascending.
 */
export async function getTodayEvents(date: Date = new Date()) {
  const today = getKolkataToday(date);
  try {
    return await retryDb(async () => {
      return db.templeEvent.findMany({
        where: {
          published: true,
          eventDate: today,
        },
        orderBy: [
          { startTime: "asc" },
          { title: "asc" },
        ],
      });
    });
  } catch (err) {
    console.error("[getTodayEvents Error]", err);
    return [];
  }
}

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
 * Includes total photo count and up to 4 preview images. Supports pagination.
 */
export async function getAlbums(page: number = 1, pageSize: number = 12) {
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * pageSize;

  const [total, events] = await Promise.all([
    db.templeEvent.count({
      where: {
        published: true,
        images: { some: {} },
      },
    }),
    db.templeEvent.findMany({
      where: {
        published: true,
        images: { some: {} },
      },
      orderBy: { eventDate: "desc" },
      skip,
      take: pageSize,
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
    }),
  ]);

  return {
    albums: events.map((ev) => ({
      id: ev.id,
      title: ev.title,
      category: ev.category,
      eventDate: ev.eventDate,
      description: ev.description,
      totalPhotos: ev._count.images,
      previewImages: ev.images,
    })),
    total,
    page: safePage,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Returns the requested published event and paginated photos, ordered by sortOrder then uploadedAt.
 */
export async function getAlbum(id: string, page: number = 1, pageSize: number = 48) {
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * pageSize;

  const event = await db.templeEvent.findFirst({
    where: {
      id,
      published: true,
    },
    include: {
      _count: {
        select: { images: true },
      },
    },
  });

  if (!event) return null;

  const images = await db.galleryImage.findMany({
    where: { eventId: id },
    orderBy: [{ sortOrder: "asc" }, { uploadedAt: "desc" }],
    skip,
    take: pageSize,
    select: {
      id: true,
      imageUrl: true,
      publicId: true,
      title: true,
      caption: true,
    },
  });

  return {
    ...event,
    totalPhotos: event._count.images,
    totalPages: Math.ceil(event._count.images / pageSize),
    page: safePage,
    pageSize,
    images,
  };
}

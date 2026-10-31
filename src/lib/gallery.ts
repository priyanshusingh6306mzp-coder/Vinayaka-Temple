import { db } from "@/lib/db";

/**
 * Returns featured images ordered by featuredOrder ascending. Maximum 4 images.
 * If no featured images are selected, falls back to the 4 most recently uploaded images.
 */
export async function getFeaturedImages() {
  const featured = await db.galleryImage.findMany({
    where: { featured: true },
    orderBy: [
      { featuredOrder: "asc" },
      { sortOrder: "asc" },
      { uploadedAt: "desc" },
    ],
    take: 4,
    include: {
      event: {
        select: { id: true, title: true },
      },
    },
  });

  if (featured.length > 0) {
    return featured;
  }

  return db.galleryImage.findMany({
    orderBy: { uploadedAt: "desc" },
    take: 4,
    include: {
      event: {
        select: { id: true, title: true },
      },
    },
  });
}

/**
 * Returns unattached photos summary for the /gallery hub card.
 */
export async function getUnattachedSummary() {
  const [totalPhotos, previewImages] = await Promise.all([
    db.galleryImage.count({
      where: { eventId: null },
    }),
    db.galleryImage.findMany({
      where: { eventId: null },
      orderBy: [{ sortOrder: "asc" }, { uploadedAt: "desc" }],
      take: 4,
      select: {
        id: true,
        imageUrl: true,
        title: true,
        caption: true,
      },
    }),
  ]);

  return {
    totalPhotos,
    previewImages,
  };
}

/**
 * Returns paginated unattached photos for /gallery/other.
 */
export async function getUnattachedPhotos(page: number = 1, pageSize: number = 48) {
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * pageSize;

  const [total, images] = await Promise.all([
    db.galleryImage.count({
      where: { eventId: null },
    }),
    db.galleryImage.findMany({
      where: { eventId: null },
      orderBy: [{ sortOrder: "asc" }, { uploadedAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        imageUrl: true,
        title: true,
        caption: true,
      },
    }),
  ]);

  return {
    images,
    total,
    page: safePage,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}


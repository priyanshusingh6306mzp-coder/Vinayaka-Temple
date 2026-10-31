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

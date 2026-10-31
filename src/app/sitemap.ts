import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vinayaka-temple.vercel.app";

  let albumRoutes: MetadataRoute.Sitemap = [];
  try {
    const publishedAlbums = await db.templeEvent.findMany({
      where: {
        published: true,
        images: { some: {} },
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    albumRoutes = publishedAlbums.map((album) => ({
      url: `${baseUrl}/gallery/${album.id}`,
      lastModified: album.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[Sitemap Album Query Error]", err);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/schedule`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery/other`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/pooja`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  return [...staticRoutes, ...albumRoutes];
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storageService } from "@/lib/services/storage/cloudinary.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized: Admin session required");
  }
  return session;
}

const saveImageSchema = z.object({
  imageUrl: z.string().url("Valid image URL required"),
  publicId: z.string().min(1, "Cloudinary publicId required"),
  title: z.string().trim().min(1, "Title is required").max(100),
  caption: z.string().trim().max(250).optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
  eventId: z.string().uuid("Invalid event ID").optional().nullable().or(z.literal("")),
  featured: z.boolean().default(false),
});

const updateImageDetailsSchema = z.object({
  id: z.string().uuid("Invalid image ID"),
  title: z.string().trim().min(1, "Title is required").max(100).optional(),
  caption: z.string().trim().max(250).optional().nullable().or(z.literal("")),
  eventId: z.string().uuid("Invalid event ID").optional().nullable().or(z.literal("")),
  featured: z.boolean().optional(),
});

export async function saveGalleryImage(rawInput: unknown) {
  await requireAdminSession();

  const parsed = saveImageSchema.parse(rawInput);
  const normalizedEventId = parsed.eventId && parsed.eventId.trim() !== "" ? parsed.eventId : null;

  const featured = parsed.featured;
  let featuredOrder: number | null = null;

  if (featured) {
    const featuredCount = await db.galleryImage.count({ where: { featured: true } });
    if (featuredCount >= 4) {
      throw new Error("Maximum of 4 featured images allowed on the homepage. Unfeature an image before selecting another.");
    }
    const maxOrder = await db.galleryImage.aggregate({
      where: { featured: true },
      _max: { featuredOrder: true },
    });
    featuredOrder = (maxOrder._max.featuredOrder ?? 0) + 1;
  }

  const image = await db.galleryImage.create({
    data: {
      imageUrl: parsed.imageUrl,
      publicId: parsed.publicId,
      title: parsed.title,
      caption: parsed.caption || null,
      sortOrder: parsed.sortOrder,
      eventId: normalizedEventId,
      featured,
      featuredOrder,
    },
    include: {
      event: { select: { id: true, title: true } },
    },
  });

  try {
    revalidatePath("/");
    revalidatePath("/gallery");
    if (normalizedEventId) revalidatePath(`/gallery/${normalizedEventId}`);
    revalidatePath("/admin/gallery");
  } catch {}

  return { success: true, image };
}

export async function updateGalleryImageDetails(rawInput: unknown) {
  await requireAdminSession();

  const parsed = updateImageDetailsSchema.parse(rawInput);
  const normalizedEventId = parsed.eventId !== undefined
    ? (parsed.eventId && parsed.eventId.trim() !== "" ? parsed.eventId : null)
    : undefined;

  const dataToUpdate: {
    title?: string;
    caption?: string | null;
    eventId?: string | null;
  } = {};
  if (parsed.title !== undefined) dataToUpdate.title = parsed.title;
  if (parsed.caption !== undefined) dataToUpdate.caption = parsed.caption || null;
  if (normalizedEventId !== undefined) dataToUpdate.eventId = normalizedEventId;

  // Handle featured toggle inside transaction if specified
  if (parsed.featured !== undefined) {
    return toggleFeaturedImage(parsed.id, parsed.featured, dataToUpdate);
  }

  const updated = await db.galleryImage.update({
    where: { id: parsed.id },
    data: dataToUpdate,
    include: { event: { select: { id: true, title: true } } },
  });

  try {
    revalidatePath("/");
    revalidatePath("/gallery");
    if (updated.eventId) revalidatePath(`/gallery/${updated.eventId}`);
    revalidatePath("/admin/gallery");
  } catch {}

  return { success: true, updated };
}

/**
 * Toggles featured status for homepage gallery inside a transaction,
 * enforcing maximum of 4 featured images strictly.
 */
export async function toggleFeaturedImage(
  imageId: string,
  featured: boolean,
  extraData: {
    title?: string;
    caption?: string | null;
    eventId?: string | null;
  } = {}
) {
  await requireAdminSession();

  const idParsed = z.string().uuid("Invalid image ID").safeParse(imageId);
  if (!idParsed.success) {
    throw new Error("Invalid image ID");
  }

  const result = await db.$transaction(
    async (tx) => {
      if (featured) {
        const currentFeaturedCount = await tx.galleryImage.count({
          where: { featured: true, id: { not: imageId } },
        });

        if (currentFeaturedCount >= 4) {
          throw new Error("Maximum of 4 featured images allowed on the homepage. Unfeature an image before selecting another.");
        }

        const maxOrder = await tx.galleryImage.aggregate({
          where: { featured: true },
          _max: { featuredOrder: true },
        });
        const nextOrder = (maxOrder._max.featuredOrder ?? 0) + 1;

        return tx.galleryImage.update({
          where: { id: imageId },
          data: {
            ...extraData,
            featured: true,
            featuredOrder: nextOrder,
          },
          include: { event: { select: { id: true, title: true } } },
        });
      } else {
        return tx.galleryImage.update({
          where: { id: imageId },
          data: {
            ...extraData,
            featured: false,
            featuredOrder: null,
          },
          include: { event: { select: { id: true, title: true } } },
        });
      }
    },
    { maxWait: 10000, timeout: 25000 }
  );

  try {
    revalidatePath("/");
    revalidatePath("/gallery");
    if (result.eventId) revalidatePath(`/gallery/${result.eventId}`);
    revalidatePath("/admin/gallery");
  } catch {}

  return { success: true, updated: result };
}

export async function deleteGalleryImage(id: string) {
  await requireAdminSession();

  const idParsed = z.string().uuid("Invalid image ID").safeParse(id);
  if (!idParsed.success) {
    throw new Error("Invalid image ID");
  }

  const image = await db.galleryImage.findUnique({
    where: { id },
  });

  if (!image) {
    throw new Error("Image not found");
  }

  // Delete from Cloudinary/Storage
  await storageService.deleteImage(image.publicId);

  // Delete from Database
  await db.galleryImage.delete({
    where: { id },
  });

  try {
    revalidatePath("/");
    revalidatePath("/gallery");
    if (image.eventId) revalidatePath(`/gallery/${image.eventId}`);
    revalidatePath("/admin/gallery");
  } catch {}

  return { success: true, id };
}

export async function reorderGalleryImages(
  items: { id: string; sortOrder: number }[]
) {
  await requireAdminSession();

  await db.$transaction(
    items.map((item) =>
      db.galleryImage.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  try {
    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
  } catch {}

  return { success: true };
}

export async function reorderFeaturedImages(
  items: { id: string; featuredOrder: number }[]
) {
  await requireAdminSession();

  await db.$transaction(
    items.map((item) =>
      db.galleryImage.update({
        where: { id: item.id },
        data: { featuredOrder: item.featuredOrder },
      })
    )
  );

  try {
    revalidatePath("/");
    revalidatePath("/admin/gallery");
  } catch {}

  return { success: true };
}

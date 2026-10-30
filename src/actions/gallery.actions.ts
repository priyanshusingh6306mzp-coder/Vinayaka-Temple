"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storageService } from "@/lib/services/storage/cloudinary.service";

const saveImageSchema = z.object({
  imageUrl: z.string().url("Valid image URL required"),
  publicId: z.string().min(1, "Cloudinary publicId required"),
  title: z.string().trim().min(1, "Title is required").max(100),
  caption: z.string().trim().max(250).optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
});

export async function saveGalleryImage(input: z.infer<typeof saveImageSchema>) {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const parsed = saveImageSchema.parse(input);

  const image = await db.galleryImage.create({
    data: {
      imageUrl: parsed.imageUrl,
      publicId: parsed.publicId,
      title: parsed.title,
      caption: parsed.caption || null,
      sortOrder: parsed.sortOrder,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { success: true, image };
}

export async function deleteGalleryImage(id: string) {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const image = await db.galleryImage.findUnique({
    where: { id },
  });

  if (!image) {
    throw new Error("Image not found");
  }

  // Delete from Cloudinary
  await storageService.deleteImage(image.publicId);

  // Delete from Database
  await db.galleryImage.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { success: true, id };
}

export async function reorderGalleryImages(
  items: { id: string; sortOrder: number }[]
) {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await db.$transaction(
    items.map((item) =>
      db.galleryImage.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { success: true };
}

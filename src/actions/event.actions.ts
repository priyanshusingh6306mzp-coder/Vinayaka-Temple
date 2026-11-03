"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eventInputSchema } from "@/schemas/events";
import { storageService } from "@/lib/services/storage/cloudinary.service";

async function requireAdminSession() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized: Admin session required");
  }
  return session;
}

export async function createEvent(rawInput: unknown) {
  await requireAdminSession();

  const result = eventInputSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const { title, category, eventDate, startTime, description, published } = result.data;

  // Convert date string (YYYY-MM-DD) into Date object for Prisma @db.Date
  const parsedDate = new Date(`${eventDate}T00:00:00.000Z`);

  const event = await db.templeEvent.create({
    data: {
      title,
      category,
      eventDate: parsedDate,
      startTime: startTime || null,
      description: description || null,
      published,
    },
  });

  try {
    revalidatePath("/");
    revalidatePath("/schedule");
    revalidatePath("/gallery");
    revalidatePath("/admin/events");
    revalidatePath("/admin/gallery");
  } catch {}

  return { success: true, event };
}

export async function updateEvent(id: string, rawInput: unknown) {
  await requireAdminSession();

  const idParsed = z.string().uuid("Invalid event ID").safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: "Invalid event ID" };
  }

  const result = eventInputSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const { title, category, eventDate, startTime, description, published } = result.data;
  const parsedDate = new Date(`${eventDate}T00:00:00.000Z`);

  const event = await db.templeEvent.update({
    where: { id },
    data: {
      title,
      category,
      eventDate: parsedDate,
      startTime: startTime || null,
      description: description || null,
      published,
    },
  });

  try {
    revalidatePath("/");
    revalidatePath("/schedule");
    revalidatePath("/gallery");
    revalidatePath(`/gallery/${id}`);
    revalidatePath("/admin/events");
    revalidatePath("/admin/gallery");
  } catch {}

  return { success: true, event };
}

export async function deleteEvent(id: string, option: "keep_photos" | "delete_photos" = "keep_photos") {
  await requireAdminSession();

  const idParsed = z.string().uuid("Invalid event ID").safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: "Invalid event ID" };
  }

  const event = await db.templeEvent.findUnique({
    where: { id },
    include: {
      images: {
        select: { id: true, publicId: true },
      },
    },
  });

  if (!event) {
    return { success: false, error: "Event not found" };
  }

  const photoCount = event.images.length;
  const failedAssets: string[] = [];

  if (option === "delete_photos") {
    // Option 2: Delete event AND all its photos (from DB and Cloudinary)
    for (const img of event.images) {
      try {
        const delRes = await storageService.deleteImage(img.publicId);
        if (!delRes.success) {
          failedAssets.push(img.publicId);
        }
      } catch {
        failedAssets.push(img.publicId);
      }
    }

    // Delete photo records
    await db.galleryImage.deleteMany({
      where: { eventId: id },
    });

    // Delete the event
    await db.templeEvent.delete({
      where: { id },
    });
  } else {
    // Option 1 (default): Delete the event but keep its photos (set eventId = null)
    await db.galleryImage.updateMany({
      where: { eventId: id },
      data: { eventId: null },
    });

    await db.templeEvent.delete({
      where: { id },
    });
  }

  try {
    revalidatePath("/");
    revalidatePath("/schedule");
    revalidatePath("/gallery");
    revalidatePath("/admin/events");
    revalidatePath("/admin/gallery");
  } catch {}

  return {
    success: true,
    option,
    photoCount,
    failedAssets: failedAssets.length > 0 ? failedAssets : undefined,
  };
}

export async function toggleEventPublished(id: string) {
  await requireAdminSession();

  const idParsed = z.string().uuid("Invalid event ID").safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: "Invalid event ID" };
  }

  const existing = await db.templeEvent.findUnique({
    where: { id },
    select: { published: true },
  });

  if (!existing) {
    return { success: false, error: "Event not found" };
  }

  const updated = await db.templeEvent.update({
    where: { id },
    data: { published: !existing.published },
  });

  try {
    revalidatePath("/");
    revalidatePath("/schedule");
    revalidatePath("/gallery");
    revalidatePath(`/gallery/${id}`);
    revalidatePath("/admin/events");
    revalidatePath("/admin/gallery");
  } catch {}

  return { success: true, event: updated };
}

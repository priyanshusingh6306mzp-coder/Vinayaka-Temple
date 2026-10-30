import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storageService } from "@/lib/services/storage/cloudinary.service";

export async function GET() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const images = await db.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(images);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { imageUrl, publicId, title, caption, sortOrder } = body;

    if (!imageUrl || !publicId || !title) {
      return NextResponse.json(
        { error: "Missing required fields: imageUrl, publicId, title" },
        { status: 400 }
      );
    }

    const image = await db.galleryImage.create({
      data: {
        imageUrl,
        publicId,
        title: title.slice(0, 100),
        caption: caption ? caption.slice(0, 250) : null,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, caption, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing image id" }, { status: 400 });
    }

    const updated = await db.galleryImage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.slice(0, 100) }),
        ...(caption !== undefined && { caption: caption ? caption.slice(0, 250) : null }),
        ...(typeof sortOrder === "number" && { sortOrder }),
      },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing image id" }, { status: 400 });
    }

    const image = await db.galleryImage.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from Cloudinary storage
    await storageService.deleteImage(image.publicId);

    // Delete from database
    await db.galleryImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

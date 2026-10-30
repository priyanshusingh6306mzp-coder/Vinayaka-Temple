import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storageService } from "@/lib/services/storage/cloudinary.service";

export async function POST() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const signatureData = await storageService.getUploadSignature("vinayaka_temple");
    return NextResponse.json(signatureData, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate upload signature";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

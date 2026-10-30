import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { GalleryManager, SerializedGalleryImage } from "@/components/admin/GalleryManager";

export const metadata = {
  title: "Gallery Manager | Shri Vinayaka Temple",
};

export default async function AdminGalleryPage() {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/admin/login");
  }

  // Fetch pending requests for badge counter
  const pendingCount = await db.poojaRequest.count({
    where: { status: "PENDING" },
  });

  // Fetch all gallery images ordered by sortOrder
  const rawImages = await db.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const serializedImages: SerializedGalleryImage[] = rawImages.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    publicId: img.publicId,
    title: img.title,
    caption: img.caption,
    sortOrder: img.sortOrder,
  }));

  return (
    <div className="min-h-screen bg-temple-ivory/60 flex flex-col w-full overflow-x-hidden">
      <AdminNav pendingCount={pendingCount} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-temple-charcoal tracking-tight">
              Temple Gallery Manager
            </h1>
            <p className="text-xs sm:text-sm text-temple-warmGrey mt-0.5">
              Upload, organize, and edit photos visible to devotees on the public temple homepage.
            </p>
          </div>
        </div>

        <GalleryManager initialImages={serializedImages} />
      </main>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Images } from "lucide-react";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { SectionDivider } from "@/components/public/SectionDivider";
import { AlbumPhotoGrid } from "@/components/public/AlbumPhotoGrid";
import { getUnattachedPhotos } from "@/lib/gallery";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Other Photographs | Shri Vinayaka Temple",
  description:
    "Photographs of the sanctum, deity, premises, and rituals at Shri Vinayaka Temple, Noida.",
};

interface OtherGalleryPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OtherGalleryPage({ searchParams }: OtherGalleryPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1", 10) || 1;
  const pageSize = 48;

  const { images, total, totalPages, page: currentPage } = await getUnattachedPhotos(
    page,
    pageSize
  );

  const formattedPhotos = images.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    title: img.title,
    caption: img.caption,
    eventTitle: "Temple Collection",
  }));

  return (
    <div className="min-h-screen flex flex-col bg-temple-ivory text-temple-charcoal">
      <Header />

      <main className="flex-1 py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
          {/* Breadcrumb / Back link */}
          <div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-temple-kumkum hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-temple-charcoal rounded px-2 py-1"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to gallery</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-temple-goldText font-medium">
              <Images className="w-4 h-4" aria-hidden="true" />
              <span>
                {total} {total === 1 ? "photograph" : "photographs"}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-temple-charcoal">
              Other Photographs
            </h1>

            <p className="text-base text-temple-warmGrey max-w-3xl leading-relaxed">
              Photographs of the deity, rituals, sanctum sanctorum, and temple grounds.
            </p>
          </div>

          <SectionDivider />

          {/* Photos Grid */}
          {formattedPhotos.length > 0 ? (
            <div className="space-y-8">
              <AlbumPhotoGrid photos={formattedPhotos} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                  {currentPage > 1 && (
                    <Link
                      href={`/gallery/other?page=${currentPage - 1}`}
                      className="px-4 py-2 text-sm font-semibold rounded-md border border-stone-300 bg-white hover:bg-stone-50"
                    >
                      &larr; Previous
                    </Link>
                  )}
                  <span className="text-sm font-medium text-temple-warmGrey">
                    Page {currentPage} of {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <Link
                      href={`/gallery/other?page=${currentPage + 1}`}
                      className="px-4 py-2 text-sm font-semibold rounded-md border border-stone-300 bg-white hover:bg-stone-50"
                    >
                      Next &rarr;
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-temple-warmGrey">
              <p className="text-base">No standalone photographs found.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

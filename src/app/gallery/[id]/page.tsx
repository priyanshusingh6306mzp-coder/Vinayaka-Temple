import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Images } from "lucide-react";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { SectionDivider } from "@/components/public/SectionDivider";
import { AlbumPhotoGrid } from "@/components/public/AlbumPhotoGrid";
import { getAlbum } from "@/lib/events";
import { formatDisplayDate } from "@/lib/date-utils";

export const revalidate = 60;

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) {
    return {
      title: "Album Not Found | Shri Vinayaka Temple",
    };
  }

  const dateStr = formatDisplayDate(album.eventDate);
  return {
    title: `${album.title} (${dateStr}) | Shri Vinayaka Temple`,
    description:
      album.description ||
      `Photographs from ${album.title} on ${dateStr} at Shri Vinayaka Temple, Noida.`,
  };
}

export default async function AlbumDetailPage({
  params,
  searchParams,
}: AlbumDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1", 10) || 1;
  const pageSize = 48;

  const album = await getAlbum(id, page, pageSize);
  if (!album) {
    notFound();
  }

  const displayDate = formatDisplayDate(album.eventDate);

  const formattedPhotos = album.images.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    title: img.title,
    caption: img.caption,
    eventTitle: album.title,
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

          {/* Album Title Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-temple-warmGrey">
              <span className="flex items-center gap-1.5 font-medium text-temple-charcoal">
                <Calendar className="w-4 h-4 text-temple-kumkum" aria-hidden="true" />
                <span>{displayDate}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-temple-goldText">
                <Images className="w-4 h-4" aria-hidden="true" />
                <span>
                  {album.totalPhotos} {album.totalPhotos === 1 ? "photograph" : "photographs"}
                </span>
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-temple-charcoal">
              {album.title}
            </h1>

            {album.description && (
              <p className="text-base text-temple-warmGrey max-w-3xl leading-relaxed">
                {album.description}
              </p>
            )}
          </div>

          <SectionDivider />

          {/* Photos Grid */}
          {formattedPhotos.length > 0 ? (
            <div className="space-y-8">
              <AlbumPhotoGrid photos={formattedPhotos} />

              {/* Pagination */}
              {album.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                  {album.page > 1 && (
                    <Link
                      href={`/gallery/${id}?page=${album.page - 1}`}
                      className="px-4 py-2 text-sm font-semibold rounded-md border border-stone-300 bg-white hover:bg-stone-50"
                    >
                      &larr; Previous
                    </Link>
                  )}
                  <span className="text-sm font-medium text-temple-warmGrey">
                    Page {album.page} of {album.totalPages}
                  </span>
                  {album.page < album.totalPages && (
                    <Link
                      href={`/gallery/${id}?page=${album.page + 1}`}
                      className="px-4 py-2 text-sm font-semibold rounded-md border border-stone-300 bg-white hover:bg-stone-50"
                    >
                      Next &rarr;
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-temple-warmGrey">
              <p className="text-base">No photographs in this album yet.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

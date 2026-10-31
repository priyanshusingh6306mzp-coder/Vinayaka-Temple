import { Metadata } from "next";
import Link from "next/link";
import { Camera, Calendar, ArrowRight, Images } from "lucide-react";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { SectionDivider } from "@/components/public/SectionDivider";
import { AlbumCollage } from "@/components/public/AlbumCollage";
import { getAlbums } from "@/lib/events";
import { getUnattachedSummary } from "@/lib/gallery";
import { formatDisplayDate } from "@/lib/date-utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Photo Gallery & Albums | Shri Vinayaka Temple",
  description:
    "Explore photo albums of festivals, rituals, special poojas, and sacred celebrations at Shri Vinayaka Temple.",
};

interface GalleryHubPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function GalleryHubPage({ searchParams }: GalleryHubPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = parseInt(resolvedParams.page || "1", 10) || 1;
  const pageSize = 12;

  let albumData: Awaited<ReturnType<typeof getAlbums>> = {
    albums: [],
    total: 0,
    page: 1,
    pageSize,
    totalPages: 1,
  };

  let unattachedSummary: Awaited<ReturnType<typeof getUnattachedSummary>> = {
    totalPhotos: 0,
    previewImages: [],
  };

  try {
    const [fetchedAlbums, fetchedUnattached] = await Promise.all([
      getAlbums(currentPage, pageSize),
      getUnattachedSummary(),
    ]);
    albumData = fetchedAlbums;
    unattachedSummary = fetchedUnattached;
  } catch (err) {
    console.error("[Gallery Hub Page Fetch Error]", err);
  }

  const { albums, totalPages } = albumData;
  const showUnattachedCard = unattachedSummary.totalPhotos > 0;
  const isEmpty = albums.length === 0 && !showUnattachedCard;

  return (
    <div className="min-h-screen flex flex-col bg-temple-ivory text-temple-charcoal">
      <Header />

      <main className="flex-1 py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-semibold tracking-widest text-temple-goldText block">
              Temple Gallery
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-temple-charcoal">
              Photo Gallery
            </h1>
            <p className="text-sm sm:text-base text-temple-warmGrey leading-relaxed">
              Photographs of temple festivals, rituals, and occasions.
            </p>
          </div>

          <SectionDivider />

          {/* Albums Grid */}
          {!isEmpty ? (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {albums.map((album) => {
                  const displayDate = formatDisplayDate(album.eventDate);
                  return (
                    <article
                      key={album.id}
                      className="group relative rounded-xl border border-[#16130F]/10 bg-white/80 p-4 shadow-xs transition-all hover:shadow-md hover:border-stone-300 focus-within:ring-2 focus-within:ring-temple-charcoal"
                    >
                      <AlbumCollage images={album.previewImages} title={album.title} />

                      <div className="pt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-temple-warmGrey">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-temple-kumkum" aria-hidden="true" />
                            {displayDate}
                          </span>
                          <span className="font-semibold text-temple-goldText flex items-center gap-1">
                            <Images className="w-3.5 h-3.5" aria-hidden="true" />
                            {album.totalPhotos} {album.totalPhotos === 1 ? "photo" : "photos"}
                          </span>
                        </div>

                        <h2 className="font-serif text-lg font-bold text-temple-charcoal group-hover:text-temple-kumkum transition-colors">
                          <Link
                            href={`/gallery/${album.id}`}
                            className="focus:outline-none after:absolute after:inset-0"
                          >
                            {album.title}
                          </Link>
                        </h2>

                        {album.description && (
                          <p className="text-xs text-temple-warmGrey line-clamp-2 leading-relaxed">
                            {album.description}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}

                {/* Other Photographs Card (for unattached photos) */}
                {showUnattachedCard && (
                  <article className="group relative rounded-xl border border-[#16130F]/10 bg-white/80 p-4 shadow-xs transition-all hover:shadow-md hover:border-stone-300 focus-within:ring-2 focus-within:ring-temple-charcoal">
                    <AlbumCollage
                      images={unattachedSummary.previewImages}
                      title="Other Photographs"
                    />

                    <div className="pt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-temple-warmGrey">
                        <span className="font-medium text-temple-charcoal">
                          Temple Collection
                        </span>
                        <span className="font-semibold text-temple-goldText flex items-center gap-1">
                          <Images className="w-3.5 h-3.5" aria-hidden="true" />
                          {unattachedSummary.totalPhotos}{" "}
                          {unattachedSummary.totalPhotos === 1 ? "photo" : "photos"}
                        </span>
                      </div>

                      <h2 className="font-serif text-lg font-bold text-temple-charcoal group-hover:text-temple-kumkum transition-colors">
                        <Link
                          href="/gallery/other"
                          className="focus:outline-none after:absolute after:inset-0"
                        >
                          Other photographs
                        </Link>
                      </h2>

                      <p className="text-xs text-temple-warmGrey line-clamp-2 leading-relaxed">
                        Photographs of the sanctum, deity, rituals, and temple premises.
                      </p>
                    </div>
                  </article>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  {currentPage > 1 && (
                    <Link
                      href={`/gallery?page=${currentPage - 1}`}
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
                      href={`/gallery?page=${currentPage + 1}`}
                      className="px-4 py-2 text-sm font-semibold rounded-md border border-stone-300 bg-white hover:bg-stone-50"
                    >
                      Next &rarr;
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Calm Empty State */
            <div className="text-center py-16 px-4 space-y-4 max-w-md mx-auto">
              <Camera className="w-12 h-12 text-temple-goldText mx-auto" aria-hidden="true" />
              <p className="text-base sm:text-lg font-medium text-temple-charcoal">
                Photographs will be added soon.
              </p>
              <p className="text-xs text-temple-warmGrey">
                The temple administration is curating high-resolution photos of ceremonies and celebrations.
              </p>
            </div>
          )}

          {/* Quick Return to Home */}
          <div className="text-center pt-8 border-t border-[#16130F]/10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-temple-kumkum hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-temple-charcoal rounded px-2 py-1"
            >
              <span>Back to home</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

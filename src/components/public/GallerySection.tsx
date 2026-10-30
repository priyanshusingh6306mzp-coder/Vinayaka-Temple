"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Eye } from "lucide-react";
import { LightboxModal, GalleryPhoto } from "@/components/public/LightboxModal";
import { SectionDivider } from "./SectionDivider";

interface GallerySectionProps {
  initialPhotos?: GalleryPhoto[];
}

export function GallerySection({ initialPhotos = [] }: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Gallery comes strictly from the database. When no photos have been uploaded by admin, show friendly empty state.
  const displayPhotos: GalleryPhoto[] = initialPhotos;

  return (
    <section id="gallery" className="py-14 sm:py-20 md:py-24 px-4 bg-temple-ivory text-temple-charcoal border-b border-temple-stoneBorder">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs uppercase font-semibold tracking-widest text-temple-goldText block">
            Sacred Darshan
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-temple-charcoal">
            Temple Gallery
          </h2>
          <SectionDivider />
          <p className="font-devanagari text-base text-temple-kumkum font-medium">
            छायाचित्र एवं मंदिर दर्शन
          </p>
        </div>

        {/* Gallery Grid */}
        {displayPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                role="button"
                tabIndex={0}
                aria-label={`View photo: ${photo.title}`}
                onClick={() => setSelectedIndex(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedIndex(idx);
                  }
                }}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-temple-stoneBorder bg-temple-charcoalCard cursor-pointer shadow-sm hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-temple-gold"
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 motion-reduce:transform-none"
                  loading="lazy"
                />

                {/* Hover / Focus Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-temple-charcoal/90 via-temple-charcoal/30 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold tracking-wide">
                        {photo.title}
                      </h3>
                      {photo.caption && (
                        <p className="text-xs text-temple-sandstone/80 line-clamp-1 mt-0.5">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-temple-gold/20 flex items-center justify-center text-temple-goldLight">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Graceful Empty State */
          <div className="p-12 rounded-xl border border-dashed border-temple-stoneBorder text-center text-temple-warmGrey space-y-3 bg-temple-sandstone/20">
            <Camera className="w-10 h-10 text-temple-gold mx-auto opacity-60" />
            <h3 className="font-serif text-xl font-bold text-temple-charcoal">
              Photographs Coming Soon
            </h3>
            <p className="text-sm max-w-md mx-auto">
              High-resolution photographs of the temple, festivals, and sanctum are being curated by the temple administration.
            </p>
          </div>
        )}
      </div>

      {/* Accessible Lightbox Modal */}
      {selectedIndex !== null && (
        <LightboxModal
          photos={displayPhotos}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={(newIdx) => setSelectedIndex(newIdx)}
        />
      )}
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, ArrowRight } from "lucide-react";
import { LightboxModal, GalleryPhoto } from "@/components/public/LightboxModal";
import {
  getPublicPhotoAlt,
  getPublicPhotoCaption,
  getOptimizedCloudinaryUrl,
} from "@/lib/gallery-title";
import { SectionDivider } from "./SectionDivider";

interface GallerySectionProps {
  initialPhotos?: GalleryPhoto[];
}

export function GallerySection({ initialPhotos = [] }: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const displayPhotos = initialPhotos.slice(0, 4);

  return (
    <section id="gallery" className="py-14 sm:py-20 md:py-24 px-4 bg-temple-ivory text-temple-charcoal">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs uppercase font-semibold tracking-widest text-temple-goldText block">
            Photo Gallery
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
          <div className="space-y-10">
            {/* Desktop: gently staggered 4-column row (cols 2 & 4 offset downward by 40px)
                Mobile: 2x2 grid without vertical offset */}
            <div
              className={`grid ${
                displayPhotos.length === 1
                  ? "max-w-md mx-auto grid-cols-1"
                  : displayPhotos.length === 2
                  ? "max-w-2xl mx-auto grid-cols-2 gap-4 lg:gap-8 lg:items-start"
                  : displayPhotos.length === 3
                  ? "max-w-4xl mx-auto grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 lg:items-start"
                  : "grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 lg:items-start"
              }`}
            >
              {displayPhotos.map((photo, idx) => {
                // Alternating ratios: 0 -> 3/4, 1 -> 4/5, 2 -> 3/4, 3 -> 4/5
                const isThreeFour = idx % 2 === 0;
                const aspectClass = isThreeFour ? "aspect-[3/4]" : "aspect-[4/5]";

                // Columns 2 & 4 (indices 1 & 3) offset downward by ~40px on lg
                const offsetClass = idx === 1 || idx === 3 ? "lg:mt-10" : "";

                // First image has arched top (niche); others are softly rounded
                const roundingClass = idx === 0 ? "rounded-t-[44px] rounded-b-xl" : "rounded-xl";

                const altText = getPublicPhotoAlt(photo);
                const displayCaption = getPublicPhotoCaption(photo);
                const optimizedUrl = getOptimizedCloudinaryUrl(photo.imageUrl, { width: 600 });

                return (
                  <div key={photo.id} className={`flex flex-col space-y-2 ${offsetClass}`}>
                    <button
                      type="button"
                      aria-label={`View photograph: ${altText}`}
                      onClick={() => setSelectedIndex(idx)}
                      className={`group relative w-full ${aspectClass} ${roundingClass} overflow-hidden border border-stone-200/80 bg-white cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-temple-charcoal focus-visible:ring-offset-2`}
                    >
                      <Image
                        src={optimizedUrl}
                        alt={altText}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        loading="lazy"
                        className="object-cover object-center transition-transform duration-600 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
                      />
                    </button>

                    {displayCaption && (
                      <p className="text-xs font-medium text-temple-warmGrey line-clamp-2 px-1 leading-relaxed">
                        {displayCaption}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiet Link to /gallery */}
            <div className="text-center pt-2">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-temple-kumkum hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-temple-charcoal rounded px-2 py-1"
              >
                <span>View all photos</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center text-temple-warmGrey space-y-3">
            <Camera className="w-10 h-10 text-temple-goldText mx-auto" />
            <p className="text-base font-medium text-temple-charcoal">
              Photographs will be added soon.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
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

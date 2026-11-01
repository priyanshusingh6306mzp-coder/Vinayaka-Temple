"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LightboxModal, GalleryPhoto } from "@/components/public/LightboxModal";
import {
  getPublicPhotoAlt,
  getPublicPhotoCaption,
  getOptimizedCloudinaryUrl,
} from "@/lib/gallery-title";

interface AlbumPhotoItem {
  id: string;
  imageUrl: string;
  title: string;
  caption?: string | null;
  eventTitle?: string | null;
}

interface AlbumPhotoGridProps {
  photos: AlbumPhotoItem[];
}

export function AlbumPhotoGrid({ photos }: AlbumPhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const lightboxPhotos: GalleryPhoto[] = photos.map((p) => ({
    id: p.id,
    imageUrl: p.imageUrl,
    title: p.title,
    caption: p.caption,
    eventTitle: p.eventTitle,
  }));

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {photos.map((photo, idx) => {
          const altText = getPublicPhotoAlt(photo);
          const displayCaption = getPublicPhotoCaption(photo);
          const optimizedUrl = getOptimizedCloudinaryUrl(photo.imageUrl, { width: 600 });

          return (
            <div key={photo.id} className="flex flex-col space-y-1.5">
              <button
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View photograph: ${altText}`}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-stone-200/80 bg-white cursor-pointer shadow-xs hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-temple-charcoal focus-visible:ring-offset-2"
              >
                <Image
                  src={optimizedUrl}
                  alt={altText}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  loading="lazy"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out motion-reduce:transform-none"
                />
              </button>

              {displayCaption && (
                <p className="text-xs text-temple-warmGrey line-clamp-2 px-1 leading-snug">
                  {displayCaption}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {selectedIndex !== null && (
        <LightboxModal
          photos={lightboxPhotos}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={(newIdx) => setSelectedIndex(newIdx)}
        />
      )}
    </>
  );
}

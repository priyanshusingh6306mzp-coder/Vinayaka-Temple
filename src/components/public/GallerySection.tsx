"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Eye } from "lucide-react";
import { LightboxModal, GalleryPhoto } from "@/components/public/LightboxModal";

interface GallerySectionProps {
  initialPhotos?: GalleryPhoto[];
}

export function GallerySection({ initialPhotos = [] }: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // If initialPhotos from DB is empty, provide default curated placeholders until admin uploads real photos
  const displayPhotos: GalleryPhoto[] =
    initialPhotos.length > 0
      ? initialPhotos
      : [
          {
            id: "ph-1",
            imageUrl: "/images/hero-placeholder.svg",
            title: "Sanctum Sanctorum & Chola Architecture",
            caption: "Classic Dravidian stone carved Vimana tower over the deity sanctum.",
          },
          {
            id: "ph-2",
            imageUrl: "/images/about-placeholder.svg",
            title: "Shri Maha Ganapati Idol",
            caption: "Carved Black Granite Stone (Kala Shilpa) idol in blessing posture.",
          },
        ];

  return (
    <section id="gallery" className="py-16 sm:py-24 px-4 bg-temple-ivory text-temple-charcoal border-b border-temple-stoneBorder">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-semibold tracking-widest text-temple-gold block">
            Sacred Darshan
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-temple-charcoal">
            Temple Gallery
          </h2>
          <div className="gold-divider max-w-xs mx-auto my-3" />
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
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Hover / Focus Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-temple-charcoal/90 via-temple-charcoal/30 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-base font-bold tracking-wide">
                        {photo.title}
                      </h4>
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

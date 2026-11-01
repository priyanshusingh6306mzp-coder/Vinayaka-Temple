"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPublicPhotoTitle,
  getPublicPhotoAlt,
  getPublicPhotoCaption,
  getOptimizedCloudinaryUrl,
} from "@/lib/gallery-title";

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  title: string;
  caption?: string | null;
  eventTitle?: string | null;
}

interface LightboxModalProps {
  photos: GalleryPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export function LightboxModal({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxModalProps) {
  const current = photos[currentIndex];
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  // Trap focus and restore focus on close
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    return () => {
      previousActiveElement.current?.focus?.();
    };
  }, []);

  // Keyboard navigation & Esc key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  // Mobile swipe support
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext(); // Swiped left -> next
    } else if (diff < -50) {
      handlePrev(); // Swiped right -> prev
    }
    touchStartX.current = null;
  };

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox"
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-6 backdrop-blur-sm select-none animate-in fade-in duration-200"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
        <span className="text-xs sm:text-sm font-medium tracking-wider text-temple-goldLight">
          {currentIndex + 1} / {photos.length}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close Lightbox"
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Navigation: Previous Button */}
      {photos.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          aria-label="Previous Image"
          className="absolute left-2 sm:left-6 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 hidden sm:flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}

      {/* Main Image Container */}
      <div className="relative max-w-4xl max-h-[75vh] w-full h-[60vh] sm:h-[75vh] flex flex-col items-center justify-center">
        {(() => {
          const altText = getPublicPhotoAlt(current);
          const displayTitle = getPublicPhotoTitle(current);
          const displayCaption = getPublicPhotoCaption(current);
          const optimizedUrl = getOptimizedCloudinaryUrl(current.imageUrl, { width: 1400 });

          return (
            <>
              <div className="relative w-full h-full">
                <Image
                  src={optimizedUrl}
                  alt={altText}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Caption */}
              {(displayTitle || displayCaption) && (
                <div className="mt-4 text-center text-white max-w-xl px-4">
                  {displayTitle && (
                    <h4 className="font-serif text-lg sm:text-xl font-bold tracking-wide">
                      {displayTitle}
                    </h4>
                  )}
                  {displayCaption && (
                    <p className="text-xs sm:text-sm text-temple-sandstone/80 mt-1">
                      {displayCaption}
                    </p>
                  )}
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Navigation: Next Button */}
      {photos.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          aria-label="Next Image"
          className="absolute right-2 sm:right-6 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 hidden sm:flex items-center justify-center"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}

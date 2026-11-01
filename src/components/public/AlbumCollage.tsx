import React from "react";
import Image from "next/image";
import { getPublicPhotoAlt, getOptimizedCloudinaryUrl } from "@/lib/gallery-title";

interface PreviewImage {
  id: string;
  imageUrl: string;
  title: string;
  caption?: string | null;
}

interface AlbumCollageProps {
  images: PreviewImage[];
  title: string;
}

export function AlbumCollage({ images, title }: AlbumCollageProps) {
  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-lg bg-stone-200/50 flex items-center justify-center text-temple-warmGrey text-xs">
        No preview available
      </div>
    );
  }

  if (images.length === 1) {
    const altText = getPublicPhotoAlt(images[0], `Photo from ${title}`);
    const optimizedUrl = getOptimizedCloudinaryUrl(images[0].imageUrl, { width: 500 });
    return (
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-100">
        <Image
          src={optimizedUrl}
          alt={altText}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
        />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="relative aspect-[4/3] grid grid-cols-2 gap-1 rounded-lg overflow-hidden bg-stone-100">
        {images.slice(0, 2).map((img, idx) => {
          const altText = getPublicPhotoAlt(img, `Photo ${idx + 1} from ${title}`);
          const optimizedUrl = getOptimizedCloudinaryUrl(img.imageUrl, { width: 400 });
          return (
            <div key={img.id} className="relative w-full h-full overflow-hidden">
              <Image
                src={optimizedUrl}
                alt={altText}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
              />
            </div>
          );
        })}
      </div>
    );
  }

  if (images.length === 3) {
    const mainAlt = getPublicPhotoAlt(images[0], `Photo 1 from ${title}`);
    const mainOptimized = getOptimizedCloudinaryUrl(images[0].imageUrl, { width: 500 });
    return (
      <div className="relative aspect-[4/3] grid grid-cols-3 grid-rows-2 gap-1 rounded-lg overflow-hidden bg-stone-100">
        <div className="relative col-span-2 row-span-2 w-full h-full overflow-hidden">
          <Image
            src={mainOptimized}
            alt={mainAlt}
            fill
            sizes="(max-width: 640px) 66vw, 33vw"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
          />
        </div>
        {images.slice(1, 3).map((img, idx) => {
          const sideAlt = getPublicPhotoAlt(img, `Photo ${idx + 2} from ${title}`);
          const sideOptimized = getOptimizedCloudinaryUrl(img.imageUrl, { width: 300 });
          return (
            <div key={img.id} className="relative col-span-1 row-span-1 w-full h-full overflow-hidden">
              <Image
                src={sideOptimized}
                alt={sideAlt}
                fill
                sizes="(max-width: 640px) 33vw, 16vw"
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
              />
            </div>
          );
        })}
      </div>
    );
  }

  // 4 images (2x2 grid)
  return (
    <div className="relative aspect-[4/3] grid grid-cols-2 grid-rows-2 gap-1 rounded-lg overflow-hidden bg-stone-100">
      {images.slice(0, 4).map((img, idx) => {
        const altText = getPublicPhotoAlt(img, `Photo ${idx + 1} from ${title}`);
        const optimizedUrl = getOptimizedCloudinaryUrl(img.imageUrl, { width: 350 });
        return (
          <div key={img.id} className="relative w-full h-full overflow-hidden">
            <Image
              src={optimizedUrl}
              alt={altText}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
            />
          </div>
        );
      })}
    </div>
  );
}

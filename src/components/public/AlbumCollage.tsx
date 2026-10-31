import React from "react";
import Image from "next/image";

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

function getAltText(img: PreviewImage, fallback: string): string {
  if (img.caption?.trim()) return img.caption.trim();
  if (img.title?.trim() && !/\.(jpe?g|png|webp|gif|avif)$/i.test(img.title)) {
    return img.title.trim();
  }
  return fallback;
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
    const altText = getAltText(images[0], `Photo from ${title}`);
    return (
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-100">
        <Image
          src={images[0].imageUrl}
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
          const altText = getAltText(img, `Photo ${idx + 1} from ${title}`);
          return (
            <div key={img.id} className="relative w-full h-full overflow-hidden">
              <Image
                src={img.imageUrl}
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
    return (
      <div className="relative aspect-[4/3] grid grid-cols-3 grid-rows-2 gap-1 rounded-lg overflow-hidden bg-stone-100">
        <div className="relative col-span-2 row-span-2 w-full h-full overflow-hidden">
          <Image
            src={images[0].imageUrl}
            alt={getAltText(images[0], `Photo 1 from ${title}`)}
            fill
            sizes="(max-width: 640px) 66vw, 33vw"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
          />
        </div>
        {images.slice(1, 3).map((img, idx) => (
          <div key={img.id} className="relative col-span-1 row-span-1 w-full h-full overflow-hidden">
            <Image
              src={img.imageUrl}
              alt={getAltText(img, `Photo ${idx + 2} from ${title}`)}
              fill
              sizes="(max-width: 640px) 33vw, 16vw"
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
            />
          </div>
        ))}
      </div>
    );
  }

  // 4 images (2x2 grid)
  return (
    <div className="relative aspect-[4/3] grid grid-cols-2 grid-rows-2 gap-1 rounded-lg overflow-hidden bg-stone-100">
      {images.slice(0, 4).map((img, idx) => {
        const altText = getAltText(img, `Photo ${idx + 1} from ${title}`);
        return (
          <div key={img.id} className="relative w-full h-full overflow-hidden">
            <Image
              src={img.imageUrl}
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

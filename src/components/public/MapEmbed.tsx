import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { SITE_CONFIG } from "@/content/site";
import { Button } from "@/components/ui/button";

export function MapEmbed() {
  const mapsLink =
    process.env.NEXT_PUBLIC_MAPS_LINK || SITE_CONFIG.maps.link;

  return (
    <div className="space-y-4">
      {/* 1. Map Image Link with visible focus outline & accessible name */}
      <a
        href={mapsLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Shri Vinayaka Temple on Google Maps (opens in a new tab)"
        className="group block relative w-full rounded-xl overflow-hidden border border-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-temple-charcoal"
      >
        <Image
          src="/images/map-static.webp"
          alt="Map of the area around Shri Vinayaka Temple inside the JSS University campus, Sector 62, Noida"
          width={1400}
          height={935}
          loading="lazy"
          className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
        />
      </a>

      {/* 2. Address as plain text under the map image */}
      <p className="text-sm text-temple-charcoal font-medium leading-relaxed">
        {SITE_CONFIG.location.fullAddress}
      </p>

      {/* 3. Action bar: Primary-style button + AA contrast Map data credit */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <Button
          asChild
          className="bg-temple-kumkum hover:bg-temple-kumkumHover text-white font-medium shadow-sm h-11 px-5 focus-visible:ring-2 focus-visible:ring-temple-charcoal"
        >
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden="true"
            className="inline-flex items-center gap-2"
          >
            <span>View in Google Maps</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>

        <span className="text-xs text-stone-600 font-medium">
          Map data © Google
        </span>
      </div>
    </div>
  );
}

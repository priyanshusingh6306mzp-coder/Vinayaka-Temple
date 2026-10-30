"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { SITE_CONFIG } from "@/content/site";
import { Button } from "@/components/ui/button";

export function MapEmbed() {
  const embedUrl = process.env.NEXT_PUBLIC_MAPS_EMBED_URL || SITE_CONFIG.maps.defaultEmbedUrl;
  const mapsLink = process.env.NEXT_PUBLIC_MAPS_LINK || SITE_CONFIG.maps.defaultMapsLink;

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative w-full h-[320px] sm:h-[400px] rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-stone-50">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Google Maps Location of Shri Vinayaka Temple"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-temple-warmGrey space-y-2">
            <MapPin className="w-8 h-8 text-temple-goldText" />
            <p className="font-serif text-lg font-semibold text-temple-charcoal">
              Map Preview Currently Unavailable
            </p>
            <p className="text-xs max-w-sm">
              {SITE_CONFIG.location.fullAddress}
            </p>
          </div>
        )}
      </div>

      {/* Direct Open in Google Maps Link footer */}
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm" className="h-10 px-4 text-xs font-semibold border border-temple-charcoal text-temple-charcoal hover:bg-stone-100">
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5"
          >
            <span>Open in Google Maps App</span>
            <ExternalLink className="w-3.5 h-3.5 text-temple-goldText" />
          </a>
        </Button>
      </div>
    </div>
  );
}
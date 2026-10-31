"use client";

import { useState } from "react";
import { MapPin, ExternalLink, Navigation } from "lucide-react";
import { SITE_CONFIG } from "@/content/site";
import { Button } from "@/components/ui/button";

export function MapEmbed() {
  const [isLoaded, setIsLoaded] = useState(false);
  const embedUrl = process.env.NEXT_PUBLIC_MAPS_EMBED_URL || SITE_CONFIG.maps.defaultEmbedUrl;
  const mapsLink = process.env.NEXT_PUBLIC_MAPS_LINK || SITE_CONFIG.maps.defaultMapsLink;

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative w-full h-[320px] sm:h-[400px] rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-stone-50">
        {isLoaded ? (
          embedUrl ? (
            <iframe
              src={embedUrl}
              title="Google Maps Location of Shri Vinayaka Temple Noida"
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
          )
        ) : (
          /* Click-to-load Facade (Zero 3rd party cookies on initial load) */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-stone-50/95 space-y-4">
            <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-stone-200 flex items-center justify-center text-temple-goldText">
              <Navigation className="w-7 h-7 text-temple-goldText animate-pulse motion-reduce:animate-none" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <p className="font-serif text-lg font-bold text-temple-charcoal">
                Interactive Campus &amp; Sanctum Map
              </p>
              <p className="text-xs text-temple-warmGrey leading-relaxed">
                Situated inside the campus of JSS University, Sector 62, Noida. Click below to load the interactive Google Map preview.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Button
                type="button"
                onClick={() => setIsLoaded(true)}
                className="h-10 px-5 text-xs font-semibold bg-temple-charcoal text-white hover:bg-black shadow-sm"
              >
                Load map
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 px-4 text-xs font-semibold border border-temple-charcoal bg-white text-temple-charcoal hover:bg-stone-100 shadow-sm"
              >
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
        )}
      </div>

      {/* Direct Open in Google Maps Link footer when loaded */}
      {isLoaded && (
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
      )}
    </div>
  );
}

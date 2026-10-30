import { Clock, MapPin, Navigation, Sparkles, ShieldCheck, Car, Droplets } from "lucide-react";
import { SITE_CONFIG } from "@/content/site";
import { MapEmbed } from "@/components/public/MapEmbed";

export function InfoGridSection() {
  return (
    <section id="timings" className="py-16 sm:py-24 px-4 bg-temple-sandstone/30 text-temple-charcoal border-b border-temple-stoneBorder">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-semibold tracking-widest text-temple-gold block">
            Plan Your Darshan
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-temple-charcoal">
            Timings, Location &amp; Devotee Amenities
          </h2>
          <div className="gold-divider max-w-xs mx-auto my-3" />
          <p className="font-devanagari text-base text-temple-kumkum font-medium">
            दर्शन समय एवं आवश्यक सूचना
          </p>
        </div>

        {/* Timings & Amenities Top Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Darshan Timings */}
          <div className="p-6 sm:p-8 rounded-xl border border-temple-stoneBorder bg-white shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-temple-sandstone flex items-center justify-center text-temple-kumkum">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-temple-charcoal">
                  Daily Darshan Timings
                </h3>
                <p className="font-devanagari text-xs text-temple-gold font-semibold">
                  सोमवार से रविवार (प्रतिदिन)
                </p>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-temple-stoneBorder/60">
              {SITE_CONFIG.timings.map((t, idx) => (
                <div key={idx} className={idx > 0 ? "pt-4 space-y-1" : "space-y-1"}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-base text-temple-charcoal">
                      {t.session} ({t.sessionHindi})
                    </span>
                    <span className="font-serif font-bold text-base text-temple-kumkum px-2.5 py-0.5 rounded bg-temple-kumkum/10">
                      {t.time}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-temple-warmGrey">
                    {t.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-lg bg-temple-sandstone/50 border border-temple-gold/20 text-xs text-temple-charcoal flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-temple-gold shrink-0 mt-0.5" />
              <span>
                Devotees are requested to arrive at least 15 minutes prior to Aarti for Sankalpa and Prashad distribution.
              </span>
            </div>
          </div>

          {/* Card 2: Devotee Amenities */}
          <div className="p-6 sm:p-8 rounded-xl border border-temple-stoneBorder bg-white shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-temple-sandstone flex items-center justify-center text-temple-kumkum">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-temple-charcoal">
                  Devotee Amenities
                </h3>
                <p className="font-devanagari text-xs text-temple-gold font-semibold">
                  भक्तों हेतु निःशुल्क सुविधाएं
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-temple-sandstone/40 border border-temple-stoneBorder space-y-1">
                <div className="flex items-center gap-2 text-temple-gold font-semibold text-sm">
                  <Car className="w-4 h-4 text-temple-kumkum" />
                  <span>Free On-Site Parking</span>
                </div>
                <p className="text-xs text-temple-warmGrey leading-relaxed">
                  Designated, safe parking spaces inside JSS campus for two-wheelers and cars.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-temple-sandstone/40 border border-temple-stoneBorder space-y-1">
                <div className="flex items-center gap-2 text-temple-gold font-semibold text-sm">
                  <Droplets className="w-4 h-4 text-temple-kumkum" />
                  <span>Clean Washrooms &amp; Water</span>
                </div>
                <p className="text-xs text-temple-warmGrey leading-relaxed">
                  Hygienic foot-washing taps, clean restrooms, and cold drinking water.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-temple-sandstone/40 border border-temple-stoneBorder sm:col-span-2 space-y-1">
                <div className="flex items-center gap-2 text-temple-gold font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-temple-kumkum" />
                  <span>Quiet Meditation Courtyard</span>
                </div>
                <p className="text-xs text-temple-warmGrey leading-relaxed">
                  Stone seating under lush green canopy, maintained with strict reverence and quietude for devotees seeking solitude.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Getting Here Section */}
        <div id="location" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Transit, Address & Campus Entry Note */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-xl border border-temple-stoneBorder bg-white shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-temple-sandstone flex items-center justify-center text-temple-kumkum">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-temple-charcoal">
                    Location &amp; Address
                  </h3>
                  <p className="text-xs text-temple-warmGrey">
                    Sector 62, Noida, Uttar Pradesh
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-temple-charcoal">
                <p className="font-medium leading-relaxed">
                  {SITE_CONFIG.location.fullAddress}
                </p>
                <p className="text-xs text-temple-warmGrey">
                  <strong>Landmark:</strong> {SITE_CONFIG.location.landmark}
                </p>
              </div>

              <div className="pt-4 border-t border-temple-stoneBorder space-y-3">
                <div className="flex items-center gap-2 text-temple-gold font-semibold text-sm">
                  <Navigation className="w-4 h-4 text-temple-kumkum" />
                  <span>Transit &amp; Nearest Metro</span>
                </div>
                <p className="text-xs text-temple-charcoal">
                  <strong>Nearest Station:</strong> {SITE_CONFIG.transit.nearestMetro}
                </p>
                <p className="text-xs text-temple-warmGrey">
                  {SITE_CONFIG.transit.distanceFromMetro} ({SITE_CONFIG.transit.busRoute}).
                </p>
              </div>

              {/* Getting Inside the Campus (Required Placeholder Field) */}
              <div className="p-4 rounded-lg bg-temple-sandstone/60 border border-temple-gold/30 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-temple-kumkum block">
                  Getting Inside the Campus
                </span>
                <p className="text-xs text-temple-charcoal leading-relaxed">
                  {SITE_CONFIG.location.campusEntryInstructions}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Google Maps Embed */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-xl border border-temple-stoneBorder bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-temple-charcoal">
                  Interactive Campus Map
                </h3>
                <span className="text-xs text-temple-warmGrey">Google Maps View</span>
              </div>
              <MapEmbed />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

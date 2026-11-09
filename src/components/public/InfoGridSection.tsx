import { MapPin, Navigation, Calendar, Phone, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { SITE_CONFIG } from "@/content/site";
import { templeDisplayPhone, templeTelHref } from "@/lib/phone";
import { MapEmbed } from "@/components/public/MapEmbed";
import { SectionDivider } from "./SectionDivider";
import { formatDisplayDate, formatDisplayTime } from "@/lib/date-utils";
import { EVENT_CATEGORY_LABELS, EventCategoryType } from "@/schemas/events";
import { LiveDarshanTimingsCard } from "@/components/public/LiveDarshanTimingsCard";
import { EventDateChip } from "@/components/public/EventDateChip";
import type { FormattedDarshanTimings } from "@/lib/darshan-timings";

interface NextEventProp {
  id: string;
  title: string;
  category: string;
  eventDate: Date;
  startTime?: string | null;
  description?: string | null;
}

export function TimingsAmenitiesSection({
  nextEvent,
  timings,
}: {
  nextEvent?: NextEventProp | null;
  timings?: FormattedDarshanTimings;
}) {
  const categoryLabel = nextEvent
    ? EVENT_CATEGORY_LABELS[nextEvent.category as EventCategoryType] || nextEvent.category
    : "";

  return (
    <section id="timings" className="pt-14 sm:pt-20 md:pt-24 pb-8 bg-temple-ivory text-temple-charcoal">
      <div className="max-w-5xl mx-auto px-4 space-y-10 sm:space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs uppercase font-semibold tracking-widest text-temple-goldText block">
            Plan Your Darshan
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-temple-charcoal">
            Timings &amp; Schedule
          </h2>
          <SectionDivider />
          <p className="font-devanagari text-base text-temple-kumkum font-medium">
            दर्शन समय एवं आगामी कार्यक्रम
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Daily Darshan Timings (Client Live Status Card) */}
          <LiveDarshanTimingsCard timings={timings} />

          {/* Card 2: Upcoming Events & Schedule (Interactive Card with Stretched Link) */}
          <article className="group relative rounded-xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 flex flex-col transition-all hover:shadow-md hover:border-temple-goldText/60 hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-temple-charcoal active:scale-[0.985] motion-reduce:transform-none motion-reduce:transition-none cursor-pointer">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-temple-kumkum">
                  <Calendar className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-temple-charcoal group-hover:text-temple-kumkum transition-colors">
                    Upcoming Events &amp; Schedule
                  </h3>
                  <p className="font-devanagari text-xs text-temple-goldText font-semibold">
                    उत्सव एवं विशेष पूजा कार्यक्रम
                  </p>
                </div>
              </div>
              {nextEvent && (
                <div className="relative z-10 shrink-0">
                  <EventDateChip eventDate={nextEvent.eventDate} />
                </div>
              )}
            </div>

            {nextEvent ? (
              <div className="space-y-3 flex-1">
                <span className="inline-block text-xs font-semibold uppercase tracking-wider text-temple-kumkum">
                  {categoryLabel}
                </span>
                <h4 className="font-serif text-lg font-bold text-temple-charcoal">
                  {nextEvent.title}
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-temple-charcoal font-medium">
                  <span>{formatDisplayDate(nextEvent.eventDate)}</span>
                  {nextEvent.startTime && (
                    <span className="text-temple-goldText">
                      · {formatDisplayTime(nextEvent.startTime)}
                    </span>
                  )}
                </div>
                {nextEvent.description && (
                  <p className="text-xs sm:text-sm text-temple-warmGrey leading-relaxed line-clamp-3">
                    {nextEvent.description}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 flex-1 flex flex-col justify-center py-2">
                <p className="text-sm text-temple-charcoal font-medium">
                  Dates will be announced soon. You can send a request through the form and the temple will get back to you.
                </p>
                {templeTelHref && templeDisplayPhone && (
                  <p className="text-xs text-temple-warmGrey">
                    For upcoming festival and Sankashti timings:{" "}
                    <a
                      href={templeTelHref}
                      className="relative z-10 font-bold text-temple-kumkum hover:underline inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-temple-charcoal rounded"
                    >
                      <Phone className="w-3 h-3 inline-block" />
                      <span>{templeDisplayPhone}</span>
                    </a>
                  </p>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <Link
                href="/schedule"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-temple-kumkum focus:outline-none after:absolute after:inset-0 rounded"
              >
                <span>View full schedule</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function LocationMapSection() {
  return (
    <section id="location" className="pt-8 pb-14 sm:pb-20 md:pb-24 bg-temple-ivory text-temple-charcoal">
      <div className="max-w-5xl mx-auto px-4 space-y-10 sm:space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-temple-charcoal">
            Location
          </h2>
          <SectionDivider />
        </div>

        {/* 1. Changed "items-start" to "items-stretch" so both columns match heights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-5 min-w-0">
            {/* 2. Added "h-full flex flex-col" to make the white box fill the column */}
            <div className="h-full flex flex-col p-6 sm:p-8 rounded-xl border border-stone-200 bg-white shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-temple-kumkum">
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
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-temple-warmGrey">
                  <Sparkles className="w-3.5 h-3.5 text-temple-goldText shrink-0" aria-hidden="true" />
                  <span>
                    Devotee Amenities: Free on-site parking · Clean restrooms
                  </span>
                </div>
              </div>

              {/* 3. Added "mt-auto" to push this block perfectly to the bottom of the card */}
              <div className="mt-auto pt-6 space-y-6">
                <div className="pt-4 border-t border-stone-100 space-y-3">
                  <div className="flex items-center gap-2 text-temple-goldText font-semibold text-sm">
                    <Navigation className="w-4 h-4 text-temple-kumkum" />
                    <span>Transit &amp; Nearest Metro</span>
                  </div>
                  <p className="text-xs text-temple-charcoal">
                    <strong>Nearest Station:</strong> {SITE_CONFIG.transit.nearestMetro}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-temple-kumkum block">
                    Campus Entry Instructions
                  </span>
                  <p className="text-xs text-temple-charcoal leading-relaxed">
                    {templeTelHref && templeDisplayPhone ? (
                      <>
                        Please call the temple for campus entry instructions:{" "}
                        <a
                          href={templeTelHref}
                          className="font-bold text-temple-kumkum hover:underline inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 inline-block" />
                          <span>{templeDisplayPhone}</span>
                        </a>
                      </>
                    ) : (
                      <>
                        Please send a request through the form and the temple will contact you with campus entry instructions.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 min-w-0">
            {/* 4. Added "h-full flex flex-col" here as well */}
            <div className="h-full flex flex-col p-6 sm:p-8 rounded-xl border border-stone-200 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-temple-charcoal">
                  Campus Location Map
                </h3>
                <span className="text-xs text-temple-warmGrey">Google Maps View</span>
              </div>
              <div className="flex-1 min-w-0">
                <MapEmbed />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
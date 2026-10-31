import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, Phone, Sparkles } from "lucide-react";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { SectionDivider } from "@/components/public/SectionDivider";
import { getUpcomingEvents } from "@/lib/events";
import {
  formatDisplayDate,
  formatDisplayTime,
  formatMonthYear,
  getRelativeDateChip,
} from "@/lib/date-utils";
import { SITE_CONFIG } from "@/content/site";
import { EventCategory } from "@prisma/client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Temple Schedule & Upcoming Events | Shri Vinayaka Temple",
  description:
    "View upcoming festivals, Sankashti Chaturthi dates, and special poojas at Shri Vinayaka Temple, Noida.",
};

const CATEGORY_CONFIG: Record<EventCategory, { label: string; badgeClass: string }> = {
  SANKASHTI: {
    label: "Sankashti Chaturthi",
    badgeClass: "bg-amber-100/90 text-amber-900 border-amber-300/80 font-semibold",
  },
  FESTIVAL: {
    label: "Temple Festival",
    badgeClass: "bg-rose-100/90 text-rose-900 border-rose-300/80 font-semibold",
  },
  SPECIAL_POOJA: {
    label: "Special Pooja",
    badgeClass: "bg-purple-100/90 text-purple-900 border-purple-300/80 font-semibold",
  },
  OTHER: {
    label: "Temple Event",
    badgeClass: "bg-stone-100 text-stone-800 border-stone-200",
  },
};

export default async function SchedulePage() {
  let events: Awaited<ReturnType<typeof getUpcomingEvents>> = [];

  try {
    events = await getUpcomingEvents();
  } catch (err) {
    console.error("[Schedule Page Fetch Error]", err);
  }

  // Group events by Month Year
  const groupedByMonth = events.reduce<Record<string, typeof events>>((acc, event) => {
    const monthKey = formatMonthYear(event.eventDate);
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(event);
    return acc;
  }, {});

  const monthKeys = Object.keys(groupedByMonth);

  return (
    <div className="min-h-screen flex flex-col bg-temple-ivory text-temple-charcoal">
      <Header />

      <main className="flex-1 py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12">
          {/* Page Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-semibold tracking-widest text-temple-goldText block">
              Sacred Calendar
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-temple-charcoal">
              Upcoming Events &amp; Schedule
            </h1>
            <p className="text-sm sm:text-base text-temple-warmGrey leading-relaxed">
              Join us for auspicious festivals, monthly Sankashti Chaturthi celebrations, and divine poojas at the sanctum.
            </p>
          </div>

          <SectionDivider />

          {/* Events Content */}
          {monthKeys.length > 0 ? (
            <div className="space-y-12">
              {monthKeys.map((month) => (
                <section key={month} aria-labelledby={`month-${month.replace(/\s+/g, "-")}`} className="space-y-4">
                  <h2
                    id={`month-${month.replace(/\s+/g, "-")}`}
                    className="font-serif text-xl sm:text-2xl font-bold text-temple-charcoal border-b border-[#16130F]/10 pb-2 flex items-center gap-2"
                  >
                    <Calendar className="w-5 h-5 text-temple-kumkum" aria-hidden="true" />
                    <span>{month}</span>
                  </h2>

                  <div className="space-y-4">
                    {groupedByMonth[month].map((event) => {
                      const displayDate = formatDisplayDate(event.eventDate);
                      const displayTime = formatDisplayTime(event.startTime);
                      const relativeChip = getRelativeDateChip(event.eventDate);
                      const catInfo = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.OTHER;
                      const isSankashti = event.category === "SANKASHTI";

                      return (
                        <article
                          key={event.id}
                          className={`relative rounded-xl border p-5 sm:p-6 bg-white/80 shadow-xs transition-all ${
                            isSankashti
                              ? "border-amber-300/80 bg-linear-to-r from-amber-50/40 via-white to-white"
                              : "border-[#16130F]/10"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border ${catInfo.badgeClass}`}
                                >
                                  {isSankashti && <Sparkles className="w-3 h-3 mr-1 text-amber-700" aria-hidden="true" />}
                                  {catInfo.label}
                                </span>

                                {relativeChip && (
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-temple-kumkum/10 text-temple-kumkum border border-temple-kumkum/20">
                                    {relativeChip}
                                  </span>
                                )}
                              </div>

                              <h3 className="font-serif text-lg sm:text-xl font-bold text-temple-charcoal tracking-wide">
                                {event.title}
                              </h3>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-temple-warmGrey font-medium">
                                <span className="flex items-center gap-1.5 text-temple-charcoal">
                                  <Calendar className="w-4 h-4 text-temple-kumkum" aria-hidden="true" />
                                  <span>{displayDate}</span>
                                </span>

                                {displayTime && (
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-temple-goldText" aria-hidden="true" />
                                    <span>{displayTime}</span>
                                  </span>
                                )}
                              </div>

                              {event.description && (
                                <p className="text-sm text-temple-warmGrey leading-relaxed pt-1">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* Calm Empty State */
            <div className="text-center py-16 px-4 space-y-4 max-w-md mx-auto">
              <Calendar className="w-12 h-12 text-temple-goldText mx-auto" aria-hidden="true" />
              <p className="text-base sm:text-lg font-medium text-temple-charcoal">
                Dates will be announced soon. Please call the temple.
              </p>
              <div>
                <a
                  href={SITE_CONFIG.contact.telHref}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-temple-kumkum hover:underline px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-temple-charcoal"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>Call {SITE_CONFIG.contact.displayPhone}</span>
                </a>
              </div>
            </div>
          )}

          {/* Devotee Assistance Note */}
          <div className="text-center pt-8 border-t border-[#16130F]/10 space-y-2">
            <p className="text-xs text-temple-warmGrey">
              To sponsor an upcoming festival or book a special archana, please contact the temple priest.
            </p>
            <Link
              href="/pooja"
              className="inline-block text-xs font-semibold text-temple-kumkum hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-temple-charcoal rounded px-2 py-1"
            >
              Request a Pooja or Homam &rarr;
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

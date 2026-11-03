"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { formatDisplayTime, getKolkataDateString } from "@/lib/date-utils";
import { EVENT_CATEGORY_LABELS, EventCategoryType } from "@/schemas/events";

export interface TodayEventItem {
  id: string;
  title: string;
  category: EventCategoryType;
  eventDate: string; // "YYYY-MM-DD"
  startTime: string | null;
  description: string | null;
}

interface TodayEventCardProps {
  events: TodayEventItem[];
  serverDateStr?: string;
}

export function TodayEventCard({ events, serverDateStr }: TodayEventCardProps) {
  const [mounted, setMounted] = useState(false);
  const [clientValid, setClientValid] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Client-side date check: if client is in a different day in Asia/Kolkata, or crossed midnight
    const clientToday = getKolkataDateString(new Date());
    if (serverDateStr && clientToday !== serverDateStr) {
      setClientValid(false);
    }
  }, [serverDateStr]);

  if (!events || events.length === 0 || (mounted && !clientValid)) {
    return null;
  }

  const primaryEvent = events[0];
  const secondaryEvent = events.length > 1 ? events[1] : null;
  const moreCount = events.length > 2 ? events.length - 2 : 0;

  return (
    <section
      role="region"
      aria-label="Today's event at the temple"
      className="relative w-full max-w-xl text-left bg-[#FDFBF7] rounded-xl border border-[#B8893B]/30 border-l-4 border-l-[#B8893B] p-3.5 sm:p-4 shadow-sm transition-[border-color,box-shadow] duration-200 [@media(hover:hover)]:hover:border-[#B8893B]/60 [@media(hover:hover)]:hover:shadow-md"
    >
      {/* Header Chip Row */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="inline-flex items-center gap-1.5 text-temple-goldText font-bold text-[11px] tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#B8893B]" aria-hidden="true" />
          <span>Today at the Temple</span>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-temple-goldText border border-amber-200/60">
          {EVENT_CATEGORY_LABELS[primaryEvent.category] || "Temple Event"}
        </span>
      </div>

      {/* Primary Event Title & Time (NO headings h1-h6 used) */}
      <div className="space-y-1">
        <p className="font-serif font-bold text-base sm:text-lg text-temple-charcoal leading-snug">
          {primaryEvent.title}
        </p>

        {primaryEvent.startTime && (
          <p className="inline-flex items-center gap-1.5 text-xs text-stone-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-temple-goldText" aria-hidden="true" />
            <span>{formatDisplayTime(primaryEvent.startTime)}</span>
          </p>
        )}

        {primaryEvent.description && (
          <p className="text-xs text-temple-warmGrey leading-relaxed line-clamp-2 pt-0.5">
            {primaryEvent.description}
          </p>
        )}
      </div>

      {/* Secondary Event (if 2 or more today) */}
      {secondaryEvent && (
        <div className="mt-2.5 pt-2 border-t border-[#B8893B]/15 flex items-center justify-between gap-2 text-xs">
          <div className="truncate">
            <span className="font-semibold text-temple-charcoal">{secondaryEvent.title}</span>
            {secondaryEvent.startTime && (
              <span className="text-stone-500 ml-1.5">
                ({formatDisplayTime(secondaryEvent.startTime)})
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-temple-warmGrey shrink-0">
            {EVENT_CATEGORY_LABELS[secondaryEvent.category] || "Event"}
          </span>
        </div>
      )}

      {/* Single Accessible Action Link */}
      <div className="mt-3 pt-2 border-t border-[#B8893B]/15 flex items-center justify-between">
        <Link
          href="/schedule#events"
          className="inline-flex items-center gap-1.5 min-h-[44px] py-2 text-xs sm:text-sm font-semibold text-temple-kumkum hover:text-temple-kumkumHover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-temple-kumkum rounded"
        >
          <span>
            {moreCount > 0
              ? `View all today's events (${events.length})`
              : "View details"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

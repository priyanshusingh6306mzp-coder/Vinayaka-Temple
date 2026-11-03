"use client";

import React, { useState, useEffect } from "react";
import { Clock, Sparkles } from "lucide-react";
import { getDarshanStatus, DarshanStatus } from "@/lib/darshan-status";
import {
  FormattedDarshanTimings,
  formatDarshanTimings,
  DEFAULT_DARSHAN_TIMINGS,
} from "@/lib/darshan-timings";

interface LiveDarshanTimingsCardProps {
  timings?: FormattedDarshanTimings;
}

export function LiveDarshanTimingsCard({ timings }: LiveDarshanTimingsCardProps) {
  const effectiveTimings = timings || formatDarshanTimings(DEFAULT_DARSHAN_TIMINGS);
  const [status, setStatus] = useState<DarshanStatus | null>(null);

  useEffect(() => {
    // Initial client evaluation
    setStatus(getDarshanStatus(new Date(), effectiveTimings));

    // Refresh every 60 seconds
    const interval = setInterval(() => {
      setStatus(getDarshanStatus(new Date(), effectiveTimings));
    }, 60000);

    return () => clearInterval(interval);
  }, [effectiveTimings]);

  // Determine active session
  const isMorningActive =
    status?.state === "open_morning" ||
    status?.state === "closed_morning" ||
    status?.state === "closed_night";

  const isEveningActive =
    status?.state === "open_evening" ||
    status?.state === "between_sessions";

  const morningFormatted = effectiveTimings.morning.formatted;
  const eveningFormatted = effectiveTimings.evening.formatted;

  return (
    <div className="p-6 sm:p-8 rounded-xl border border-stone-200 bg-white shadow-sm space-y-6 flex flex-col transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-temple-kumkum">
            <Clock className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-temple-charcoal">
              Daily Darshan Timings
            </h3>
            <p className="font-devanagari text-xs text-temple-goldText font-semibold">
              सोमवार से रविवार (प्रतिदिन)
            </p>
          </div>
        </div>

        {/* Live Open / Closed indicator */}
        {status && (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              status.isOpen
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-stone-100 text-stone-700 border-stone-200"
            }`}
          >
            {status.isOpen ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span>Open Now</span>
              </>
            ) : (
              <span>Closed</span>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Next / Current Darshan Line */}
      {status && (
        <div className="text-xs sm:text-sm font-medium text-temple-charcoal bg-amber-50/70 border border-amber-200/60 rounded-lg px-3 py-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-temple-goldText shrink-0" aria-hidden="true" />
          <span>{status.label}</span>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4 divide-y divide-stone-100">
        <div
          className={`transition-all ${
            isMorningActive
              ? "border-l-4 border-temple-goldText pl-3 py-1 bg-amber-50/30 rounded-r-lg"
              : "pl-1"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-base text-temple-charcoal">
              Morning Darshan (प्रातःकालीन दर्शन)
            </span>
            <span className="font-serif font-bold text-base text-temple-kumkum px-2.5 py-0.5 rounded bg-red-50 border border-red-100">
              {morningFormatted}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-temple-warmGrey mt-0.5">
            Daily morning darshan and prayer
          </p>
        </div>

        <div
          className={`transition-all pt-4 ${
            isEveningActive
              ? "border-l-4 border-temple-goldText pl-3 py-1 bg-amber-50/30 rounded-r-lg"
              : "pl-1"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-base text-temple-charcoal">
              Evening Darshan (सायंकालीन दर्शन)
            </span>
            <span className="font-serif font-bold text-base text-temple-kumkum px-2.5 py-0.5 rounded bg-red-50 border border-red-100">
              {eveningFormatted}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-temple-warmGrey mt-0.5">
            Daily evening darshan and prayer
          </p>
        </div>
      </div>

      {/* Welcome note */}
      <div className="mt-auto p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-temple-charcoal flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-temple-goldText shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          Devotees are welcome for peaceful darshan and prayers during temple opening hours.
        </span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getDarshanStatus, FALLBACK_DARSHAN_STATUS, DarshanStatus } from "@/lib/darshan-status";
import type { FormattedDarshanTimings } from "@/lib/darshan-timings";

interface DarshanStatusBadgeProps {
  timings?: FormattedDarshanTimings;
}

export function DarshanStatusBadge({ timings }: DarshanStatusBadgeProps) {
  const [status, setStatus] = useState<DarshanStatus | null>(null);

  useEffect(() => {
    // Initial mount calculation
    setStatus(getDarshanStatus(new Date(), timings));

    // Update every minute
    const interval = setInterval(() => {
      setStatus(getDarshanStatus(new Date(), timings));
    }, 60000);

    return () => clearInterval(interval);
  }, [timings]);

  return (
    <div
      className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-wide bg-white/90 border border-stone-300/80 text-temple-charcoal shadow-sm min-h-[36px]"
      aria-live="polite"
    >
      {status ? (
        <>
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            {status.isOpen ? (
              <>
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 motion-safe:animate-ping motion-reduce:hidden" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
            )}
          </span>
          <span>{status.label}</span>
        </>
      ) : (
        <>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-500" />
          <span>{FALLBACK_DARSHAN_STATUS}</span>
        </>
      )}
    </div>
  );
}

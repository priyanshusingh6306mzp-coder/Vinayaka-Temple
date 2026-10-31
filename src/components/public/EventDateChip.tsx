"use client";

import React, { useState, useEffect } from "react";
import { getRelativeDateChip } from "@/lib/date-utils";

interface EventDateChipProps {
  eventDate: Date | string;
  className?: string;
}

export function EventDateChip({ eventDate, className = "" }: EventDateChipProps) {
  const [chip, setChip] = useState<string | null>(null);

  useEffect(() => {
    setChip(getRelativeDateChip(eventDate));
  }, [eventDate]);

  if (!chip) return null;

  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-temple-kumkum/10 text-temple-kumkum border border-temple-kumkum/20 ${className}`}
    >
      {chip}
    </span>
  );
}

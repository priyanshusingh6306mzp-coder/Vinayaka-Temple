/**
 * Asia/Kolkata Darshan Status Helper
 *
 * Computes live temple open/closed status according to official timings in site.ts:
 * - Morning Darshan: 06:00 to 11:30
 * - Evening Darshan: 16:30 to 20:30
 */

export interface DarshanStatus {
  isOpen: boolean;
  label: string;
  state: "open_morning" | "open_evening" | "between_sessions" | "closed_morning" | "closed_night";
}

export const FALLBACK_DARSHAN_STATUS = "Daily darshan timings below";

/**
 * Returns the current darshan status in Asia/Kolkata for a given Date.
 */
export function getDarshanStatus(date: Date = new Date()): DarshanStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  const hourPart = parts.find((p) => p.type === "hour");
  const minutePart = parts.find((p) => p.type === "minute");

  const hour = hourPart ? parseInt(hourPart.value, 10) : 0;
  const minute = minutePart ? parseInt(minutePart.value, 10) : 0;

  const totalMinutes = hour * 60 + minute;

  // 00:00 to 05:59 -> Before morning session
  if (totalMinutes < 360) {
    return {
      isOpen: false,
      label: "Opens at 6:00 AM",
      state: "closed_morning",
    };
  }

  // 06:00 to 11:29 -> Morning darshan
  if (totalMinutes < 690) {
    return {
      isOpen: true,
      label: "Open now · Morning darshan until 11:30 AM",
      state: "open_morning",
    };
  }

  // 11:30 to 16:29 -> Between sessions
  if (totalMinutes < 990) {
    return {
      isOpen: false,
      label: "Opens at 4:30 PM",
      state: "between_sessions",
    };
  }

  // 16:30 to 20:29 -> Evening darshan
  if (totalMinutes < 1230) {
    return {
      isOpen: true,
      label: "Open now · Evening darshan until 8:30 PM",
      state: "open_evening",
    };
  }

  // 20:30 to 23:59 -> After evening session
  return {
    isOpen: false,
    label: "Opens tomorrow at 6:00 AM",
    state: "closed_night",
  };
}

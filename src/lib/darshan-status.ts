import { SITE_CONFIG } from "@/content/site";

/**
 * Asia/Kolkata Darshan Status Helper
 *
 * Computes live temple open/closed status dynamically derived from official timings in site.ts:
 * - Morning Darshan: 06:00 to 10:30
 * - Evening Darshan: 17:30 to 20:30
 */

export interface DarshanStatus {
  isOpen: boolean;
  label: string;
  state: "open_morning" | "open_evening" | "between_sessions" | "closed_morning" | "closed_night";
}

export const FALLBACK_DARSHAN_STATUS = "Daily darshan timings below";

/**
 * Converts "HH:mm" time string into total minutes from midnight.
 */
function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
  return h * 60 + m;
}

/**
 * Returns the current darshan status in Asia/Kolkata for a given Date.
 */
export function getDarshanStatus(date: Date = new Date()): DarshanStatus {
  const { morning, evening } = SITE_CONFIG.darshanSessions;

  const morningOpenMin = parseTimeToMinutes(morning.opens);
  const morningCloseMin = parseTimeToMinutes(morning.closes);
  const eveningOpenMin = parseTimeToMinutes(evening.opens);
  const eveningCloseMin = parseTimeToMinutes(evening.closes);

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

  // Before morning session: e.g. 00:00 to 05:59
  if (totalMinutes < morningOpenMin) {
    return {
      isOpen: false,
      label: `Opens at ${morning.openDisplay}`,
      state: "closed_morning",
    };
  }

  // Morning darshan: e.g. 06:00 to 10:29
  if (totalMinutes < morningCloseMin) {
    return {
      isOpen: true,
      label: `Open now · Morning darshan until ${morning.closeDisplay}`,
      state: "open_morning",
    };
  }

  // Between morning & evening sessions: e.g. 10:30 to 17:29
  if (totalMinutes < eveningOpenMin) {
    return {
      isOpen: false,
      label: `Opens at ${evening.openDisplay}`,
      state: "between_sessions",
    };
  }

  // Evening darshan: e.g. 17:30 to 20:29
  if (totalMinutes < eveningCloseMin) {
    return {
      isOpen: true,
      label: `Open now · Evening darshan until ${evening.closeDisplay}`,
      state: "open_evening",
    };
  }

  // After evening session: e.g. 20:30 to 23:59
  return {
    isOpen: false,
    label: `Opens tomorrow at ${morning.openDisplay}`,
    state: "closed_night",
  };
}

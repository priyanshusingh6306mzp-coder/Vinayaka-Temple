"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  DARSHAN_TIMINGS_SETTING_KEY,
  darshanTimingsSchema,
  DarshanTimingsData,
} from "@/lib/darshan-timings";

export interface TimingFieldErrors {
  morning?: {
    start?: string;
    end?: string;
  };
  evening?: {
    start?: string;
    end?: string;
  };
  general?: string;
}

export interface SaveTimingsResult {
  success: boolean;
  message: string;
  errors?: TimingFieldErrors;
}

async function retryDb<T>(fn: () => Promise<T>, retries = 5, delay = 1000): Promise<T> {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await db.$disconnect().catch(() => {});
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

/**
 * Saves updated darshan timings to the site settings store.
 * Requires an active ADMIN session and validates strict time constraints.
 */
export async function saveDarshanTimings(
  data: DarshanTimingsData,
  settingKey: string = DARSHAN_TIMINGS_SETTING_KEY
): Promise<SaveTimingsResult> {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return {
      success: false,
      message: "Unauthorized. Admin privileges required.",
    };
  }

  const parsed = darshanTimingsSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: TimingFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path;
      if (path[0] === "morning") {
        if (!fieldErrors.morning) fieldErrors.morning = {};
        if (path[1] === "start") fieldErrors.morning.start = issue.message;
        if (path[1] === "end") fieldErrors.morning.end = issue.message;
      } else if (path[0] === "evening") {
        if (!fieldErrors.evening) fieldErrors.evening = {};
        if (path[1] === "start") fieldErrors.evening.start = issue.message;
        if (path[1] === "end") fieldErrors.evening.end = issue.message;
      } else {
        fieldErrors.general = issue.message;
      }
    }

    return {
      success: false,
      message: "Please correct the errors in the timings form.",
      errors: fieldErrors,
    };
  }

  try {
    await retryDb(() =>
      db.siteSetting.upsert({
        where: { key: settingKey },
        create: {
          key: settingKey,
          value: parsed.data,
        },
        update: {
          value: parsed.data,
        },
      })
    );

    if (settingKey === DARSHAN_TIMINGS_SETTING_KEY) {
      revalidatePath("/", "layout");
      revalidatePath("/admin/timings");
    }

    return {
      success: true,
      message: "Darshan timings updated successfully.",
    };
  } catch (err) {
    console.error("[saveDarshanTimings Action Error]", err);
    return {
      success: false,
      message: "Failed to update darshan timings due to a database error.",
    };
  }
}

/**
 * Resets darshan timings by deleting the override row, returning to site.ts defaults.
 */
export async function resetDarshanTimings(
  settingKey: string = DARSHAN_TIMINGS_SETTING_KEY
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return {
      success: false,
      message: "Unauthorized. Admin privileges required.",
    };
  }

  try {
    await retryDb(() =>
      db.siteSetting.deleteMany({
        where: { key: settingKey },
      })
    );

    if (settingKey === DARSHAN_TIMINGS_SETTING_KEY) {
      revalidatePath("/", "layout");
      revalidatePath("/admin/timings");
    }

    return {
      success: true,
      message: "Darshan timings reset to default successfully.",
    };
  } catch (err) {
    console.error("[resetDarshanTimings Action Error]", err);
    return {
      success: false,
      message: "Failed to reset darshan timings.",
    };
  }
}

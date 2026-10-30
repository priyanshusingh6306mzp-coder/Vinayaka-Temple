import { db } from "@/lib/db";
import { IRateLimiter, RateLimitResult } from "@/lib/interfaces/ratelimit.interface";

export class PostgresRateLimiter implements IRateLimiter {
  async limit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = new Date();

    try {
      const existing = await db.rateLimit.findUnique({
        where: { key },
      });

      if (!existing) {
        await db.rateLimit.create({
          data: {
            key,
            windowStart: now,
            count: 1,
          },
        });
        return {
          success: true,
          remaining: maxRequests - 1,
          resetMs: windowMs,
        };
      }

      const elapsed = now.getTime() - existing.windowStart.getTime();

      if (elapsed > windowMs) {
        // Window expired, reset window
        await db.rateLimit.update({
          where: { key },
          data: {
            windowStart: now,
            count: 1,
          },
        });
        return {
          success: true,
          remaining: maxRequests - 1,
          resetMs: windowMs,
        };
      }

      // Inside current window
      if (existing.count >= maxRequests) {
        return {
          success: false,
          remaining: 0,
          resetMs: Math.max(0, windowMs - elapsed),
        };
      }

      const updated = await db.rateLimit.update({
        where: { key },
        data: {
          count: { increment: 1 },
        },
      });

      return {
        success: true,
        remaining: Math.max(0, maxRequests - updated.count),
        resetMs: Math.max(0, windowMs - elapsed),
      };
    } catch (err) {
      // In case of transient DB failure, fail open for critical paths or log
      console.error("[RateLimiter Error]", err);
      return { success: true, remaining: 1, resetMs: windowMs };
    }
  }

  async reset(key: string): Promise<void> {
    try {
      await db.rateLimit.deleteMany({
        where: { key },
      });
    } catch (err) {
      console.error("[RateLimiter Reset Error]", err);
    }
  }
}

export const rateLimiter = new PostgresRateLimiter();

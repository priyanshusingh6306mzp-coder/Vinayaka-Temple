export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMs: number;
}

export interface IRateLimiter {
  /**
   * Check and increment the rate limit for a given key.
   * @param key Unique identifier (e.g. "pooja:127.0.0.1" or "login:email@domain.com")
   * @param maxRequests Maximum requests allowed within the window
   * @param windowMs Time window in milliseconds
   */
  limit(key: string, maxRequests: number, windowMs: number): Promise<RateLimitResult>;

  /**
   * Reset the rate limit counter for a given key (e.g. after successful login)
   */
  reset(key: string): Promise<void>;
}

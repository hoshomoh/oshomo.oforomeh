type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const cache = new Map<string, RateLimitEntry>();

type RateLimitOptions = {
  interval: number; // milliseconds
  limit: number; // max requests per interval
};

export function rateLimit(options: RateLimitOptions) {
  const { interval, limit } = options;

  return {
    check: (token: string): boolean => {
      const now = Date.now();
      const entry = cache.get(token);

      // Clean up expired entries periodically
      if (cache.size > 1000) {
        for (const [key, value] of cache.entries()) {
          if (value.resetAt < now) {
            cache.delete(key);
          }
        }
      }

      if (!entry || entry.resetAt < now) {
        // New window or expired
        cache.set(token, {
          count: 1,
          resetAt: now + interval,
        });
        return true;
      }

      if (entry.count >= limit) {
        // Rate limited
        return false;
      }

      // Increment count
      entry.count += 1;
      cache.set(token, entry);
      return true;
    },
  };
}

// Create limiter: 10 requests per minute
export const chatLimiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  limit: 10,
});

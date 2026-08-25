/**
 * In-memory sliding window rate limiter for Next.js API routes / Edge runtime.
 * Protects sensitive endpoints (e.g. /api/auth/login) against brute force and DDoS.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetTime < now) {
      store.delete(key);
    }
  }
}, 60000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Check if an identifier (IP address) has exceeded the max allowed requests in windowMs.
 * @param identifier - IP or client identifier
 * @param maxRequests - Max requests allowed per window (e.g., 5)
 * @param windowMs - Window duration in ms (e.g., 60000 = 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || record.resetTime < now) {
    store.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
  };
}

/**
 * Resets the rate limit for a given identifier upon successful authentication.
 */
export function clearRateLimit(identifier: string): void {
  store.delete(identifier);
}
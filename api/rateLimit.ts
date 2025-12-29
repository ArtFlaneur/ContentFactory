/**
 * Simple in-memory rate limiter for serverless functions.
 * 
 * Note: This is a basic implementation suitable for moderate traffic.
 * For high-scale production use, consider @upstash/ratelimit with Redis.
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now >= entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

export type RateLimitConfig = {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  window: number;
};

/**
 * Check if a request should be rate limited.
 * Returns true if the request should proceed, false if rate limited.
 */
export const checkRateLimit = (
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } => {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry or expired window - allow and create new entry
  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + config.window
    });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: now + config.window
    };
  }

  // Within window - check limit
  if (entry.count < config.limit) {
    entry.count++;
    return {
      allowed: true,
      remaining: config.limit - entry.count,
      resetAt: entry.resetAt
    };
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt
  };
};

/**
 * Get client identifier from request.
 * Uses IP address or falls back to a default identifier.
 */
export const getClientIdentifier = (req: any): string => {
  // Try to get IP from various headers (Vercel/cloudflare/nginx)
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) {
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
    if (ip) return ip;
  }

  const realIp = req.headers?.['x-real-ip'];
  if (realIp) return realIp;

  const cfIp = req.headers?.['cf-connecting-ip'];
  if (cfIp) return cfIp;

  // Fallback to connection remote address
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
};

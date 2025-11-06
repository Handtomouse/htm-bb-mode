import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

/**
 * Rate limiter using Upstash Redis
 * Falls back to in-memory rate limiting if Redis is not configured
 */

// In-memory fallback for development
const cache = new Map();

export const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(
        parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "5", 10),
        `${parseInt(process.env.RATE_LIMIT_WINDOW_MS || "3600000", 10)}ms`
      ),
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : {
      // Simple in-memory rate limiter for development
      limit: async (identifier: string) => {
        const now = Date.now();
        const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "3600000", 10);
        const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "5", 10);

        const requests = cache.get(identifier) || [];
        const validRequests = requests.filter((timestamp: number) => now - timestamp < windowMs);

        if (validRequests.length >= maxRequests) {
          return {
            success: false,
            limit: maxRequests,
            remaining: 0,
            reset: Math.min(...validRequests) + windowMs,
          };
        }

        validRequests.push(now);
        cache.set(identifier, validRequests);

        // Cleanup old entries to prevent memory leak
        if (cache.size > 1000) {
          const entries = Array.from(cache.entries());
          cache.clear();
          entries.slice(-500).forEach(([key, value]) => cache.set(key, value));
        }

        return {
          success: true,
          limit: maxRequests,
          remaining: maxRequests - validRequests.length,
          reset: now + windowMs,
        };
      },
    };

/**
 * Get identifier for rate limiting (IP address or fingerprint)
 */
export function getIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (Vercel/Cloudflare)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip = cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown";

  // In production, you might want to combine IP with user agent for better fingerprinting
  const userAgent = request.headers.get("user-agent") || "";
  const fingerprint = `${ip}-${userAgent.slice(0, 50)}`;

  return fingerprint;
}

/**
 * Check rate limit and return appropriate response
 */
export async function checkRateLimit(request: NextRequest) {
  const identifier = getIdentifier(request);
  const result = await ratelimit.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfter: result.reset ? Math.ceil((result.reset - Date.now()) / 1000) : 0,
  };
}

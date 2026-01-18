import { LRUCache } from "lru-cache";

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 10000,
  ttl: 15 * 60 * 1000,
});

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 30 * 60 * 1000;

export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitCache.get(identifier);

  if (!entry) {
    rateLimitCache.set(identifier, { count: 1, firstAttempt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  if (now - entry.firstAttempt > WINDOW_MS) {
    rateLimitCache.set(identifier, { count: 1, firstAttempt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.firstAttempt + LOCKOUT_MS - now) / 1000);
    return { 
      allowed: false, 
      remainingAttempts: 0, 
      retryAfter: retryAfter > 0 ? retryAfter : undefined 
    };
  }

  entry.count++;
  rateLimitCache.set(identifier, entry);
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - entry.count };
}

export function resetRateLimit(identifier: string): void {
  rateLimitCache.delete(identifier);
}

export function getRateLimitKey(ip: string | null, email: string): string {
  return `${ip || "unknown"}_${email.toLowerCase()}`;
}

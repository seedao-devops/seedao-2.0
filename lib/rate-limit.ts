import { store } from "./fake-data/db";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.rate_limits.get(key);

  if (!entry || now > entry.reset_at) {
    store.rate_limits.set(key, { count: 1, reset_at: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count };
}

/* Sliding-window rate limiter kept in memory. On serverless hosts each instance keeps
   its own window, so treat this as abuse damping, not a hard quota. */

type Options = { limit: number; windowMs: number; now?: () => number };
type Result = { allowed: boolean; retryAfterMs: number };

const MAX_TRACKED_KEYS = 5_000;

export function createRateLimiter({ limit, windowMs, now = Date.now }: Options) {
  let hits = new Map<string, readonly number[]>();

  function check(key: string): Result {
    const t = now();
    const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);

    if (recent.length >= limit) {
      hits = new Map(hits).set(key, recent);
      return { allowed: false, retryAfterMs: windowMs - (t - recent[0]) };
    }

    const next = new Map(hits.size >= MAX_TRACKED_KEYS ? [] : hits);
    hits = next.set(key, [...recent, t]);
    return { allowed: true, retryAfterMs: 0 };
  }

  return { check };
}

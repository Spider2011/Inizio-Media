import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rate-limit';

describe('createRateLimiter', () => {
  it('allows up to the limit inside the window, then blocks with a retry time', () => {
    let now = 1_000;
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, now: () => now });
    expect(limiter.check('a').allowed).toBe(true);
    now += 10_000;
    expect(limiter.check('a').allowed).toBe(true);
    now += 5_000;
    expect(limiter.check('a')).toEqual({ allowed: false, retryAfterMs: 45_000 });
  });

  it('frees the slot once the oldest hit leaves the window', () => {
    let now = 0;
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => now });
    expect(limiter.check('a').allowed).toBe(true);
    now = 999;
    expect(limiter.check('a').allowed).toBe(false);
    now = 1_000;
    expect(limiter.check('a').allowed).toBe(true);
  });

  it('tracks keys separately', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => 0 });
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('b').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
  });
});

// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { MemoryRedis } from './memory-redis';
import { createNotesStore, getNotesStore, readRedisConfig } from './store';

function setup() {
  let t = Date.parse('2026-11-08T10:00:00Z');
  const clock = { now: () => t, advance: (ms: number) => (t += ms) };
  const redis = new MemoryRedis(clock.now);
  return { store: createNotesStore(redis), redis, clock };
}

const input = (text: string) => ({ text, name: 'Chai Co', paper: 'butter' as const });

describe('notes store', () => {
  it('keeps new notes pending and off the public wall', async () => {
    const { store } = setup();
    const note = await store.create(input('Great work'), 'a', new Date('2026-11-08T10:00:00Z'));

    expect(note).toEqual({ id: 'a', text: 'Great work', name: 'Chai Co', paper: 'butter', createdAt: '2026-11-08T10:00:00.000Z', approved: false });
    expect(await store.listApproved()).toEqual([]);
    expect((await store.listPending()).map((n) => n.id)).toEqual(['a']);
  });

  it('lists approved notes newest first, by when they were written', async () => {
    const { store } = setup();
    await store.create(input('first'), 'a', new Date('2026-11-01T10:00:00Z'));
    await store.create(input('second'), 'b', new Date('2026-11-02T10:00:00Z'));
    await store.create(input('third'), 'c', new Date('2026-11-03T10:00:00Z'));
    // Approval order must not matter.
    await store.approve('c');
    await store.approve('a');
    await store.approve('b');

    const wall = await store.listApproved();
    expect(wall.map((n) => n.id)).toEqual(['c', 'b', 'a']);
    expect(wall.every((n) => n.approved)).toBe(true);
    expect(await store.listPending()).toEqual([]);
    expect((await store.listApproved(2)).map((n) => n.id)).toEqual(['c', 'b']);
  });

  it('deletes a note from everywhere', async () => {
    const { store } = setup();
    await store.create(input('bye'), 'a', new Date());
    await store.approve('a');

    expect(await store.remove('a')).toBe(true);
    expect(await store.listApproved()).toEqual([]);
    expect(await store.remove('a')).toBe(false);
    expect(await store.approve('a')).toBe(false);
  });

  it('skips stored values that are not valid notes', async () => {
    const { store, redis } = setup();
    await store.create(input('ok'), 'a', new Date());
    await store.approve('a');
    await redis.hset('wall:notes', { b: { id: 'b', text: 1 } });
    await redis.zadd('wall:approved', { score: Date.now() + 1, member: 'b' });

    expect((await store.listApproved()).map((n) => n.id)).toEqual(['a']);
  });

  it('allows 3 hits per window, then reports when to retry', async () => {
    const { store, clock } = setup();
    for (let i = 0; i < 3; i += 1) expect((await store.hit('ip', 3, 3600)).allowed).toBe(true);

    expect(await store.hit('ip', 3, 3600)).toEqual({ allowed: false, retryAfterSeconds: 3600 });
    expect((await store.hit('other-ip', 3, 3600)).allowed).toBe(true);

    clock.advance(3600 * 1000);
    expect((await store.hit('ip', 3, 3600)).allowed).toBe(true);
  });
});

describe('store configuration', () => {
  it('reads either pair of Upstash variable names', () => {
    expect(readRedisConfig({ KV_REST_API_URL: 'https://kv', KV_REST_API_TOKEN: 't' })).toEqual({ url: 'https://kv', token: 't' });
    expect(readRedisConfig({ UPSTASH_REDIS_REST_URL: 'https://up', UPSTASH_REDIS_REST_TOKEN: 'u' })).toEqual({ url: 'https://up', token: 'u' });
    expect(readRedisConfig({ KV_REST_API_URL: 'https://kv' })).toBeNull();
  });

  it('has no store in production without a database, and a memory one otherwise', () => {
    expect(getNotesStore({ NODE_ENV: 'production' })).toBeNull();
    expect(getNotesStore({ NODE_ENV: 'production', NOTES_STORE: 'memory' })).not.toBeNull();
    expect(getNotesStore({ NODE_ENV: 'development' })).not.toBeNull();
  });
});

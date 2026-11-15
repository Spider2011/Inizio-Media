/* Where wall notes live: Upstash Redis in production, an in-memory stand-in in development.
   Layout: one hash of notes by id, plus two sorted sets (pending, approved) scored by creation time,
   so the wall reads newest-first with one range query. */
import 'server-only';
import { Redis } from '@upstash/redis';
import { MemoryRedis } from './memory-redis';
import { PAPERS, type Note, type NoteInput } from './note';

const KEYS = {
  notes: 'wall:notes',
  pending: 'wall:pending',
  approved: 'wall:approved'
} as const;

/** The most notes the public wall ever loads. */
export const WALL_LIMIT = 200;
/** The most pending notes the admin page lists at once (newest first). */
export const PENDING_LIMIT = 200;

/* The subset of the Upstash client the store calls; MemoryRedis implements the same. */
export type RedisLike = Pick<MemoryRedis, 'hset' | 'hget' | 'hmget' | 'hdel' | 'zadd' | 'zrem' | 'zrange' | 'zcard' | 'incr' | 'expire' | 'ttl'>;

export type RateResult = { allowed: boolean; retryAfterSeconds: number };

export interface NotesStore {
  listApproved(limit?: number): Promise<Note[]>;
  listPending(): Promise<Note[]>;
  create(input: NoteInput, id: string, now: Date): Promise<Note>;
  approve(id: string): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  /** Counts one hit for `key` in a fixed window and says whether it is still under `limit`. */
  hit(key: string, limit: number, windowSeconds: number): Promise<RateResult>;
}

/* Data read back from storage is checked like any outside input. */
function parseNote(value: unknown): Note | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const valid =
    typeof v.id === 'string' &&
    typeof v.text === 'string' &&
    typeof v.name === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.approved === 'boolean' &&
    (PAPERS as readonly unknown[]).includes(v.paper);
  return valid ? (v as Note) : null;
}

export function createNotesStore(redis: RedisLike): NotesStore {
  async function read(ids: string[]): Promise<Note[]> {
    if (ids.length === 0) return [];
    const found = (await redis.hmget<Record<string, unknown>>(KEYS.notes, ...ids)) ?? {};
    return ids.map((id) => parseNote(found[id])).filter((note): note is Note => note !== null);
  }

  return {
    async listApproved(limit = WALL_LIMIT) {
      return read(await redis.zrange(KEYS.approved, 0, limit - 1, { rev: true }));
    },

    async listPending() {
      return read(await redis.zrange(KEYS.pending, 0, PENDING_LIMIT - 1, { rev: true }));
    },

    async create(input, id, now) {
      const note: Note = { id, ...input, createdAt: now.toISOString(), approved: false };
      await redis.hset(KEYS.notes, { [id]: note });
      await redis.zadd(KEYS.pending, { score: now.getTime(), member: id });
      return note;
    },

    async approve(id) {
      const note = parseNote(await redis.hget(KEYS.notes, id));
      if (!note) return false;
      await redis.hset(KEYS.notes, { [id]: { ...note, approved: true } });
      await redis.zadd(KEYS.approved, { score: Date.parse(note.createdAt), member: id });
      await redis.zrem(KEYS.pending, id);
      // A delete that ran between the read and the writes must win: never leave a deleted note public.
      if (!parseNote(await redis.hget(KEYS.notes, id))) {
        await redis.zrem(KEYS.approved, id);
        return false;
      }
      return true;
    },

    async remove(id) {
      const removed = await redis.hdel(KEYS.notes, id);
      await redis.zrem(KEYS.pending, id);
      await redis.zrem(KEYS.approved, id);
      return removed > 0;
    },

    async hit(key, limit, windowSeconds) {
      const counterKey = `wall:rate:${key}`;
      const count = await redis.incr(counterKey);
      if (count === 1) await redis.expire(counterKey, windowSeconds);
      if (count <= limit) return { allowed: true, retryAfterSeconds: 0 };
      const ttl = await redis.ttl(counterKey);
      // A counter left without an expiry (a crash between INCR and EXPIRE) must not block forever.
      if (ttl < 0) await redis.expire(counterKey, windowSeconds);
      return { allowed: false, retryAfterSeconds: ttl > 0 ? ttl : windowSeconds };
    }
  };
}

type Env = Record<string, string | undefined>;

/* Vercel's Upstash integration names the variables KV_REST_API_*; Upstash's own console uses UPSTASH_REDIS_REST_*. */
export function readRedisConfig(env: Env): { url: string; token: string } | null {
  const url = (env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL)?.trim();
  const token = (env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN)?.trim();
  return url && token ? { url, token } : null;
}

/* Survives hot reloads in development, so local notes are not wiped on every edit. */
const globalMemory = globalThis as typeof globalThis & { __wallMemoryRedis?: MemoryRedis };

/**
 * The store for this environment, or null when production has no database connected
 * (the wall then shows its empty state and pinning says it is not set up yet).
 */
export function getNotesStore(env: Env = process.env): NotesStore | null {
  const config = readRedisConfig(env);
  if (config) return createNotesStore(new Redis(config) as unknown as RedisLike);
  if (env.NODE_ENV === 'production' && env.NOTES_STORE !== 'memory') return null;
  globalMemory.__wallMemoryRedis ??= new MemoryRedis();
  return createNotesStore(globalMemory.__wallMemoryRedis);
}

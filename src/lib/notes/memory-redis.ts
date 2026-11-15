/* The few Redis commands the notes store uses, kept in memory. It stands in for Upstash in local
   development and tests, so one store implementation runs everywhere. Values are copied in and out
   (as JSON, like Upstash's automatic serialisation), so callers never share objects with the store. */

type Member = { score: number; member: string };

const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export class MemoryRedis {
  private hashes = new Map<string, Map<string, unknown>>();
  private sets = new Map<string, Member[]>();
  private counters = new Map<string, { value: number; expiresAt: number | null }>();

  constructor(private readonly now: () => number = Date.now) {}

  async hset(key: string, values: Record<string, unknown>): Promise<number> {
    const hash = new Map(this.hashes.get(key));
    const added = Object.keys(values).filter((field) => !hash.has(field)).length;
    Object.entries(values).forEach(([field, value]) => hash.set(field, copy(value)));
    this.hashes.set(key, hash);
    return added;
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = this.hashes.get(key)?.get(field);
    return value === undefined ? null : copy(value as T);
  }

  async hmget<T extends Record<string, unknown>>(key: string, ...fields: string[]): Promise<T | null> {
    const hash = this.hashes.get(key);
    if (!hash || fields.every((field) => !hash.has(field))) return null;
    return Object.fromEntries(fields.map((field) => [field, hash.has(field) ? copy(hash.get(field)) : null])) as T;
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    const hash = new Map(this.hashes.get(key));
    const removed = fields.filter((field) => hash.delete(field)).length;
    this.hashes.set(key, hash);
    return removed;
  }

  async zadd(key: string, entry: Member): Promise<number> {
    const rest = (this.sets.get(key) ?? []).filter((m) => m.member !== entry.member);
    const isNew = rest.length === (this.sets.get(key) ?? []).length;
    this.sets.set(key, [...rest, { ...entry }].sort((a, b) => a.score - b.score || a.member.localeCompare(b.member)));
    return isNew ? 1 : 0;
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    const before = this.sets.get(key) ?? [];
    const after = before.filter((m) => !members.includes(m.member));
    this.sets.set(key, after);
    return before.length - after.length;
  }

  async zrange(key: string, start: number, stop: number, options?: { rev?: boolean }): Promise<string[]> {
    const members = (this.sets.get(key) ?? []).map((m) => m.member);
    const ordered = options?.rev ? [...members].reverse() : members;
    return ordered.slice(start, stop < 0 ? ordered.length + stop + 1 : stop + 1);
  }

  async zcard(key: string): Promise<number> {
    return (this.sets.get(key) ?? []).length;
  }

  private live(key: string) {
    const counter = this.counters.get(key);
    if (counter && counter.expiresAt !== null && counter.expiresAt <= this.now()) {
      this.counters.delete(key);
      return undefined;
    }
    return counter;
  }

  async incr(key: string): Promise<number> {
    const counter = this.live(key);
    const value = (counter?.value ?? 0) + 1;
    this.counters.set(key, { value, expiresAt: counter?.expiresAt ?? null });
    return value;
  }

  async expire(key: string, seconds: number): Promise<0 | 1> {
    const counter = this.live(key);
    if (!counter) return 0;
    this.counters.set(key, { ...counter, expiresAt: this.now() + seconds * 1000 });
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const counter = this.live(key);
    if (!counter) return -2;
    if (counter.expiresAt === null) return -1;
    return Math.ceil((counter.expiresAt - this.now()) / 1000);
  }
}

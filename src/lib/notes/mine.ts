/* The poster's own notes, kept on their device until Inizio approves them, so they can see
   their note on the wall straight away ("Only you can see this until Inizio approves it."). */
import { PAPERS, type Note } from './note';

export const MINE_KEY = 'inizio-wall-mine';
const MAX_MINE = 10;
const KEEP_DAYS = 30;

export type WallEntry = Note & { pending: boolean };

function isNote(value: unknown): value is Note {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.text === 'string' &&
    typeof v.name === 'string' &&
    typeof v.createdAt === 'string' &&
    !Number.isNaN(Date.parse(v.createdAt)) &&
    (PAPERS as readonly unknown[]).includes(v.paper)
  );
}

/** Parses what was saved, dropping anything malformed or older than 30 days. */
export function parseMine(raw: string | null, now: number = Date.now()): Note[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const cutoff = now - KEEP_DAYS * 24 * 60 * 60 * 1000;
    return value.filter(isNote).filter((note) => Date.parse(note.createdAt) >= cutoff).slice(0, MAX_MINE);
  } catch {
    return [];
  }
}

export function addMine(mine: readonly Note[], note: Note): Note[] {
  return [note, ...mine.filter((n) => n.id !== note.id)].slice(0, MAX_MINE);
}

/** Drops the poster's notes that are now approved (they appear on the wall for everyone). */
export function stillPending(mine: readonly Note[], approved: readonly Note[]): Note[] {
  const live = new Set(approved.map((n) => n.id));
  return mine.filter((n) => !live.has(n.id));
}

/** The wall as this visitor sees it: everything, newest first, with their pending notes marked. */
export function mergeWall(approved: readonly Note[], mine: readonly Note[]): WallEntry[] {
  const pending = stillPending(mine, approved).map((n) => ({ ...n, pending: true }));
  const live = approved.map((n) => ({ ...n, pending: false }));
  return [...pending, ...live].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

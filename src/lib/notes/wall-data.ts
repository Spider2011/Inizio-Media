/* The approved notes for the public wall, cached between visits and refreshed the moment
   Inizio approves or deletes one (the admin actions expire WALL_TAG). */
import 'server-only';
import { unstable_cache } from 'next/cache';
import type { Note } from './note';
import { getNotesStore } from './store';

export const WALL_TAG = 'beginnings-wall';

const cachedApproved = unstable_cache(
  async (): Promise<Note[]> => {
    const store = getNotesStore();
    return store ? store.listApproved() : [];
  },
  ['beginnings-wall-approved'],
  { tags: [WALL_TAG], revalidate: 60 * 60 }
);

/* A failed read is not cached (it throws inside the cache), so the wall recovers on the next visit. */
export async function getWallNotes(): Promise<Note[]> {
  try {
    return await cachedApproved();
  } catch (error) {
    console.error('[beginnings-wall] could not load notes', error);
    return [];
  }
}

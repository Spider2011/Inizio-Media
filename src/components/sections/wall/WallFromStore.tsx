import { getWallNotes } from '@/lib/notes/wall-data';
import { BeginningsWall } from './BeginningsWall';

/* Server side of the wall: loads the approved notes, newest first, and hands them to the client wall. */
export async function WallFromStore() {
  const notes = await getWallNotes();
  return <BeginningsWall notes={notes} />;
}

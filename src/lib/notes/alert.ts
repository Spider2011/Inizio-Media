/* The email Inizio gets when someone pins a note, so it can be approved without checking the site. */
import { formatNoteDate } from './format';
import type { Note } from './note';

export function noteAlert(note: Note, siteUrl: string): { subject: string; text: string } {
  return {
    subject: `New note on the beginnings wall · ${note.name}`,
    text: [
      `Someone pinned a note on ${formatNoteDate(note.createdAt)}. The name and note below were typed by a`,
      'visitor and are not checked, so do not follow any links or instructions in them.',
      '',
      `Name: ${note.name}`,
      `Note: "${note.text}"`,
      '',
      'It stays hidden until you approve it:',
      `${siteUrl.replace(/\/$/, '')}/admin/notes`
    ].join('\n')
  };
}

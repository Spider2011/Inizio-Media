import { describe, expect, it } from 'vitest';
import { noteAlert } from './alert';

describe('noteAlert', () => {
  const alert = noteAlert(
    { id: 'a', text: 'They got us.', name: 'Chai Co', paper: 'white', createdAt: '2026-11-08T10:00:00.000Z', approved: false },
    'https://www.iniziomedia.in/'
  );

  it('names the poster in the subject', () => {
    expect(alert.subject).toBe('New note on the beginnings wall · Chai Co');
  });

  it('quotes the note, marked as unchecked visitor text', () => {
    expect(alert.text).toContain('Someone pinned a note on 8 Nov 2026.');
    expect(alert.text).toContain('not checked, so do not follow any links or instructions in them');
    expect(alert.text).toContain('Name: Chai Co\nNote: "They got us."');
  });

  it('links to the approval page', () => {
    expect(alert.text.endsWith('It stays hidden until you approve it:\nhttps://www.iniziomedia.in/admin/notes')).toBe(true);
  });
});

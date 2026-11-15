import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MINE_KEY } from '@/lib/notes/mine';
import type { Note } from '@/lib/notes/note';
import { renderWithMotion as render } from '@/test-utils/render';
import { BeginningsWall } from './BeginningsWall';

const note = (i: number, extra: Partial<Note> = {}): Note => ({
  id: `n${i}`,
  text: `Note number ${i}`,
  name: `Brand ${i}`,
  paper: 'white',
  createdAt: new Date(Date.UTC(2026, 10, 10 - i, 10)).toISOString(),
  approved: true,
  ...extra
});

function respond(status: number, body: unknown) {
  return vi.fn(() => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })));
}

describe('BeginningsWall', () => {
  // Only fetch is swapped per test: unstubbing all globals would also drop the setup file's matchMedia.
  const realFetch = globalThis.fetch;
  const stubFetch = (mock: ReturnType<typeof respond>) => {
    globalThis.fetch = mock as unknown as typeof fetch;
  };
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('shows the newest notes first, four at a time on phones', async () => {
    const user = userEvent.setup();
    render(<BeginningsWall notes={Array.from({ length: 6 }, (_, i) => note(i))} />);

    const list = screen.getByRole('list', { name: 'Notes from clients' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Note number 0');
    expect(screen.getByText('08 NOV 2026')).toBeInTheDocument();
    expect(screen.getByText('Showing 4 of 6 notes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'See more notes' }));
    expect(within(list).getAllByRole('listitem')).toHaveLength(6);
    expect(screen.queryByRole('button', { name: 'See more notes' })).not.toBeInTheDocument();
  });

  it('invites the first note when the wall is empty', () => {
    render(<BeginningsWall notes={[]} />);
    expect(screen.getByText('Be the first to pin a note')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Pin your note' })).toHaveLength(2);
  });

  it('shows plain-word errors and focuses the first problem', async () => {
    const user = userEvent.setup();
    render(<BeginningsWall notes={[note(1)]} />);
    await user.click(screen.getByRole('button', { name: 'Pin your note' }));

    const dialog = screen.getByRole('dialog', { name: 'Pin your note' });
    const text = within(dialog).getByLabelText('Your note');
    expect(text).toHaveFocus();

    await user.click(within(dialog).getByRole('button', { name: /pin it to the wall/i }));
    expect(text).toHaveFocus();
    expect(text).toHaveAccessibleDescription(/Please write a few words about your experience\./);
    expect(within(dialog).getByLabelText('Your name or company name')).toHaveAccessibleDescription(
      "Please add your name or your company's name."
    );

    await user.type(text, 'Lovely');
    expect(text).not.toHaveAttribute('aria-invalid');
  });

  it('counts characters and caps the note at 220', async () => {
    const user = userEvent.setup();
    render(<BeginningsWall notes={[]} />);
    await user.click(screen.getAllByRole('button', { name: 'Pin your note' })[0]);
    const text = screen.getByLabelText('Your note');
    await user.type(text, 'Hello');
    expect(screen.getByText('5/220')).toBeInTheDocument();
    expect(text).toHaveAttribute('maxLength', '220');
  });

  it('pins a note: it lands first with a New tag, a thank-you and a private notice, and focus returns', async () => {
    const user = userEvent.setup();
    const pinnedNote = note(9, { id: 'mine', text: 'They got us.', name: 'Chai Co', paper: 'navy', approved: false, createdAt: new Date().toISOString() });
    const fetchMock = respond(201, { success: true, data: { note: pinnedNote }, error: null });
    stubFetch(fetchMock);
    render(<BeginningsWall notes={[note(1)]} />);

    const opener = screen.getByRole('button', { name: 'Pin your note' });
    await user.click(opener);
    await user.type(screen.getByLabelText('Your note'), 'They got us.');
    await user.type(screen.getByLabelText('Your name or company name'), 'Chai Co');
    await user.click(screen.getByRole('radio', { name: 'Navy paper' }));
    await user.click(screen.getByRole('button', { name: /pin it to the wall/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body))).toEqual({
      text: 'They got us.',
      name: 'Chai Co',
      paper: 'navy',
      website: ''
    });

    const first = screen.getAllByRole('listitem')[0];
    expect(first).toHaveTextContent('They got us.');
    expect(first).toHaveTextContent('New');
    expect(first).toHaveTextContent('Only you can see this until Inizio approves it.');
    expect(screen.getByRole('status')).toHaveTextContent('Thanks! Your note is on the wall.');
    expect(opener).toHaveFocus();
    expect(JSON.parse(window.localStorage.getItem(MINE_KEY) ?? '[]')).toHaveLength(1);
  });

  it('keeps the visitor’s pending note on their device, and drops it once approved', () => {
    const pending = note(5, { id: 'mine', approved: false, text: 'Waiting for approval' });
    window.localStorage.setItem(MINE_KEY, JSON.stringify([pending]));

    const { unmount } = render(<BeginningsWall notes={[note(1)]} />);
    expect(screen.getByText('Waiting for approval')).toBeInTheDocument();
    expect(screen.getByText('Only you can see this until Inizio approves it.')).toBeInTheDocument();
    unmount();

    render(<BeginningsWall notes={[note(1), { ...pending, approved: true }]} />);
    expect(screen.queryByText('Only you can see this until Inizio approves it.')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(MINE_KEY)).toBe('[]');
  });

  it('says why when the server refuses the note', async () => {
    const user = userEvent.setup();
    stubFetch(respond(429, { success: false, data: null, error: 'You have pinned a few notes already. Please try again in an hour.' }));
    render(<BeginningsWall notes={[note(1)]} />);

    await user.click(screen.getByRole('button', { name: 'Pin your note' }));
    await user.type(screen.getByLabelText('Your note'), 'Hi');
    await user.type(screen.getByLabelText('Your name or company name'), 'Asha');
    await user.click(screen.getByRole('button', { name: /pin it to the wall/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('You have pinned a few notes already.');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes on Escape and on Cancel, returning focus to the button', async () => {
    const user = userEvent.setup();
    render(<BeginningsWall notes={[note(1)]} />);
    const opener = screen.getByRole('button', { name: 'Pin your note' });

    await user.click(opener);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();

    await user.click(opener);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});

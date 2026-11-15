'use client';

import { useEffect, useMemo, useRef, useState, type Ref } from 'react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { addMine, MINE_KEY, mergeWall, parseMine, stillPending } from '@/lib/notes/mine';
import type { Note } from '@/lib/notes/note';
import { handFont, stampFont } from '@/styles/wall-fonts';
import { PinNoteDialog } from './PinNoteDialog';
import { Pushpin } from './Pushpin';
import { BlankNote, WallNote } from './WallNote';
import styles from './BeginningsWall.module.css';

type Props = { notes: Note[] };

const DESKTOP = '(min-width: 1024px)';
const THANKS = 'Thanks! Your note is on the wall.';
const TOAST_MS = 6000;

/* Browser storage can be missing or blocked (private windows, strict settings); the wall works without it. */
function readMine(): Note[] {
  try {
    return parseMine(window.localStorage.getItem(MINE_KEY));
  } catch {
    return [];
  }
}

function saveMine(notes: Note[]) {
  try {
    window.localStorage.setItem(MINE_KEY, JSON.stringify(notes));
  } catch {
    // Not saved: the note still shows until the page is left.
  }
}

/* The beginnings wall: client notes pinned up newest first, and a form to pin your own. */
export function BeginningsWall({ notes }: Props) {
  const isDesktop = useMediaQuery(DESKTOP, true);
  const step = isDesktop ? 8 : 4;
  const [pages, setPages] = useState(1);
  const [mine, setMine] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [justPinned, setJustPinned] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const opener = useRef<HTMLButtonElement | null>(null);
  const headButton = useRef<HTMLButtonElement>(null);

  // The visitor's own unapproved notes live on their device; approved ones are dropped from it.
  useEffect(() => {
    const saved = readMine();
    const pending = stillPending(saved, notes);
    if (pending.length !== saved.length) saveMine(pending);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage is only readable after hydration
    setMine(pending);
  }, [notes]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const wall = useMemo(() => mergeWall(notes, mine), [notes, mine]);
  const shown = wall.slice(0, step * pages);
  const hasMore = shown.length < wall.length;

  function openForm(button: HTMLButtonElement) {
    opener.current = button;
    setOpen(true);
  }

  function pinned(note: Note) {
    const next = addMine(mine, note);
    saveMine(next);
    setMine(next);
    setJustPinned(note.id);
    setOpen(false);
    setToast(THANKS);
  }

  // The empty-state button is gone once a note is pinned, so focus then returns to the header button.
  const returnFocus = () => (opener.current?.isConnected ? opener.current : headButton.current);

  const pinButton = (extra?: string, ref?: Ref<HTMLButtonElement>) => (
    <button ref={ref} type="button" className={cx(styles.pinButton, extra)} onClick={(event) => openForm(event.currentTarget)}>
      <Pushpin />
      Pin your note
    </button>
  );

  return (
    <section
      className={cx(styles.wall, 'fx-on-blue', handFont.variable, stampFont.variable)}
      id="beginnings-wall"
      aria-labelledby="wall-title"
    >
      <div className={styles.blueprint} aria-hidden="true" />
      <div className={cx('container', styles.inner)}>
        <div className={styles.head}>
          <SectionTitle
            eyebrow="Testimonials"
            title="The beginnings wall"
            titleId="wall-title"
            accent={['wall']}
            lead="Notes from the brands that began with us, pinned up one by one. Worked with us? Leave yours on the wall."
            className={styles.intro}
          />
          {pinButton(styles.headButton, headButton)}
        </div>

        <p className={styles.toast} role="status" data-show={toast ? '' : undefined}>
          {toast}
        </p>

        {wall.length === 0 ? (
          <div className={styles.empty}>
            <BlankNote>{pinButton()}</BlankNote>
          </div>
        ) : (
          <>
            <ul className={styles.board} aria-label="Notes from clients">
              {shown.map((note, index) => (
                <li key={note.id} className={styles.slot}>
                  <WallNote note={note} index={index} isNew={note.id === justPinned} />
                </li>
              ))}
            </ul>
            <div className={styles.more}>
              <p className="sr-only" aria-live="polite">
                Showing {shown.length} of {wall.length} notes
              </p>
              {hasMore && (
                <button type="button" className={styles.moreButton} onClick={() => setPages((p) => p + 1)}>
                  See more notes
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {open && <PinNoteDialog onClose={() => setOpen(false)} onPinned={pinned} returnFocus={returnFocus} />}
    </section>
  );
}

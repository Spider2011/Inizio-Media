'use client';

import { m, useReducedMotion } from 'motion/react';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { getLenis } from '@/components/fx/SmoothScroll';
import { cx } from '@/lib/cx';
import { formatNoteDate, holderFor, stampDate, tiltFor } from '@/lib/notes/format';
import type { WallEntry } from '@/lib/notes/mine';
import styles from './WallNote.module.css';

type Props = {
  note: WallEntry;
  /** Position on the wall: decides pin or tape. */
  index: number;
  /** The visitor just pinned it: it flies in, gets stamped and wears a "New" tag. */
  isNew?: boolean;
};

const FLY = { type: 'spring', stiffness: 150, damping: 17, mass: 0.9 } as const;
const THUMP = { delay: 0.85, duration: 0.32, ease: [0.3, 1.6, 0.5, 1] } as const;

function Holder({ index }: { index: number }) {
  const holder = holderFor(index);
  return <span className={cx(styles.holder, styles[holder])} aria-hidden="true" />;
}

export function WallNote({ note, index, isNew = false }: Props) {
  const reduce = useReducedMotion();
  const fly = isNew && !reduce;
  const style = { '--tilt': `${tiltFor(note.id)}deg` } as CSSProperties;
  const ref = useRef<HTMLElement>(null);

  // A just-pinned note may land below the fold: bring it into view so the stamp is seen landing.
  useEffect(() => {
    // Measure the slot, not the note: the note starts mid-flight, shifted by its entrance transform.
    const el = ref.current?.parentElement ?? ref.current;
    if (!isNew || !el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top >= 80 && rect.bottom <= window.innerHeight) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -140, duration: reduce ? 0 : 0.9, immediate: Boolean(reduce), force: true });
    else el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }, [isNew, reduce]);

  return (
    <m.figure
      ref={ref}
      className={cx(styles.note, styles[note.paper], note.pending && styles.pending)}
      style={style}
      initial={fly ? { opacity: 0, y: -180, scale: 1.14, rotate: -10 } : false}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={FLY}
    >
      <Holder index={index} />
      {isNew && <span className={styles.newTag}>New</span>}
      <blockquote className={styles.text}>
        <p>{note.text}</p>
      </blockquote>
      <figcaption className={styles.caption}>
        <span className={styles.name}>{note.name}</span>
        <m.time
          className={styles.stamp}
          dateTime={note.createdAt}
          initial={fly ? { opacity: 0, scale: 1.4, rotate: -6 } : false}
          animate={{ opacity: 0.85, scale: 1, rotate: 0 }}
          transition={THUMP}
        >
          <span aria-hidden="true">{stampDate(note.createdAt)}</span>
          <span className="sr-only">{formatNoteDate(note.createdAt)}</span>
        </m.time>
      </figcaption>
      {note.pending && <p className={styles.private}>Only you can see this until Inizio approves it.</p>}
    </m.figure>
  );
}

/* The empty wall: one blank note inviting the first one. */
export function BlankNote({ children }: { children: ReactNode }) {
  return (
    <div className={cx(styles.note, styles.white, styles.blank)} style={{ '--tilt': '-2deg' } as CSSProperties}>
      <Holder index={0} />
      <p className={styles.blankText}>Be the first to pin a note</p>
      {children}
    </div>
  );
}

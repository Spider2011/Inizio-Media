'use client';

import { AnimatePresence, m, useIsPresent, type PanInfo, type Variants } from 'motion/react';
import Image from 'next/image';
import { useRef, useState, type KeyboardEvent } from 'react';
import { Arrow } from '@/components/ui/Arrow';
import { Art } from '@/components/ui/Art';
import type { GalleryItem } from '@/content/gallery';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { pad2 } from '@/lib/format';
import { EASE_OUT } from '@/lib/motion';
import styles from './Lightbox.module.css';

type Props = {
  items: readonly GalleryItem[];
  index: number;
  /** The photo the viewer was opened from: only it morphs between its tile and the viewer. */
  openedIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
  returnFocus: () => HTMLElement | null;
};

function ratioValue(ratio: string): number {
  const [w, h] = ratio.split('/').map(Number);
  return w / h;
}

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;

const slide: Variants = {
  enter: (direction: number) => (direction === 0 ? { opacity: 1, x: 0 } : { opacity: 0, x: direction * 80 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT } },
  exit: (direction: number) => ({ opacity: 0, x: direction * -80, transition: { duration: 0.25 } })
};

export function Lightbox({ items, index, openedIndex, onNavigate, onClose, returnFocus }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [direction, setDirection] = useState(0);
  const isPresent = useIsPresent();
  useFocusTrap(ref, isPresent, { onEscape: onClose, initialFocus: closeRef, returnFocus });
  useLockBodyScroll(isPresent);

  const item = items[index];

  function go(step: number) {
    setDirection(step);
    onNavigate((index + step + items.length) % items.length);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft') go(-1);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) go(1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) go(-1);
  }

  return (
    <m.div
      ref={ref}
      className={styles.box}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onKeyDown={onKeyDown}
      style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.top}>
        <p className={styles.count}>
          <b>{pad2(index + 1)}</b> <span>/ {pad2(items.length)}</span>
        </p>
        <button ref={closeRef} className={styles.iconButton} type="button" onClick={onClose} aria-label="Close">
          <span className={styles.x} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.stage}>
        <AnimatePresence custom={direction} mode="popLayout">
          <m.div
            key={item.id}
            className={styles.slide}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            dragTransition={{ bounceStiffness: 500, bounceDamping: 50 }}
            onDragEnd={onDragEnd}
            data-cursor="Drag"
          >
            <m.div
              layoutId={index === openedIndex ? `photo-${item.id}` : undefined}
              transition={{ layout: { duration: 0.7, ease: EASE_OUT } }}
              className={styles.frame}
              style={{ aspectRatio: item.ratio, ['--ratio' as string]: ratioValue(item.ratio) }}
            >
              {item.photo ? (
                <Image src={item.photo.image} alt={item.photo.alt} fill sizes="90vw" className={styles.photo} />
              ) : (
                <Art tone={item.tone} seed={index + 11} label="Photo" />
              )}
            </m.div>
          </m.div>
        </AnimatePresence>
      </div>

      <div className={styles.bottom}>
        <p className={styles.caption} aria-live="polite">
          <b>{item.kind}</b> {item.caption}
        </p>
        <div className={styles.nav}>
          <button className={styles.iconButton} type="button" onClick={() => go(-1)} aria-label="Previous photo">
            <Arrow direction="left" />
          </button>
          <button className={styles.iconButton} type="button" onClick={() => go(1)} aria-label="Next photo">
            <Arrow />
          </button>
        </div>
      </div>
    </m.div>
  );
}

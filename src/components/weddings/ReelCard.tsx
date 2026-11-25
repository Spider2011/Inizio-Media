'use client';

import Image from 'next/image';
import { useRef, type FocusEvent } from 'react';
import { useInViewPlayback } from '@/hooks/useInViewPlayback';
import { pad2 } from '@/lib/format';
import { formatDuration } from '@/lib/film';
import type { ShownReel } from './reels';
import styles from './ReelCard.module.css';

type Props = {
  reel: ShownReel;
  /** 1-based position on the strip, printed on the frame's edge. */
  frame: number;
  onOpen: (reel: ShownReel) => void;
  onFocus?: (event: FocusEvent<HTMLButtonElement>) => void;
};

/* One frame of the film strip: the reel's still, its silent loop while on screen, and the moment it
   caught. Opens the reel with sound. */
export function ReelCard({ reel, frame, onOpen, onFocus }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useInViewPlayback(videoRef);

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onOpen(reel)}
      onFocus={onFocus}
      aria-label={`Watch “${reel.hook}”, ${reel.moment}, ${formatDuration(reel.seconds)}`}
      data-cursor="Play"
    >
      <span className={styles.media} aria-hidden="true">
        <Image className={styles.poster} src={reel.poster} alt="" width={540} height={960} sizes="(min-width: 900px) 300px, 62vw" />
        <video ref={videoRef} className={styles.video} src={reel.preview} muted loop playsInline preload="none" />
      </span>
      <span className={styles.shade} aria-hidden="true" />
      <span className={styles.top} aria-hidden="true">
        <span className={styles.frame}>{pad2(frame)}</span>
      </span>
      {/* The reel carries its own hook line on screen; the card names the moment. */}
      <span className={styles.bottom} aria-hidden="true">
        <span className={styles.moment}>{reel.moment}</span>
        <span className={styles.meta}>
          <span className={styles.play}>
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          </span>
          {formatDuration(reel.seconds)} · with sound
        </span>
      </span>
    </button>
  );
}

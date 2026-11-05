'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import styles from './ReelPlayer.module.css';

export type Reel = { src: string; poster?: string; label: string };

/* A reel opened from the wheel, full height and with its sound. It opens from the visitor's click,
   which is what lets the browser play sound. Closes on ✕, Escape or a click outside the video, and
   the browser hands focus back to the card that opened it. */
export function ReelPlayer({ reel, onClose }: { reel: Reel | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useLockBodyScroll(!!reel);

  useEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!reel || !dialog || !video) return;
    if (!dialog.open) dialog.showModal();
    video.currentTime = 0;
    video.muted = false;
    /* If the browser still refuses sound, play muted rather than not at all; the controls can unmute. */
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
    return () => video.pause();
  }, [reel]);

  const close = () => {
    videoRef.current?.pause();
    if (dialogRef.current?.open) dialogRef.current.close();
  };

  /* A click on the dimmed area (the dialog itself, not its contents) closes it. */
  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.player}
      aria-label={reel?.label ?? 'Reel'}
      onClose={onClose}
      onClick={onBackdrop}
      data-lenis-prevent=""
    >
      <div className={styles.inner}>
        <video
          ref={videoRef}
          className={styles.video}
          src={reel?.src}
          poster={reel?.poster}
          controls
          playsInline
          loop
          preload="none"
        />
        <button type="button" className={styles.close} onClick={close} aria-label="Close reel">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}

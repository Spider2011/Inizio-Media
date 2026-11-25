'use client';

import { useEffect, type RefObject } from 'react';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Plays a muted, looping preview only while it is on screen, so a page of reels never runs more
   than the few in view (and loads nothing it never shows). With reduced motion it stays on its
   poster. */
export function useInViewPlayback(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = ref.current;
    if (!video || typeof IntersectionObserver === 'undefined' || reducedMotion()) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          /* Wrapped: older browsers return nothing from play(), and a refusal (data saver, low
             power) should just leave the poster showing. */
          Promise.resolve()
            .then(() => video.play())
            .catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [ref]);
}

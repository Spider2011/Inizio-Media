'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

let instance: Lenis | null = null;

/* The running Lenis instance, so overlays can pause smooth scrolling. */
export function getLenis(): Lenis | null {
  return instance;
}

export const INTRO_DONE_EVENT = 'im:intro-done';

/* Buttery inertial scrolling (native scroll underneath, so sticky and scroll-linked effects keep working).
   Off for visitors who prefer reduced motion. In-page links glide to their section. */
export function SmoothScroll() {
  const pathname = usePathname();

  /* A new page starts at the top (unless the link points at a section of it). Lenis keeps its own
     scroll position, so it is told directly. */
  useEffect(() => {
    if (window.location.hash) return;
    instance?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ lerp: 0.09, autoRaf: true });
    instance = lenis;
    if (document.documentElement.classList.contains('is-loading')) lenis.stop();
    const onIntroDone = () => lenis.start();

    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      const hash = link?.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: hash === '#top' ? 0 : -24, duration: 1.4, force: true });
      history.replaceState(null, '', hash);
    }

    window.addEventListener(INTRO_DONE_EVENT, onIntroDone);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener(INTRO_DONE_EVENT, onIntroDone);
      document.removeEventListener('click', onClick);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}

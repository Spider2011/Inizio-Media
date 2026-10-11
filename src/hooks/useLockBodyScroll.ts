'use client';

import { useEffect } from 'react';
import { getLenis } from '@/components/fx/SmoothScroll';

/* Stops the page behind a full-screen sheet from scrolling (native and smooth scroll), without a layout jump. */
export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const previous = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = 'hidden';
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`;
    getLenis()?.stop();
    return () => {
      html.style.overflow = previous.overflow;
      html.style.paddingRight = previous.paddingRight;
      getLenis()?.start();
    };
  }, [active]);
}

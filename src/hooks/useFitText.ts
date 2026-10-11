'use client';

import { useLayoutEffect, type RefObject } from 'react';
import { largestFitting } from '@/lib/fit';

type Options = { min: number; max: number };

function setFontSize(el: HTMLElement, px: number): void {
  el.style.fontSize = `${px}px`;
}

/* Sizes the box's first child to the largest font size that fits the box in both width and height.
   Re-fits when the box resizes and once web fonts have loaded. */
export function useFitText(boxRef: RefObject<HTMLElement | null>, { min, max }: Options) {
  useLayoutEffect(() => {
    const box = boxRef.current;
    const text = box?.firstElementChild as HTMLElement | null;
    if (!box || !text) return;

    const fit = () => {
      const width = box.clientWidth;
      const height = box.clientHeight;
      const size = largestFitting(
        (px) => {
          setFontSize(text, px);
          return text.scrollHeight <= height && text.scrollWidth <= width;
        },
        min,
        max
      );
      setFontSize(text, size);
    };

    fit();
    document.fonts?.ready.then(fit).catch(() => {});
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [boxRef, min, max]);
}

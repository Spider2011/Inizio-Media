'use client';

import { useLayoutEffect, type RefObject } from 'react';
import { sizeToFitWidest } from '@/lib/fit';

type Options = { min: number };

/* Shrinks a SplitText headline inside `boxRef` just enough that its widest word fits the box's
   content width, so long words ("beginnings.", "Everything") never run off a narrow phone.
   The CSS size is kept wherever it already fits. Re-fits on resize and once web fonts load. */
export function useFitWidestWord(boxRef: RefObject<HTMLElement | null>, selector: string, { min }: Options) {
  useLayoutEffect(() => {
    const box = boxRef.current;
    const heading = box?.querySelector<HTMLElement>(selector);
    if (!box || !heading) return;

    const fit = () => {
      heading.style.fontSize = '';
      const style = getComputedStyle(box);
      const available = box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const words = [...heading.querySelectorAll<HTMLElement>('.split-word')];
      const widest = Math.max(0, ...words.map((word) => word.getBoundingClientRect().width));
      const size = parseFloat(getComputedStyle(heading).fontSize);
      const fitted = sizeToFitWidest({ size, available, widest }, min);
      if (fitted !== size) heading.style.fontSize = `${fitted}px`;
    };

    fit();
    document.fonts?.ready.then(fit).catch(() => {});
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [boxRef, selector, min]);
}

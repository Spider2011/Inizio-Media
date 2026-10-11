'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Options = {
  onEscape?: () => void;
  /** Element to focus when the trap opens; defaults to the first focusable element. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Element to give focus back to when the trap closes. */
  returnFocus?: () => HTMLElement | null;
};

/* Keeps keyboard focus inside a dialog while `active`, closes on Escape, and returns focus afterwards. */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean, options: Options = {}) {
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const focusables = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    (latest.current.initialFocus?.current ?? focusables()[0])?.focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        latest.current.onEscape?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      latest.current.returnFocus?.()?.focus({ preventScroll: true });
    };
  }, [active, containerRef]);
}

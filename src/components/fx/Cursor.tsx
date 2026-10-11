'use client';

import { AnimatePresence, m, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { EASE_OUT } from '@/lib/motion';
import styles from './Cursor.module.css';

type CursorState = { kind: 'default' } | { kind: 'hover' } | { kind: 'text' } | { kind: 'label'; label: string };

const INTERACTIVE = '[data-cursor], a, button, label, summary';

const SIZE: Record<CursorState['kind'], number> = { default: 36, hover: 64, text: 8, label: 96 };

/* Custom cursor for mouse users: a dot that tracks exactly and a ring that trails with a spring.
   Elements can ask for a label with data-cursor="View". Off on touch and with reduced motion. */
export function Cursor() {
  const enabled = useMediaQuery('(pointer: fine) and (prefers-reduced-motion: no-preference)');
  const [state, setState] = useState<CursorState>({ kind: 'default' });
  const [pressed, setPressed] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 280, damping: 26, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 280, damping: 26, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add('has-cursor');

    function onMove(event: PointerEvent) {
      x.set(event.clientX);
      y.set(event.clientY);
    }
    function onOver(event: PointerEvent) {
      const target = event.target as Element | null;
      if (target?.closest('input, textarea, select')) return setState({ kind: 'text' });
      const el = target?.closest(INTERACTIVE);
      const label = el?.getAttribute('data-cursor');
      if (label) setState({ kind: 'label', label });
      else setState(el ? { kind: 'hover' } : { kind: 'default' });
    }
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerover', onOver);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      html.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const size = SIZE[state.kind] * (pressed ? 0.8 : 1);

  return (
    <div aria-hidden="true">
      <m.div className={styles.dot} style={{ x, y }} />
      <m.div
        className={styles.ring}
        data-kind={state.kind}
        style={{ x: ringX, y: ringY }}
        animate={{ width: size, height: size }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
      >
        <AnimatePresence>
          {state.kind === 'label' && (
            <m.span
              key={state.label}
              className={styles.label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
            >
              {state.label}
            </m.span>
          )}
        </AnimatePresence>
      </m.div>
    </div>
  );
}

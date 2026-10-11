'use client';

import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { EASE_OUT } from '@/lib/motion';
import styles from './RotatingWord.module.css';

type Props = { words: readonly string[]; interval?: number; play?: boolean };

/* Cycles through words, each rolling up out of a mask. Holds still with reduced motion. */
export function RotatingWord({ words, interval = 2200, play = true }: Props) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!play || reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [play, reduce, interval, words.length]);

  return (
    <span className={styles.slot}>
      <span className="sr-only">{words.join(', ')}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={words[index]}
          className={styles.word}
          aria-hidden="true"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          {words[index]}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

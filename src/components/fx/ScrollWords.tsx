'use client';

import { m, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import styles from './ScrollWords.module.css';

type Props = { text: string; className?: string };

/* A statement whose words light up one by one as it scrolls through the viewport. */
export function ScrollWords({ text, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({ progress, range, children }: { progress: MotionValue<number>; range: [number, number]; children: ReactNode }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <>
      <m.span className={styles.word} style={{ opacity }}>
        {children}
      </m.span>{' '}
    </>
  );
}

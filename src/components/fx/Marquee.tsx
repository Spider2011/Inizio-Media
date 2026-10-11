'use client';

import {
  m,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity
} from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { wrap } from '@/lib/motion';
import styles from './Marquee.module.css';

type Props = {
  children: ReactNode;
  /** Percent of one copy per second; the sign sets the resting direction. */
  baseVelocity?: number;
  className?: string;
  repeat?: number;
};

/* An endless strip that speeds up, and flips direction, with the visitor's scroll velocity. */
export function Marquee({ children, baseVelocity = -4, className, repeat = 4 }: Props) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-100 / repeat, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let moveBy = direction.current * (baseVelocity / repeat) * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    moveBy += direction.current * moveBy * f;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={cx(styles.marquee, className)}>
      <m.div className={styles.track} style={{ x }}>
        {Array.from({ length: repeat }, (_, i) => (
          <div key={i} className={styles.copy} aria-hidden={i > 0 ? true : undefined}>
            {children}
          </div>
        ))}
      </m.div>
    </div>
  );
}

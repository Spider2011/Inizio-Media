'use client';

import { m, useSpring } from 'motion/react';
import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Spotlight.module.css';

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Maximum tilt in degrees; 0 for a flat card with only the spotlight. */
  tilt?: number;
  as?: 'div' | 'article' | 'li';
};

/* Card with a glow that follows the pointer and an optional 3D tilt. */
export function Spotlight({ children, className, style, tilt = 8, as = 'div' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const spring = { stiffness: 160, damping: 18 };
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);
  const Component = m[as] as typeof m.div;

  function onMove(event: PointerEvent<HTMLElement>) {
    const node = ref.current;
    if (!node || event.pointerType !== 'mouse') return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    node.style.setProperty('--mx', `${px * 100}%`);
    node.style.setProperty('--my', `${py * 100}%`);
    rotateX.set((0.5 - py) * tilt);
    rotateY.set((px - 0.5) * tilt);
  }

  function onLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <Component
      ref={ref as never}
      className={cx(styles.card, className)}
      style={{ ...style, rotateX, rotateY, transformPerspective: 1000 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className={styles.glow} aria-hidden="true" />
      {children}
    </Component>
  );
}

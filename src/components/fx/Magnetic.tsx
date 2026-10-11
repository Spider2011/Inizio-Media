'use client';

import { m, useSpring } from 'motion/react';
import { useRef, type PointerEvent, type ReactNode } from 'react';

type Props = { children: ReactNode; strength?: number; className?: string };

/* Pulls its child toward the mouse pointer while hovered, then springs back. Mouse only. */
export function Magnetic({ children, strength = 0.35, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const spring = { stiffness: 180, damping: 14, mass: 0.35 };
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  function onMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <m.div ref={ref} className={className} style={{ x, y, display: 'inline-block' }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </m.div>
  );
}

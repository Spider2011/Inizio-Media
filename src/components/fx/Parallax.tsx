'use client';

import { m, useScroll, useTransform } from 'motion/react';
import { useRef, type CSSProperties, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Pixels travelled across the element's pass through the viewport; negative moves up faster. */
  distance?: number;
  className?: string;
  style?: CSSProperties;
};

/* Moves its content at a different speed from the page while it scrolls past. */
export function Parallax({ children, distance = -120, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance / 2, distance / 2]);
  return (
    <m.div ref={ref} className={className} style={{ ...style, y }}>
      {children}
    </m.div>
  );
}

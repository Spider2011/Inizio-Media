'use client';

import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { decimalsOf, formatCount } from '@/lib/format';
import { EASE_OUT } from '@/lib/motion';

type Props = { value: string; suffix?: string; prefix?: string; className?: string; delay?: number; duration?: number };

/* Counts up to `value` the first time it is seen. The real figure is in the markup (and read by screen
   readers), and the count always lands exactly on it. */
export function Counter({ value, suffix = '', prefix = '', className, delay = 0, duration = 2 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const final = `${prefix}${value}${suffix}`;

  useEffect(() => {
    const node = ref.current;
    const target = Number.parseFloat(value);
    if (!node || !inView || reduce || Number.isNaN(target)) return;
    const decimals = decimalsOf(value);
    const render = (n: number) => {
      node.textContent = `${prefix}${formatCount(n, decimals)}${suffix}`;
    };
    render(0);
    const controls = animate(0, target, {
      duration,
      delay,
      ease: EASE_OUT,
      onUpdate: render,
      onComplete: () => {
        node.textContent = final;
      }
    });
    return () => {
      controls.stop();
      node.textContent = final;
    };
  }, [inView, reduce, value, prefix, suffix, delay, duration, final]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}

import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { ringLayout } from '@/lib/ring-text';
import styles from './RotatingBadge.module.css';

type Props = {
  /** The phrase, once. It is repeated to fill the ring and spaced to meet itself exactly. */
  text: string;
  children?: ReactNode;
  className?: string;
};

const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/* Measured: an upper-case letter at 15px with 0.32em letter-spacing advances ~12.5 viewBox units. */
const RING = { baseSize: 15, maxSize: 20, advancePerPx: 12.5 / 15 };

/* Circular text that slowly spins around a centre mark. Decorative: the text is hidden from assistive tech. */
export function RotatingBadge({ text, children, className }: Props) {
  const pathId = `badge-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const layout = ringLayout(text, CIRCUMFERENCE, RING);
  return (
    <span className={cx(styles.badge, className)}>
      <svg className={styles.ring} viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <path
            id={pathId}
            d={`M100,100 m-${RADIUS},0 a${RADIUS},${RADIUS} 0 1,1 ${RADIUS * 2},0 a${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`}
          />
        </defs>
        <text className={styles.text} style={{ fontSize: layout.fontSize }}>
          {/* textLength evens out the last few units so the text meets itself exactly once round. */}
          <textPath href={`#${pathId}`} textLength={CIRCUMFERENCE} lengthAdjust="spacing">
            {layout.text}
          </textPath>
        </text>
      </svg>
      <span className={styles.centre}>{children}</span>
    </span>
  );
}

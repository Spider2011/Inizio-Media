import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './RotatingBadge.module.css';

type Props = { text: string; children?: ReactNode; className?: string };

/* Circular text that slowly spins around a centre mark. Decorative: the text is hidden from assistive tech. */
export function RotatingBadge({ text, children, className }: Props) {
  const pathId = `badge-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <span className={cx(styles.badge, className)}>
      <svg className={styles.ring} viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <path id={pathId} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className={styles.text}>
          <textPath href={`#${pathId}`}>{text}</textPath>
        </text>
      </svg>
      <span className={styles.centre}>{children}</span>
    </span>
  );
}

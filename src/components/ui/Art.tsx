import type { PlaceholderTone } from '@/content/types';
import { cx } from '@/lib/cx';
import styles from './Art.module.css';

type Props = {
  tone: PlaceholderTone;
  seed: number;
  /** Large glyph set into the artwork (initials, a number…). */
  glyph?: string;
  /** Small caption chip, e.g. "Photo · 3:4". */
  label?: string;
  className?: string;
};

/* The IM logo's circuit traces, reused as generative artwork. */
const TRACES = [
  'M0 28H180V52H300',
  'M0 76H120',
  'M0 124H220V100H340',
  'M0 172H90V148H170',
  'M600 40H460V64H380',
  'M600 112H500',
  'M600 160H420V136H350'
];
const DOTS = [
  [300, 52],
  [120, 76],
  [340, 100],
  [170, 148],
  [380, 64],
  [500, 112],
  [350, 136]
];

/* Branded artwork that stands in for photography until real images arrive. Deterministic per seed. */
export function Art({ tone, seed, glyph, label, className }: Props) {
  const rotate = (seed * 47) % 360;
  const shift = (seed * 23) % 60;
  return (
    <div className={cx(styles.art, styles[tone], className)} aria-hidden="true">
      <span className={styles.orb} style={{ left: `${20 + shift}%`, top: `${10 + ((seed * 31) % 50)}%` }} />
      <span className={cx(styles.orb, styles.orbAlt)} style={{ right: `${10 + ((seed * 17) % 40)}%`, bottom: `${5 + shift / 2}%` }} />
      <svg className={styles.traces} viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice" style={{ rotate: `${rotate}deg` }}>
        {TRACES.map((d, i) => (
          <path key={d} d={d} opacity={(i + seed) % 3 === 0 ? 1 : 0.55} />
        ))}
        {DOTS.map(([cx_, cy]) => (
          <circle key={`${cx_}-${cy}`} cx={cx_} cy={cy} r={4} />
        ))}
      </svg>
      {glyph && <span className={styles.glyph}>{glyph}</span>}
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}

'use client';

import { m } from 'motion/react';
import { Counter } from '@/components/fx/Counter';
import { Spotlight } from '@/components/fx/Spotlight';
import { SectionTitle, type MoreLink } from '@/components/ui/SectionTitle';
import { RESULT_STATS } from '@/content/stats';
import { cx } from '@/lib/cx';
import { EASE_OUT, VIEW } from '@/lib/motion';
import styles from './Results.module.css';

const [views, reach, engagement] = RESULT_STATS;

const TRACK_RECORD = [
  { value: '8', suffix: '+', label: 'Years' },
  { value: '100', suffix: '+', label: 'Projects delivered' },
  { value: '50', suffix: '+', label: 'Brand builds & events' }
] as const;

const BARS = [38, 52, 46, 70, 64, 88, 100];

/* Decorative graphics: they illustrate growth, the numbers carry the data. */
function Chart() {
  const line = 'M0 150 C60 140 90 120 140 118 S230 70 290 76 S380 30 440 22 S520 8 560 4';
  return (
    <svg className={styles.chart} viewBox="0 0 560 170" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--butter)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--butter)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <m.path
        d={`${line} L560 170 L0 170 Z`}
        fill="url(#area)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEW}
        transition={{ duration: 1.2, delay: 0.8 }}
      />
      <m.path
        d={line}
        fill="none"
        stroke="var(--butter)"
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={VIEW}
        transition={{ duration: 2, ease: EASE_OUT }}
      />
    </svg>
  );
}

function Ring() {
  return (
    <svg className={styles.ring} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="50" className={styles.ringTrack} />
      <m.circle
        cx="60"
        cy="60"
        r="50"
        className={styles.ringFill}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 0.78 }}
        viewport={VIEW}
        transition={{ duration: 2, ease: EASE_OUT, delay: 0.2 }}
      />
    </svg>
  );
}

function Bars() {
  return (
    <div className={styles.bars} aria-hidden="true">
      {BARS.map((height, i) => (
        <m.span
          key={i}
          className={styles.bar}
          style={{ height: `${height}%` }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={VIEW}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 + i * 0.08 }}
        />
      ))}
    </div>
  );
}

export function Results({ more }: { more?: MoreLink }) {
  return (
    <section className={styles.results} aria-labelledby="results-title">
      <div className="container">
        <SectionTitle
          eyebrow="Result driven"
          title="Statistics, on average"
          titleId="results-title"
          accent={['average']}
          lead="Averages across the brands we grow: attention earned, not bought."
          more={more}
        />
        <div className={styles.bento}>
          <Spotlight className={cx(styles.card, styles.big)} tilt={4}>
            <p className={styles.label}>{views.label}</p>
            <Counter className={`${styles.num} fx-metal`} value={views.value} suffix={views.suffix} />
            <Chart />
          </Spotlight>
          <Spotlight className={cx(styles.card, styles.blue)}>
            <p className={styles.label}>{reach.label}</p>
            <div className={styles.ringWrap}>
              <Ring />
              <Counter className={`${styles.ringNum} fx-metal`} value={reach.value} suffix={reach.suffix} />
            </div>
          </Spotlight>
          <Spotlight className={styles.card}>
            <p className={styles.label}>{engagement.label}</p>
            <Counter className={`${styles.num} fx-metal`} value={engagement.value} suffix={engagement.suffix} />
            <Bars />
          </Spotlight>
          <Spotlight className={cx(styles.card, styles.wide)} tilt={3}>
            <dl className={styles.record}>
              {TRACK_RECORD.map((item) => (
                <div key={item.label}>
                  <dt className={styles.label}>{item.label}</dt>
                  <dd>
                    <Counter className={`${styles.recordNum} fx-metal`} value={item.value} suffix={item.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          </Spotlight>
        </div>
      </div>
    </section>
  );
}

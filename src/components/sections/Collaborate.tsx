import { Counter } from '@/components/fx/Counter';
import { Magnetic } from '@/components/fx/Magnetic';
import { Marquee } from '@/components/fx/Marquee';
import { RotatingBadge } from '@/components/fx/RotatingBadge';
import { Arrow } from '@/components/ui/Arrow';
import styles from './Collaborate.module.css';

const FIGURES = [
  { value: '8', suffix: '+', label: 'Years of beginnings' },
  { value: '50', suffix: '+', label: 'Brand builds & events covered' },
  { value: '100', suffix: '+', label: 'Projects delivered' }
] as const;

export function Collaborate() {
  return (
    <section className={styles.band} aria-labelledby="collab-title">
      <h2 id="collab-title" className="sr-only">
        Let&apos;s work together
      </h2>
      <div className={styles.marquee} aria-hidden="true">
        <Marquee baseVelocity={-3} repeat={3}>
          <span className={styles.phrase}>
            Let&apos;s work together <span className={styles.dot} /> <span className={styles.outline}>Let&apos;s create</span>{' '}
            <span className={styles.dot} />
          </span>
        </Marquee>
      </div>

      <div className={`container ${styles.row}`}>
        <dl className={styles.figures}>
          {FIGURES.map((figure) => (
            <div key={figure.label} className={styles.figure}>
              <dt>{figure.label}</dt>
              <dd>
                <Counter className={`${styles.num} fx-metal`} value={figure.value} suffix={figure.suffix} />
              </dd>
            </div>
          ))}
        </dl>
        <Magnetic strength={0.25}>
          <a className={styles.badgeLink} href="#contact" aria-label="Start a project">
            <RotatingBadge text="Start a project • Start a project • " className={styles.badge}>
              <span className={styles.badgeCore}>
                <Arrow direction="up-right" />
              </span>
            </RotatingBadge>
          </a>
        </Magnetic>
      </div>
    </section>
  );
}

import { Marquee } from '@/components/fx/Marquee';
import { SITE } from '@/content/site';
import styles from './KeywordBand.module.css';

function Star() {
  return (
    <svg className={styles.star} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
    </svg>
  );
}

const PHRASES = ['We build brands', 'Giving new beginnings', 'Made in Mumbai'];

/* Two crossing marquee ribbons that speed up, and flip, with the scroll. */
export function KeywordBand() {
  return (
    <section className={styles.band} aria-label="What we do, in brief">
      <div className={`${styles.ribbon} ${styles.butter}`}>
        <Marquee baseVelocity={-5}>
          {SITE.keywords.map((word) => (
            <span key={word} className={styles.item}>
              {word}
              <Star />
            </span>
          ))}
        </Marquee>
      </div>
      <div className={`${styles.ribbon} ${styles.blue}`} aria-hidden="true">
        <Marquee baseVelocity={5}>
          {PHRASES.map((phrase) => (
            <span key={phrase} className={styles.item}>
              {phrase}
              <Star />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

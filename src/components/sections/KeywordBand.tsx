import { SITE } from '@/content/site';
import styles from './KeywordBand.module.css';

/* A quiet line of what we do: the keywords drift slowly between two hairlines. Two copies back to back
   slide by half their width, so the loop has no seam. */
export function KeywordBand() {
  return (
    <section className={styles.band} aria-label="What we do, in brief">
      <div className={styles.track}>
        {[0, 1].map((copy) => (
          <ul key={copy} className={styles.list} aria-hidden={copy > 0 ? true : undefined}>
            {SITE.keywords.map((word) => (
              <li key={word} className={styles.item}>
                {word}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

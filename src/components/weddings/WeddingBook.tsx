import Link from 'next/link';
import { Magnetic } from '@/components/fx/Magnetic';
import { Marquee } from '@/components/fx/Marquee';
import { RotatingBadge } from '@/components/fx/RotatingBadge';
import { Arrow } from '@/components/ui/Arrow';
import { SITE } from '@/content/site';
import { WEDDING_STEPS } from '@/content/weddings';
import { serviceLink } from '@/lib/enquiry';
import { pad2 } from '@/lib/format';
import styles from './WeddingBook.module.css';

/* The close: a running "Getting married?" line, the three steps to booking, and the way in. */
export function WeddingBook() {
  return (
    <section id="wedding-book" className={styles.band} aria-labelledby="wedding-book-title">
      <div className={styles.marquee} aria-hidden="true">
        <Marquee baseVelocity={-3} repeat={3}>
          <span className={styles.phrase}>
            Getting married? <span className={styles.dot} /> <span className={styles.outline}>Let&apos;s talk</span>{' '}
            <span className={styles.dot} />
          </span>
        </Marquee>
      </div>

      <div className={`container ${styles.row}`}>
        <div className={styles.copy}>
          <h2 id="wedding-book-title" className={styles.title}>
            Your dates, our cameras.
          </h2>
          <ol className={styles.steps}>
            {WEDDING_STEPS.map((step, i) => (
              <li key={step}>
                <span className={styles.stepNumber}>{pad2(i + 1)}</span>
                {step}
              </li>
            ))}
          </ol>
          <p className={styles.call}>
            Rather talk now? Call <a href={SITE.phone.href}>{SITE.phone.display}</a> or message{' '}
            <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer">
              {SITE.instagram.handle}
            </a>
            .
          </p>
        </div>

        <Magnetic strength={0.25}>
          <Link className={styles.badgeLink} href={serviceLink('wedding')} aria-label="Book your dates">
            <RotatingBadge text="Book your dates" className={styles.badge}>
              <span className={styles.badgeCore}>
                <Arrow direction="up-right" />
              </span>
            </RotatingBadge>
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}

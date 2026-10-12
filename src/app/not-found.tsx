import type { Metadata } from 'next';
import Link from 'next/link';
import { SplitText } from '@/components/fx/SplitText';
import { Arrow } from '@/components/ui/Arrow';
import { NAV_LINKS } from '@/content/site';
import styles from './not-found.module.css';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section id="top" className={styles.notFound} aria-labelledby="not-found-title">
      <span className={styles.code} aria-hidden="true">
        404
      </span>
      <div className={`container ${styles.content}`}>
        <p className="eyebrow">Page not found</p>
        <SplitText
          as="h1"
          id="not-found-title"
          className={`${styles.title} fx-depth fx-hover`}
          text="This page hasn't begun yet."
          by="chars"
          stagger={0.025}
          classFor={{ 'yet.': 'fx-shine' }}
        />
        <p className={styles.lead}>The link may be old, or the address mistyped. Every beginning starts somewhere:</p>
        <Link className={styles.home} href="/">
          Back to the home page <Arrow direction="up-right" />
        </Link>
        <ul className={styles.links}>
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

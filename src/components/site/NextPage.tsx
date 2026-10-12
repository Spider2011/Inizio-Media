import Link from 'next/link';
import { SplitText } from '@/components/fx/SplitText';
import { Arrow } from '@/components/ui/Arrow';
import type { PageInfo } from '@/content/pages';
import { PAGES } from '@/content/pages';
import { pad2 } from '@/lib/format';
import styles from './NextPage.module.css';

/* The end of every inner page: one giant link onward to the next page. */
export function NextPage({ page }: { page: PageInfo }) {
  return (
    <section className={styles.next} aria-label="Next page">
      <Link className={styles.link} href={page.href} data-cursor="Next">
        <span className={styles.fill} aria-hidden="true" />
        <span className={`container ${styles.inner}`}>
          <span className={styles.kicker}>
            <span>Next page</span>
            <span aria-hidden="true">
              {pad2(page.index)} / {pad2(PAGES.length)}
            </span>
          </span>
          <span className={styles.row}>
            <SplitText as="span" className={`${styles.label} fx-depth`} text={page.label} by="chars" stagger={0.025} />
            <span className={styles.disc} aria-hidden="true">
              <Arrow direction="right" />
            </span>
          </span>
        </span>
      </Link>
    </section>
  );
}

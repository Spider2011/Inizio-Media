'use client';

import { m, type Variants } from 'motion/react';
import Link from 'next/link';
import { RollText } from '@/components/site/RollText';
import { Arrow } from '@/components/ui/Arrow';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { PAGES } from '@/content/pages';
import { pad2 } from '@/lib/format';
import { EASE_OUT, VIEW } from '@/lib/motion';
import styles from './PageIndex.module.css';

const row: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT, delay: i * 0.06 } })
};

/* The home page's way in: one row per page. */
export function PageIndex() {
  return (
    <section id="explore" className={styles.explore} aria-labelledby="explore-title">
      <div className="container">
        <SectionTitle
          eyebrow="Explore"
          title="Where to next?"
          titleId="explore-title"
          accent={['next?']}
          lead="Every part of the studio has its own page. Pick one, or use the menu any time."
        />

        <ol className={styles.list}>
          {PAGES.map((page, i) => (
            <m.li
              key={page.id}
              className={styles.item}
              data-reveal=""
              custom={i}
              variants={row}
              initial="hidden"
              whileInView="show"
              viewport={VIEW}
            >
              <Link className={styles.row} href={page.href} data-cursor="Open">
                <span className={styles.index}>{pad2(page.index)}</span>
                <span className={styles.label}>
                  <RollText text={page.label} />
                </span>
                <span className={styles.teaser}>{page.teaser}</span>
                <span className={styles.disc} aria-hidden="true">
                  <Arrow direction="up-right" />
                </span>
              </Link>
            </m.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

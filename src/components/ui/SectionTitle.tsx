'use client';

import { m } from 'motion/react';
import Link from 'next/link';
import { SplitText } from '@/components/fx/SplitText';
import { Arrow } from '@/components/ui/Arrow';
import { cx } from '@/lib/cx';
import { EASE_OUT, VIEW } from '@/lib/motion';
import styles from './SectionTitle.module.css';

/** A link from a section's teaser (on the home page) to its full page. */
export type MoreLink = { href: string; label: string };

type Props = {
  eyebrow: string;
  title: string;
  titleId?: string;
  lead?: string;
  /** Words of the title to colour with the section's accent. */
  accent?: readonly string[];
  align?: 'start' | 'center';
  className?: string;
  more?: MoreLink;
};

/* Section opener: eyebrow, a giant title whose letters rise, and an optional lead. */
export function SectionTitle({ eyebrow, title, titleId, lead, accent = [], align = 'start', className, more }: Props) {
  const classFor = Object.fromEntries(accent.map((word) => [word, `${styles.accent} fx-shine`]));
  return (
    <header className={cx(styles.intro, align === 'center' && styles.center, className)}>
      <m.p
        className={cx('eyebrow', styles.eyebrow)}
        data-reveal=""
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={VIEW}
        transition={{ duration: 0.8, ease: EASE_OUT }}
      >
        {eyebrow}
      </m.p>
      <SplitText as="h2" id={titleId} className={cx(styles.title, 'fx-depth fx-hover')} text={title} by="chars" stagger={0.018} classFor={classFor} />
      {lead && (
        <m.p
          className={styles.lead}
          data-reveal=""
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 1, ease: EASE_OUT, delay: 0.3 }}
        >
          {lead}
        </m.p>
      )}
      {more && (
        <m.div
          data-reveal=""
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 1, ease: EASE_OUT, delay: 0.45 }}
        >
          <Link className={styles.more} href={more.href} data-cursor="Open">
            <span>{more.label}</span>
            <span className={styles.moreIcon} aria-hidden="true">
              <Arrow direction="up-right" />
            </span>
          </Link>
        </m.div>
      )}
    </header>
  );
}

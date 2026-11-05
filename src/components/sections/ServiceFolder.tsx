'use client';

import { m, type Variants } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Spotlight } from '@/components/fx/Spotlight';
import { Arrow } from '@/components/ui/Arrow';
import type { ServiceCard } from '@/content/services';
import { cx } from '@/lib/cx';
import { pad2 } from '@/lib/format';
import { EASE_OUT, VIEW } from '@/lib/motion';
import { photoSource } from '@/lib/unsplash';
import styles from './ServiceFolder.module.css';

/* Folder colours rotate through the palette. */
const TONES = ['butter', 'sky', 'navy', 'paper'] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT, delay: (i % 4) * 0.07 } })
};

const drop: Variants = {
  hidden: { y: '-35%', opacity: 0 },
  show: (i: number) => ({ y: '0%', opacity: 1, transition: { duration: 0.9, ease: EASE_OUT, delay: 0.25 + (i % 4) * 0.07 } })
};

type Props = { service: ServiceCard; index: number; className?: string };

/* A glass folder: a coloured back with a numbered tab, papers peeking out of the top, and a frosted
   front pocket carrying the service. On hover the pocket tips open and the papers rise and fan out. */
export function ServiceFolder({ service, index, className }: Props) {
  const tone = TONES[index % TONES.length];
  const number = pad2(index + 1);

  return (
    <m.div
      className={cx(styles.wrap, className)}
      data-reveal=""
      custom={index}
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={VIEW}
    >
      <Spotlight as="article" className={cx(styles.folder, styles[tone])} tilt={8}>
        <Link className={styles.link} href="/contact" data-cursor="Enquire">
          <span className={styles.back} aria-hidden="true">
            <span className={styles.tab}>{number}</span>
          </span>

          <m.span className={styles.sheets} custom={index} variants={drop} aria-hidden="true">
            {/* A photo print tucked into the folder (decorative: the service is named on the pocket). */}
            <span className={cx(styles.sheet, styles.sheetArt)}>
              <span className={styles.photo}>
                <Image
                  {...photoSource(service.photo)}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 240px, 60vw"
                  className={styles.photoImg}
                />
              </span>
            </span>
            <span className={cx(styles.sheet, styles.sheetNote)}>
              <span className={styles.initial}>{service.title.charAt(0)}</span>
              <span className={styles.lines}>
                <span />
                <span />
                <span />
              </span>
            </span>
          </m.span>

          <span className={styles.front}>
            <span className={styles.shine} aria-hidden="true" />
            <span className={styles.kicker}>Service · {number}</span>
            <h3 className={styles.title}>{service.title}</h3>
            <ul className={styles.keys}>
              {service.keys.map((key) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
            <span className={styles.cta}>
              Start a project
              <span className={styles.disc} aria-hidden="true">
                <Arrow direction="up-right" />
              </span>
            </span>
          </span>
        </Link>
      </Spotlight>
    </m.div>
  );
}

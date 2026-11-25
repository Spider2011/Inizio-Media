'use client';

import { m } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Spotlight } from '@/components/fx/Spotlight';
import { Arrow } from '@/components/ui/Arrow';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { WEDDING_REELS, WEDDING_SERVICES, type WeddingService } from '@/content/weddings';
import { cx } from '@/lib/cx';
import { serviceLink } from '@/lib/enquiry';
import { pad2 } from '@/lib/format';
import { EASE_OUT, VIEW } from '@/lib/motion';
import { withFile } from './reels';
import styles from './WeddingServices.module.css';

/* Three stills from each service's own reels, tucked into the card's corner. */
const STILLS: Record<WeddingService['id'], readonly string[]> = {
  'pre-wedding': ['50', '41', '51'],
  wedding: ['47', '49', '54']
};

function stillsFor(id: string): string[] {
  return (STILLS[id] ?? []).map((reelId) => {
    const reel = WEDDING_REELS.find((r) => r.id === reelId);
    if (!reel) throw new Error(`Still ${reelId} is not on the Weddings page.`);
    return withFile(reel).poster;
  });
}

function ServiceCard({ service, index }: { service: WeddingService; index: number }) {
  return (
    <m.li
      className={cx(styles.item, index % 2 ? styles.right : styles.left)}
      data-reveal=""
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ duration: 1, ease: EASE_OUT, delay: index * 0.12 }}
    >
      <Spotlight as="article" className={cx(styles.card, index % 2 ? styles.blue : styles.butter)} tilt={5}>
        <p className={styles.kicker}>
          <span>{pad2(index + 1)}</span>
          <span className={styles.kind}>{service.kind}</span>
        </p>
        <h3 className={styles.title}>{service.title}</h3>
        <p className={styles.summary}>{service.summary}</p>
        <ul className={styles.includes}>
          {service.includes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className={styles.foot}>
          <Link className={styles.cta} href={serviceLink('wedding')}>
            Book {service.kind.toLowerCase()}
            <span className={styles.disc} aria-hidden="true">
              <Arrow direction="up-right" />
            </span>
          </Link>
          <span className={styles.stills} aria-hidden="true">
            {stillsFor(service.id).map((src) => (
              <Image key={src} className={styles.still} src={src} alt="" width={540} height={960} sizes="72px" />
            ))}
          </span>
        </div>
      </Spotlight>
    </m.li>
  );
}

/* The two things couples book us for, as a pair of invitation cards. */
export function WeddingServices() {
  return (
    <section id="wedding-services" className={styles.section} aria-labelledby="wedding-services-title">
      <div className="container">
        <SectionTitle
          className="fx-on-paper"
          eyebrow="What we film"
          title="Before the day, and on it."
          titleId="wedding-services-title"
          accent={['on', 'it.']}
          lead="Book us for the pre-wedding, the wedding, or both. Either way you get reels people actually finish watching."
        />
        <ul className={styles.list}>
          {WEDDING_SERVICES.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

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

/* Three stills from each service's own reels, tucked into the card's corner. For the design card:
   the haldi welcome board, the guests' notes on playing cards and the save-the-date. */
const STILLS: Record<WeddingService['id'], readonly string[]> = {
  'pre-wedding': ['63', '58', '62'],
  wedding: ['47', '49', '54'],
  stationery: ['50', '55', '59']
};

/* Invitation cards in the brand's colours, side by side. */
const LOOK: Record<WeddingService['id'], { tone: string; place: string }> = {
  'pre-wedding': { tone: styles.butter, place: styles.left },
  wedding: { tone: styles.blue, place: styles.right },
  stationery: { tone: styles.navy, place: styles.third }
};

function stillsFor(id: string): string[] {
  return (STILLS[id] ?? []).map((reelId) => {
    const reel = WEDDING_REELS.find((r) => r.id === reelId);
    if (!reel) throw new Error(`Still ${reelId} is not on the Weddings page.`);
    return withFile(reel).poster;
  });
}

function ServiceCard({ service, index }: { service: WeddingService; index: number }) {
  const look = LOOK[service.id] ?? LOOK.wedding;
  return (
    <m.li
      className={cx(styles.item, look.place)}
      data-reveal=""
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ duration: 1, ease: EASE_OUT, delay: index * 0.12 }}
    >
      <Spotlight as="article" className={cx(styles.card, look.tone)} tilt={5}>
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
            {service.cta}
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

/* What couples book us for: the two filmed services, and the design of everything printed. */
export function WeddingServices() {
  return (
    <section id="wedding-services" className={styles.section} aria-labelledby="wedding-services-title">
      <div className="container">
        <SectionTitle
          className="fx-on-paper"
          eyebrow="What we do"
          title="Before the day, and on it."
          titleId="wedding-services-title"
          accent={['on', 'it.']}
          lead="Book us for the pre-wedding, the wedding, or both, and we will design everything printed with your names on it. Either way you get reels people actually finish watching."
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

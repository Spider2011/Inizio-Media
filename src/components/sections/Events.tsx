'use client';

import { AnimatePresence, m, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Magnetic } from '@/components/fx/Magnetic';
import { Arrow } from '@/components/ui/Arrow';
import { Art } from '@/components/ui/Art';
import { SectionTitle, type MoreLink } from '@/components/ui/SectionTitle';
import { GALLERY } from '@/content/gallery';
import { SITE } from '@/content/site';
import { distribute, EASE_OUT, VIEW } from '@/lib/motion';
import styles from './Events.module.css';
import { Lightbox } from './Lightbox';

type Viewer = { index: number; opened: number };

/* Column drift (px over the section's pass): the middle column runs against the others. */
const DRIFT: readonly [number, number][] = [
  [60, -120],
  [-80, 160],
  [100, -60]
];

export function Events({ more }: { more?: MoreLink }) {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const columns = useMediaQuery('(min-width: 768px)') ? 3 : 2;
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: gridRef, offset: ['start end', 'end start'] });
  const y0 = useTransform(scrollYProgress, [0, 1], DRIFT[0]);
  const y1 = useTransform(scrollYProgress, [0, 1], DRIFT[1]);
  const y2 = useTransform(scrollYProgress, [0, 1], DRIFT[2]);
  const drift = [y0, y1, y2];

  const indexed = GALLERY.map((item, index) => ({ item, index }));

  return (
    <section className={styles.events} id="events" aria-labelledby="events-title">
      <div className="container">
        <SectionTitle
          eyebrow="Events & weddings"
          title="Moments, beautifully kept"
          titleId="events-title"
          accent={['beautifully', 'kept']}
          lead="From sangeet to brand launch: candid coverage, edited fast and shared live."
          more={more}
        />

        <div ref={gridRef} className={styles.grid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {distribute(indexed, columns).map((column, c) => (
            <m.div key={c} className={styles.column} style={{ y: drift[c] }}>
              {column.map(({ item, index }) => (
                <m.button
                  key={item.id}
                  ref={(el) => {
                    buttons.current[index] = el;
                  }}
                  type="button"
                  className={styles.item}
                  data-cursor="Open"
                  aria-label={`Open photo: ${item.caption}`}
                  onClick={() => setViewer({ index, opened: index })}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEW}
                  transition={{ duration: 1, ease: EASE_OUT }}
                  data-reveal=""
                >
                  <m.div layoutId={`photo-${item.id}`} className={styles.media} style={{ aspectRatio: item.ratio }}>
                    {item.photo ? (
                      <Image src={item.photo.image} alt={item.photo.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className={styles.photo} />
                    ) : (
                      <Art tone={item.tone} seed={index + 11} label={`Photo · ${item.ratio.replace('/', ':')}`} />
                    )}
                  </m.div>
                  <span className={styles.caption}>
                    <b>{item.kind}</b>
                    {item.caption}
                  </span>
                </m.button>
              ))}
            </m.div>
          ))}
        </div>

        <div className={styles.more}>
          <Magnetic>
            <a className={styles.moreLink} href={SITE.instagram.url}>
              More on Instagram <Arrow direction="up-right" />
            </a>
          </Magnetic>
        </div>
      </div>

      <AnimatePresence>
        {viewer && (
          <Lightbox
            items={GALLERY}
            index={viewer.index}
            openedIndex={viewer.opened}
            onNavigate={(index) => setViewer((current) => (current ? { ...current, index } : current))}
            onClose={() => setViewer(null)}
            returnFocus={() => buttons.current[viewer.opened] ?? null}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

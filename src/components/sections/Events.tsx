'use client';

import { AnimatePresence, m, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Magnetic } from '@/components/fx/Magnetic';
import { Arrow } from '@/components/ui/Arrow';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { GALLERY, type GalleryItem } from '@/content/gallery';
import { SITE } from '@/content/site';
import { pad2 } from '@/lib/format';
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

/* What event coverage includes, shown until real photographs are in the gallery. */
const COVERAGE = [
  { title: 'Coverage', text: 'Candid photos and video of the moments that matter, at weddings, sangeets and brand launches.' },
  { title: 'Content', text: 'Reels, posts and stories edited fast, ready to share while the day is still fresh.' },
  { title: 'Live updates', text: 'Moments shared live as the event unfolds, so guests and followers never miss a beat.' }
] as const;

/* Events & weddings. The gallery shows only real photographs (items with a `photo`); until there are
   some, the section describes the coverage and points to the latest work on Instagram. */
export function Events({ items = GALLERY }: { items?: readonly GalleryItem[] }) {
  const photos = items.filter((item) => item.photo);
  return (
    <section className={styles.events} id="events" aria-labelledby="events-title">
      <div className="container">
        <SectionTitle
          eyebrow="Events & weddings"
          title="Moments, beautifully kept"
          titleId="events-title"
          accent={['beautifully', 'kept']}
          lead="From sangeet to brand launch: candid coverage, edited fast and shared live."
        />
        {photos.length > 0 ? <Gallery items={photos} /> : <Coverage />}
        <div className={styles.more}>
          <Magnetic>
            <a className={styles.moreLink} href={SITE.instagram.url} target="_blank" rel="noopener noreferrer">
              {photos.length > 0 ? 'More on Instagram' : 'See our latest coverage on Instagram'} <Arrow direction="up-right" />
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

function Coverage() {
  return (
    <ol className={styles.coverage}>
      {COVERAGE.map((item, i) => (
        <m.li
          key={item.title}
          className={styles.coverageItem}
          data-reveal=""
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: i * 0.08 }}
        >
          <span className={styles.coverageIndex}>{pad2(i + 1)}</span>
          <h3 className={styles.coverageTitle}>{item.title}</h3>
          <p className={styles.coverageText}>{item.text}</p>
        </m.li>
      ))}
    </ol>
  );
}

function Gallery({ items }: { items: readonly GalleryItem[] }) {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const columns = useMediaQuery('(min-width: 768px)') ? 3 : 2;
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: gridRef, offset: ['start end', 'end start'] });
  const y0 = useTransform(scrollYProgress, [0, 1], DRIFT[0]);
  const y1 = useTransform(scrollYProgress, [0, 1], DRIFT[1]);
  const y2 = useTransform(scrollYProgress, [0, 1], DRIFT[2]);
  const drift = [y0, y1, y2];

  const indexed = items.map((item, index) => ({ item, index }));

  return (
    <>
      <div ref={gridRef} className={styles.grid} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
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
                  {item.photo && (
                    <Image src={item.photo.image} alt={item.photo.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className={styles.photo} />
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

      <AnimatePresence>
        {viewer && (
          <Lightbox
            items={items}
            index={viewer.index}
            openedIndex={viewer.opened}
            onNavigate={(index) => setViewer((current) => (current ? { ...current, index } : current))}
            onClose={() => setViewer(null)}
            returnFocus={() => buttons.current[viewer.opened] ?? null}
          />
        )}
      </AnimatePresence>
    </>
  );
}

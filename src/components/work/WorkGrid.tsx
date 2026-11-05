'use client';

import Image from 'next/image';
import { SectionTitle } from '@/components/ui/SectionTitle';
import type { GalleryImage } from '@/data/gallery';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { masonryColumns, placeSecondRow } from '@/lib/masonry';
import styles from './WorkGrid.module.css';

/* Column count per breakpoint (the server renders the desktop four). */
function useColumnCount(): number {
  const wide = useMediaQuery('(min-width: 1200px)', true);
  const mid = useMediaQuery('(min-width: 560px)', true);
  return wide ? 4 : mid ? 3 : 2;
}

/* The work itself: every image at its own shape, filled row by row into staggered columns, with the
   images marked `secondRow` placed in the second row. No names or logos. */
export function WorkGrid({ images }: { images: readonly GalleryImage[] }) {
  const columns = useColumnCount();
  const cols = masonryColumns(placeSecondRow(images, columns), columns);
  const total = images.length;
  /* Images are numbered in reading order for screen readers: down each column in turn. */
  const firstOf = cols.map((_, c) => cols.slice(0, c).reduce((sum, col) => sum + col.length, 0));

  return (
    <section className={styles.section} id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionTitle eyebrow="All projects" title="Every beginning, at a glance." titleId="projects-title" accent={['glance.']} />
        <div className={styles.gallery} role="list" style={{ ['--columns' as string]: columns }}>
          {cols.map((col, c) => (
            <div key={c} className={styles.column}>
              {col.map((image, row) => {
                const n = firstOf[c] + row + 1;
                return (
                  <div key={image.src} role="listitem" className={cx(styles.item, image.transparent && styles.onDark)}>
                    <Image
                      className={styles.image}
                      src={image.src}
                      width={image.width}
                      height={image.height}
                      alt={`Work by Inizio Media, ${n} of ${total}`}
                      sizes="(min-width: 1200px) 22vw, (min-width: 560px) 30vw, 45vw"
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

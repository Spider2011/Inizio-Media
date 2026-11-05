import Image from 'next/image';
import { SectionTitle } from '@/components/ui/SectionTitle';
import type { GalleryImage } from '@/data/gallery';
import { cx } from '@/lib/cx';
import styles from './WorkGrid.module.css';

/* The work itself: every image at its own shape, in staggered columns. No names or logos. */
export function WorkGrid({ images }: { images: readonly GalleryImage[] }) {
  return (
    <section className={styles.section} id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionTitle eyebrow="All projects" title="Every beginning, at a glance." titleId="projects-title" accent={['glance.']} />
        <ul className={styles.gallery}>
          {images.map((image, i) => (
            <li key={image.src} className={cx(styles.item, image.transparent && styles.onDark)}>
              <Image
                className={styles.image}
                src={image.src}
                width={image.width}
                height={image.height}
                alt={`Work by Inizio Media, ${i + 1} of ${images.length}`}
                sizes="(min-width: 1200px) 22vw, (min-width: 900px) 30vw, (min-width: 560px) 45vw, 50vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

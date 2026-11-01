'use client';

import { m, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';
import { RollText } from '@/components/site/RollText';
import { Arrow } from '@/components/ui/Arrow';
import { Art } from '@/components/ui/Art';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { WORK, WORK_IS_SAMPLE, type WorkItem } from '@/content/work';
import { cx } from '@/lib/cx';
import { EASE_IN_OUT, EASE_OUT, VIEW } from '@/lib/motion';
import styles from './Work.module.css';

export function Work() {
  return (
    <section className={styles.work} id="work" aria-labelledby="work-title">
      <div className="container">
        <SectionTitle
          eyebrow="Our work"
          title="Selected work"
          titleId="work-title"
          accent={['work']}
          lead={WORK_IS_SAMPLE ? 'Sample cards — swap in real projects and figures.' : 'A few recent beginnings.'}
        />
        <div className={styles.grid}>
          {WORK.map((item, i) => (
            <Project key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Project({ item, index }: { item: WorkItem; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const artY = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);

  return (
    <m.a
      ref={ref}
      href={item.href}
      className={cx(styles.project, index === 0 && styles.feature)}
      data-cursor="View"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ duration: 1.1, ease: EASE_OUT, delay: (index % 2) * 0.12 }}
      data-reveal=""
    >
      <m.div
        className={styles.media}
        initial={{ clipPath: 'inset(18% 10% 18% 10% round 28px)' }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
        viewport={VIEW}
        transition={{ duration: 1.4, ease: EASE_IN_OUT }}
        data-reveal=""
      >
        <m.div className={styles.inner} style={{ y: artY }}>
          {item.photo ? (
            <Image src={item.photo.image} alt={item.photo.alt} fill sizes="(min-width: 900px) 60vw, 100vw" className={styles.photo} />
          ) : (
            <Art tone={item.tone} seed={index * 5 + 2} glyph={item.client.split(' ').map((w) => w[0]).join('')} label="Project image" />
          )}
        </m.div>
      </m.div>
      <div className={styles.meta}>
        <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
        <h3 className={styles.client}>
          <RollText text={item.client} />
        </h3>
        <Arrow direction="up-right" className={styles.arrow} />
      </div>
      <p className={styles.desc}>{item.description}</p>
      <ul className={styles.tags}>
        {item.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {item.result && (
        <p className={styles.result}>
          <strong>{item.result.metric}</strong> {item.result.label}
        </p>
      )}
    </m.a>
  );
}

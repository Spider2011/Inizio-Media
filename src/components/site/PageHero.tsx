'use client';

import { m, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import Link from 'next/link';
import { useRef, type PointerEvent } from 'react';
import { useIntroDone } from '@/components/fx/Intro';
import { SplitText } from '@/components/fx/SplitText';
import { Arrow } from '@/components/ui/Arrow';
import type { PageInfo } from '@/content/pages';
import { PAGES } from '@/content/pages';
import { pad2 } from '@/lib/format';
import { EASE_OUT } from '@/lib/motion';
import styles from './PageHero.module.css';

/* Opening screen of an inner page: breadcrumb, a headline whose letters rise, a giant outlined page
   number that drifts as you scroll, and glowing orbs that lean toward the pointer. */
export function PageHero({ page }: { page: PageInfo }) {
  const ready = useIntroDone();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const indexY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const indexRotate = useTransform(scrollYProgress, [0, 1], [0, -8]);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 18 });
  const sy = useSpring(py, { stiffness: 40, damping: 18 });
  const orbA = { x: useTransform(sx, (v) => v * 110), y: useTransform(sy, (v) => v * 80) };
  const orbB = { x: useTransform(sx, (v) => v * -140), y: useTransform(sy, (v) => v * -100) };

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    px.set(event.clientX / window.innerWidth - 0.5);
    py.set(event.clientY / window.innerHeight - 0.5);
  }

  const appear = (delay: number) => ({
    initial: { opacity: 0, y: 26 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, ease: EASE_OUT, delay }
  });

  return (
    <section ref={ref} id="top" className={styles.hero} aria-labelledby="page-title" onPointerMove={onPointerMove}>
      <div className={styles.backdrop} aria-hidden="true">
        <m.span className={`${styles.orb} ${styles.orbA}`} style={orbA} />
        <m.span className={`${styles.orb} ${styles.orbB}`} style={orbB} />
        <span className={styles.grid} />
        <m.span
          className={styles.index}
          style={{ y: indexY, rotate: indexRotate }}
          initial={{ opacity: 0, x: 80 }}
          animate={ready ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.2 }}
        >
          {pad2(page.index)}
        </m.span>
      </div>

      <m.div className={`container ${styles.content}`} style={{ y: contentY, opacity: contentOpacity }}>
        <m.nav aria-label="Breadcrumb" className={styles.crumbs} data-reveal="" {...appear(0.05)}>
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li aria-current="page">{page.label}</li>
          </ol>
          <span className={styles.count} aria-hidden="true">
            {pad2(page.index)} / {pad2(PAGES.length)}
          </span>
        </m.nav>

        <SplitText
          as="h1"
          id="page-title"
          className={`${styles.title} fx-depth fx-hover`}
          text={page.title}
          by="chars"
          stagger={0.03}
          delay={0.15}
          play={ready}
          classFor={Object.fromEntries(page.accent.map((word) => [word, 'fx-shine']))}
        />

        <div className={styles.row}>
          <m.p className={styles.lead} data-reveal="" {...appear(0.7)}>
            {page.lead}
          </m.p>
          <m.a className={styles.scroll} href="#content" data-reveal="" {...appear(0.9)}>
            <span className={styles.scrollDisc}>
              <Arrow direction="down" />
            </span>
            Scroll
          </m.a>
        </div>
      </m.div>
    </section>
  );
}

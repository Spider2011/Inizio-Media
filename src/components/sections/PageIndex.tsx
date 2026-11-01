'use client';

import { m, useMotionValue, useSpring, type Variants } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, type PointerEvent } from 'react';
import { RollText } from '@/components/site/RollText';
import { Arrow } from '@/components/ui/Arrow';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { PAGES } from '@/content/pages';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { pad2 } from '@/lib/format';
import { EASE_OUT, VIEW } from '@/lib/motion';
import { unsplashLoader, unsplashSrc } from '@/lib/unsplash';
import styles from './PageIndex.module.css';

const row: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT, delay: i * 0.06 } })
};

/* The home page's way in: one row per page. On a mouse, a small artwork preview follows the pointer
   and changes with the row under it. */
export function PageIndex() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const showPreview = useMediaQuery('(pointer: fine) and (prefers-reduced-motion: no-preference)');
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const px = useSpring(x, { stiffness: 260, damping: 28 });
  const py = useSpring(y, { stiffness: 260, damping: 28 });

  function followPointer(event: PointerEvent<HTMLElement>, jump = false) {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    const nx = event.clientX - box.left;
    const ny = event.clientY - box.top;
    /* When a row is entered (including by the page scrolling under a still mouse), the preview
       appears at the pointer rather than gliding in from wherever it last was. */
    if (jump) {
      x.jump(nx);
      y.jump(ny);
      px.jump(nx);
      py.jump(ny);
    } else {
      x.set(nx);
      y.set(ny);
    }
  }

  function onRowEnter(event: PointerEvent<HTMLElement>, i: number) {
    if (event.pointerType !== 'mouse') return;
    followPointer(event, active === null);
    setActive(i);
  }

  const current = active === null ? null : PAGES[active];

  return (
    <section id="explore" className={styles.explore} aria-labelledby="explore-title">
      <div className="container">
        <SectionTitle
          eyebrow="Explore"
          title="Where to next?"
          titleId="explore-title"
          accent={['next?']}
          lead="Every part of the studio has its own page. Pick one, or use the menu any time."
        />

        <div ref={wrapRef} className={styles.wrap} onPointerMove={(event) => followPointer(event)} onPointerLeave={() => setActive(null)}>
          <ol className={styles.list}>
            {PAGES.map((page, i) => (
              <m.li
                key={page.id}
                className={styles.item}
                data-reveal=""
                custom={i}
                variants={row}
                initial="hidden"
                whileInView="show"
                viewport={VIEW}
              >
                <Link className={styles.row} href={page.href} data-cursor="Open" onPointerEnter={(event) => onRowEnter(event, i)}>
                  <span className={styles.index}>{pad2(page.index)}</span>
                  <span className={styles.label}>
                    <RollText text={page.label} />
                  </span>
                  <span className={styles.teaser}>{page.teaser}</span>
                  <span className={styles.disc} aria-hidden="true">
                    <Arrow direction="up-right" />
                  </span>
                </Link>
              </m.li>
            ))}
          </ol>

          {showPreview && (
            <m.div
              className={styles.preview}
              style={{ x: px, y: py }}
              animate={{ opacity: current ? 1 : 0, scale: current ? 1 : 0.6, rotate: current ? -4 : 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              aria-hidden="true"
            >
              {/* Every page's photo stays mounted (so each loads once, ahead of the hover); the
                  hovered one fades and slides up into place. */}
              {PAGES.map((page) => {
                const on = current?.id === page.id;
                return (
                  <m.div
                    key={page.id}
                    className={styles.previewCard}
                    initial={false}
                    animate={{ opacity: on ? 1 : 0, y: on ? 0 : 24, scale: on ? 1 : 1.06 }}
                    transition={{ duration: 0.4, ease: EASE_OUT }}
                  >
                    <Image
                      loader={unsplashLoader}
                      src={unsplashSrc(page.photo)}
                      alt=""
                      fill
                      sizes="260px"
                      className={styles.previewImg}
                    />
                    <span className={styles.previewNumber}>{pad2(page.index)}</span>
                    <span className={styles.previewLabel}>{page.label}</span>
                  </m.div>
                );
              })}
            </m.div>
          )}
        </div>
      </div>
    </section>
  );
}

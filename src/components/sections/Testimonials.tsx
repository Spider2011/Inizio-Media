'use client';

import { m, type PanInfo } from 'motion/react';
import { useState } from 'react';
import { Arrow } from '@/components/ui/Arrow';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { TESTIMONIALS, TESTIMONIALS_ARE_SAMPLE } from '@/content/testimonials';
import { pad2 } from '@/lib/format';
import { EASE_OUT } from '@/lib/motion';
import styles from './Testimonials.module.css';

const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 600;

/* A deck of quotes: swipe the top card away (or use the buttons) and it tucks in at the back. */
export function Testimonials() {
  const [order, setOrder] = useState(() => TESTIMONIALS.map((_, i) => i));
  const next = () => setOrder((o) => [...o.slice(1), o[0]]);
  const previous = () => setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) next();
  }

  return (
    <section className={styles.testimonials} id="testimonials" aria-labelledby="testimonials-title">
      <div className={`container ${styles.layout}`}>
        <div>
          <SectionTitle
            eyebrow="Testimonials"
            title="In their words"
            titleId="testimonials-title"
            accent={['words']}
            lead={TESTIMONIALS_ARE_SAMPLE ? 'Sample quotes — replace with real client words and permission.' : undefined}
          />
          <div className={styles.controls}>
            <button className={styles.control} type="button" onClick={previous} aria-label="Previous testimonial">
              <Arrow direction="left" />
            </button>
            <button className={styles.control} type="button" onClick={next} aria-label="Next testimonial">
              <Arrow />
            </button>
            <p className={styles.counter} aria-live="polite">
              <b>{pad2(order[0] + 1)}</b> / {pad2(TESTIMONIALS.length)}
            </p>
          </div>
        </div>

        <div
          className={styles.deck}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') next();
            if (event.key === 'ArrowLeft') previous();
          }}
        >
          {order.map((id, position) => {
            const item = TESTIMONIALS[id];
            const top = position === 0;
            return (
              <m.figure
                key={id}
                className={styles.card}
                aria-hidden={top ? undefined : true}
                style={{ zIndex: order.length - position }}
                animate={{
                  y: position * 26,
                  scale: 1 - position * 0.06,
                  rotate: top ? 0 : position % 2 ? 4 : -4,
                  opacity: position > 2 ? 0 : 1
                }}
                transition={{ duration: 0.7, ease: EASE_OUT }}
                drag={top ? 'x' : false}
                dragSnapToOrigin
                dragElastic={0.6}
                whileDrag={{ rotate: 6, scale: 1.03 }}
                onDragEnd={top ? onDragEnd : undefined}
                data-cursor={top ? 'Drag' : undefined}
              >
                <span className={styles.mark} aria-hidden="true">
                  &ldquo;
                </span>
                <blockquote className={styles.quote}>{item.quote}</blockquote>
                <figcaption className={styles.by}>
                  <span className={styles.avatar} aria-hidden="true">
                    {item.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')}
                  </span>
                  <span>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.biz}>{item.business}</span>
                  </span>
                </figcaption>
              </m.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

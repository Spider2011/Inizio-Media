'use client';

import { m, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Spotlight } from '@/components/fx/Spotlight';
import { Arrow } from '@/components/ui/Arrow';
import { Art } from '@/components/ui/Art';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { SERVICE_CARDS } from '@/content/services';
import { pad2 } from '@/lib/format';
import styles from './Services.module.css';

/* Matches the CSS that lays the cards out in one row. */
const HORIZONTAL = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

/* Desktop: the section pins and the cards travel sideways as you scroll down. Elsewhere: a grid. */
export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const query = window.matchMedia(HORIZONTAL);
    const measure = () => {
      const track = trackRef.current;
      setDistance(track && query.matches ? Math.max(0, track.scrollWidth - window.innerWidth) : 0);
    };
    measure();
    window.addEventListener('resize', measure);
    query.addEventListener('change', measure);
    return () => {
      window.removeEventListener('resize', measure);
      query.removeEventListener('change', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const pinned = distance > 0;

  return (
    <section
      ref={sectionRef}
      id="services"
      className={styles.services}
      aria-labelledby="services-title"
      style={pinned ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div className={styles.sticky}>
        <m.div ref={trackRef} className={styles.track} style={pinned ? { x } : undefined}>
          <div className={styles.intro}>
            <SectionTitle
              eyebrow="Our services"
              title="What we do"
              titleId="services-title"
              accent={['do']}
              lead="Fourteen services, one team. Pick one, or let us run the whole journey."
            />
            <p className={styles.hint} aria-hidden="true">
              Keep scrolling <Arrow />
            </p>
          </div>
          {SERVICE_CARDS.map((service, i) => (
            <Spotlight key={service.title} as="article" className={styles.card} tilt={10}>
              <a className={styles.link} href="#contact" data-cursor="Enquire">
                <span className={styles.num}>{pad2(i + 1)}</span>
                <div className={styles.art}>
                  <Art tone={i % 3 === 0 ? 'butter' : i % 3 === 1 ? 'blue' : 'navy'} seed={i + 1} />
                </div>
                <h3 className={styles.title}>{service.title}</h3>
                <ul className={styles.keys}>
                  {service.keys.map((key) => (
                    <li key={key}>{key}</li>
                  ))}
                </ul>
                <span className={styles.more}>
                  Start a project <Arrow direction="up-right" />
                </span>
              </a>
            </Spotlight>
          ))}
        </m.div>
        {pinned && <m.span className={styles.progress} style={{ scaleX: scrollYProgress }} aria-hidden="true" />}
      </div>
    </section>
  );
}

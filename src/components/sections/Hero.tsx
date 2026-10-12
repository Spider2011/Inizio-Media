'use client';

import { m, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, type PointerEvent } from 'react';
import markWhite from '@/assets/logos/inizio-im-mark-white.svg';
import { Counter } from '@/components/fx/Counter';
import { useIntroDone } from '@/components/fx/Intro';
import { Magnetic } from '@/components/fx/Magnetic';
import { RotatingBadge } from '@/components/fx/RotatingBadge';
import { SplitText } from '@/components/fx/SplitText';
import { Arrow } from '@/components/ui/Arrow';
import { Art } from '@/components/ui/Art';
import { HERO_STATS } from '@/content/stats';
import { useFitText } from '@/hooks/useFitText';
import { EASE_OUT } from '@/lib/motion';
import styles from './Hero.module.css';
import { RotatingWord } from './RotatingWord';

const BUILD_WORDS = ['brands', 'stories', 'communities', 'growth'] as const;

export function Hero() {
  const ready = useIntroDone();
  const ref = useRef<HTMLElement>(null);
  const titleBoxRef = useRef<HTMLDivElement>(null);
  useFitText(titleBoxRef, { min: 28, max: 150 });

  /* Scroll: the headline drifts down and fades while the page moves up past it. */
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const badgeRotate = useTransform(scrollYProgress, [0, 1], [0, 140]);

  /* Pointer: the glowing orbs lean toward the mouse. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 18 });
  const sy = useSpring(py, { stiffness: 40, damping: 18 });
  const orbA = { x: useTransform(sx, (v) => v * 90), y: useTransform(sy, (v) => v * 70) };
  const orbB = { x: useTransform(sx, (v) => v * -130), y: useTransform(sy, (v) => v * -90) };
  const orbC = { x: useTransform(sx, (v) => v * 50), y: useTransform(sy, (v) => v * -120) };

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    px.set(event.clientX / window.innerWidth - 0.5);
    py.set(event.clientY / window.innerHeight - 0.5);
  }

  const appear = (delay: number) => ({
    initial: { opacity: 0, y: 30 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1.1, ease: EASE_OUT, delay }
  });

  return (
    <section ref={ref} id="top" className={styles.hero} onPointerMove={onPointerMove}>
      <div className={styles.backdrop} aria-hidden="true">
        <m.span className={`${styles.orb} ${styles.orbA}`} style={orbA} />
        <m.span className={`${styles.orb} ${styles.orbB}`} style={orbB} />
        <m.span className={`${styles.orb} ${styles.orbC}`} style={orbC} />
        <span className={styles.grid} />
        <Art tone="navy" seed={3} className={styles.circuit} />
      </div>

      <m.div className={`container ${styles.content}`} style={{ y: contentY, opacity: contentOpacity }}>
        <m.p className={styles.kicker} data-reveal="" {...appear(0.1)}>
          <span className={styles.live} aria-hidden="true" />
          Mumbai · Digital marketing &amp; branding agency
        </m.p>

        {/* The headline takes whatever height is left and is sized to fill it exactly (useFitText). */}
        <div ref={titleBoxRef} className={styles.titleBox}>
          <SplitText
            as="h1"
            className={`${styles.title} fx-depth fx-hover`}
            text="Giving new beginnings to your digital presence."
            by="chars"
            stagger={0.028}
            play={ready}
            delay={0.15}
            classFor={{ beginnings: 'fx-neon', 'presence.': 'fx-shine' }}
          />
        </div>

        <div className={styles.row}>
          <m.p className={styles.lead} data-reveal="" {...appear(1)}>
            We build <RotatingWord words={BUILD_WORDS} play={ready} /> from the first idea to the last report.
          </m.p>
          <m.div className={styles.actions} data-reveal="" {...appear(1.15)}>
            <Magnetic>
              <Link className={styles.primary} href="/contact">
                Book a call <Arrow direction="up-right" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link className={styles.secondary} href="/work">
                See our work
              </Link>
            </Magnetic>
          </m.div>
        </div>
      </m.div>

      <m.div
        className={styles.badge}
        data-reveal=""
        initial={{ opacity: 0, scale: 0.6 }}
        animate={ready ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.9 }}
        style={{ rotate: badgeRotate }}
        aria-hidden="true"
      >
        <RotatingBadge text="Inizio Media • We build brands • ">
          <Image src={markWhite} alt="" width={96} height={49} unoptimized />
        </RotatingBadge>
      </m.div>

      <m.div className={`container ${styles.footer}`} data-reveal="" {...appear(1.3)}>
        <dl className={styles.stats}>
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd>
                <Counter className={`${styles.statNum} fx-metal`}value={stat.value} suffix={stat.suffix} delay={1.4} />
              </dd>
            </div>
          ))}
        </dl>
        <a className={styles.scroll} href="#about">
          <span className={styles.mouse} aria-hidden="true" />
          Scroll to explore
        </a>
      </m.div>
    </section>
  );
}

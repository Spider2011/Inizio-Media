'use client';

import { AnimatePresence, animate, m, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useFitText } from '@/hooks/useFitText';
import { EASE_IN_OUT, EASE_OUT } from '@/lib/motion';
import { INTRO_DONE_EVENT } from './SmoothScroll';
import styles from './Intro.module.css';

/* Whether the opening preloader has finished. Defaults to true, so anything rendered
   outside the provider (tests, other pages) never waits for an intro. */
const IntroContext = createContext(true);

export function useIntroDone(): boolean {
  return useContext(IntroContext);
}

const WORD = 'Inizio Media';

export function IntroProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const reduce = useReducedMotion();
  const wordBoxRef = useRef<HTMLDivElement>(null);
  useFitText(wordBoxRef, { min: 28, max: 200 });
  const count = useMotionValue(0);
  const label = useTransform(count, (v) => String(Math.round(v)).padStart(3, '0'));
  const bar = useTransform(count, [0, 100], [0, 1]);

  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!window.location.hash) {
      history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
    html.classList.add('is-loading');
    /* With reduced motion the count completes at once and the curtain is skipped. */
    const controls = animate(count, 100, {
      duration: reduce ? 0 : 1.8,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => {
        html.classList.remove('is-loading');
        setShowLoader(false);
        setDone(true);
        window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      }
    });
    return () => controls.stop();
  }, [count]);

  return (
    <IntroContext.Provider value={done}>
      <AnimatePresence>
        {showLoader && (
          <m.div
            key="loader"
            className={`preloader ${styles.loader}`}
            aria-hidden="true"
            exit={{ clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: reduce ? 0 : 1, ease: EASE_IN_OUT } }}
          >
            <div ref={wordBoxRef} className={styles.wordBox}>
              <m.div className={styles.word} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
                {[...WORD].map((ch, i) => (
                  <span key={i} className={styles.mask}>
                    <m.span
                      className={styles.char}
                      variants={{ hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.9, ease: EASE_OUT } } }}
                    >
                      {ch === ' ' ? '\u00a0' : ch}
                    </m.span>
                  </span>
                ))}
              </m.div>
            </div>
            <div className={styles.meta}>
              <span>Giving new beginnings</span>
              <m.span className={styles.count}>{label}</m.span>
            </div>
            <m.div className={styles.bar} style={{ scaleX: bar }} />
          </m.div>
        )}
      </AnimatePresence>
      {children}
    </IntroContext.Provider>
  );
}

'use client';

import { m, useReducedMotion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { PAGES } from '@/content/pages';
import { isCurrentPage } from '@/content/site';
import { EASE_IN_OUT, EASE_OUT } from '@/lib/motion';
import { useIntroDone } from './Intro';
import styles from './PageTransition.module.css';

function labelFor(pathname: string | null): string {
  return PAGES.find((page) => isCurrentPage(page.href, pathname))?.label ?? 'Inizio Media';
}

/* Mounted fresh on every navigation (app/template.tsx). After the opening intro, each new page arrives
   under a blue curtain carrying its name, which then wipes upward to reveal it. The first load is left
   to the intro, and reduced motion gets no curtain. */
export function PageTransition({ children }: { children: ReactNode }) {
  const introDone = useIntroDone();
  const reduce = useReducedMotion();
  const pathname = usePathname();
  /* Decided once, at mount: only navigations after the intro get a curtain. */
  const [curtain, setCurtain] = useState(() => introDone && !reduce);

  return (
    <>
      {children}
      {curtain && (
        <m.div
          className={styles.curtain}
          aria-hidden="true"
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.9, ease: EASE_IN_OUT, delay: 0.45 }}
          onAnimationComplete={() => setCurtain(false)}
        >
          <span className={styles.mask}>
            <m.span
              className={`${styles.label} fx-depth`}
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            >
              {labelFor(pathname)}
            </m.span>
          </span>
          <m.span
            className={styles.bar}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          />
        </m.div>
      )}
    </>
  );
}

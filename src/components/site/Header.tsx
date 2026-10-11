'use client';

import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'motion/react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import markWhite from '@/assets/logos/inizio-im-mark-white.svg';
import { Magnetic } from '@/components/fx/Magnetic';
import { useIntroDone } from '@/components/fx/Intro';
import { Arrow } from '@/components/ui/Arrow';
import { NAV_IDS, NAV_LINKS } from '@/content/site';
import { useActiveSection } from '@/hooks/useActiveSection';
import { cx } from '@/lib/cx';
import { EASE_OUT } from '@/lib/motion';
import styles from './Header.module.css';
import { MenuOverlay } from './MenuOverlay';
import { RollText } from './RollText';

const MENU_ID = 'site-menu';

/* Floating glass header: slides away while reading down, returns on the way up. */
export function Header() {
  const ready = useIntroDone();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(NAV_IDS);
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(y > previous && y > 320);
  });

  return (
    <>
      <m.header
        className={styles.header}
        data-reveal=""
        initial={{ y: '-140%' }}
        animate={{ y: ready && !(hidden && !menuOpen) ? '0%' : '-140%' }}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: ready && scrollY.get() < 10 ? 0.6 : 0 }}
        onFocusCapture={() => setHidden(false)}
      >
        <div className={styles.pill}>
          <a className={styles.brand} href="#top" aria-label="Inizio Media — home">
            <Image src={markWhite} alt="" width={64} height={33} unoptimized />
            <span className={styles.word}>
              Inizio
              <br />
              Media
            </span>
          </a>
          <nav aria-label="Main" className={styles.nav}>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    className={cx(styles.link, active === link.id && styles.active)}
                    href={`#${link.id}`}
                    aria-current={active === link.id ? 'location' : undefined}
                  >
                    <RollText text={link.label} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Magnetic className={styles.ctaWrap}>
            <a className={styles.cta} href="#contact">
              <RollText text="Let's talk" />
              <Arrow direction="up-right" />
            </a>
          </Magnetic>
          <button
            ref={toggleRef}
            className={styles.menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            onClick={() => setMenuOpen(true)}
          >
            <span className={styles.menuLabel}>Menu</span>
            <span className={styles.burger} aria-hidden="true" />
          </button>
          <m.span className={styles.progress} style={{ scaleX: scrollYProgress }} aria-hidden="true" />
        </div>
      </m.header>
      <AnimatePresence>
        {menuOpen && (
          <MenuOverlay
            id={MENU_ID}
            active={active}
            onClose={() => setMenuOpen(false)}
            returnFocus={() => toggleRef.current}
          />
        )}
      </AnimatePresence>
    </>
  );
}

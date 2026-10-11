'use client';

import { m, useIsPresent, type Variants } from 'motion/react';
import { useRef } from 'react';
import { Arrow } from '@/components/ui/Arrow';
import { NAV_LINKS, SITE } from '@/content/site';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { cx } from '@/lib/cx';
import { pad2 } from '@/lib/format';
import { EASE_IN_OUT, EASE_OUT } from '@/lib/motion';
import styles from './MenuOverlay.module.css';

type Props = { id: string; active: string | null; onClose: () => void; returnFocus: () => HTMLElement | null };

const ORIGIN = 'calc(100% - 64px) 44px';

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } }
};

const item: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.9, ease: EASE_OUT } }
};

/* Full-screen blue menu that bursts open from the Menu button. */
export function MenuOverlay({ id, active, onClose, returnFocus }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isPresent = useIsPresent();
  useFocusTrap(ref, isPresent, { onEscape: onClose, returnFocus });
  useLockBodyScroll(isPresent);

  return (
    <m.div
      ref={ref}
      id={id}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
      initial={{ clipPath: `circle(0% at ${ORIGIN})` }}
      animate={{ clipPath: `circle(150% at ${ORIGIN})`, transition: { duration: 1, ease: EASE_IN_OUT } }}
      exit={{ clipPath: `circle(0% at ${ORIGIN})`, transition: { duration: 0.7, ease: EASE_IN_OUT } }}
    >
      <div className={styles.top}>
        <span className={styles.kicker}>Menu</span>
        <button className={styles.close} type="button" onClick={onClose}>
          Close <span className={styles.x} aria-hidden="true" />
        </button>
      </div>

      <m.ul className={styles.list} variants={list} initial="hidden" animate="show">
        {NAV_LINKS.map((link, i) => (
          <li key={link.id} className={styles.row}>
            <m.a
              className={cx(styles.link, active === link.id && styles.current)}
              href={`#${link.id}`}
              onClick={onClose}
              variants={item}
            >
              <span className={styles.index}>{pad2(i + 1)}</span>
              <span className={styles.label}>{link.label}</span>
              <Arrow direction="up-right" className={styles.arrow} />
            </m.a>
          </li>
        ))}
      </m.ul>

      <m.div
        className={styles.foot}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.8, duration: 0.8, ease: EASE_OUT } }}
      >
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        <a href={SITE.phone.href}>{SITE.phone.display}</a>
        <a href={SITE.instagram.url}>Instagram {SITE.instagram.handle}</a>
        <span>{SITE.location}</span>
      </m.div>
    </m.div>
  );
}

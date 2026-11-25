'use client';

import { m } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';
import { useIntroDone } from '@/components/fx/Intro';
import { RotatingBadge } from '@/components/fx/RotatingBadge';
import { WEDDING_REELS } from '@/content/weddings';
import { useInViewPlayback } from '@/hooks/useInViewPlayback';
import { EASE_OUT } from '@/lib/motion';
import { withFile, type ShownReel } from './reels';
import styles from './HeroReels.module.css';

/* The three on the opening screen: the sindoor, an entry, and the sisters. */
const HERO_IDS = ['49', '40', '54'] as const;
const FAN = [
  { rotate: -9, x: '-58%', y: '6%' },
  { rotate: 0, x: '0%', y: '-4%' },
  { rotate: 8, x: '58%', y: '8%' }
] as const;

function HeroPrint({ reel, index, ready }: { reel: ShownReel; index: number; ready: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useInViewPlayback(videoRef);
  const fan = FAN[index];
  return (
    <m.span
      className={styles.print}
      style={{ zIndex: index === 1 ? 2 : 1 }}
      initial={{ opacity: 0, x: '0%', y: '30%', rotate: 0, scale: 0.9 }}
      animate={ready ? { opacity: 1, x: fan.x, y: fan.y, rotate: fan.rotate, scale: 1 } : undefined}
      transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.35 + index * 0.12 }}
    >
      <Image className={styles.media} src={reel.poster} alt="" width={540} height={960} sizes="172px" />
      <video ref={videoRef} className={styles.media} src={reel.preview} muted loop playsInline preload="none" />
      <span className={styles.caption}>{reel.moment}</span>
    </m.span>
  );
}

/* Two linked rings. */
function Rings() {
  return (
    <svg viewBox="0 0 32 24" width="34" height="26">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* Decorative: three wedding reels fanned out like prints behind the Weddings headline, looping
   silently, with a slowly turning badge. The reels themselves are on the strip below. */
export function HeroReels() {
  const ready = useIntroDone();
  const reels = HERO_IDS.map((id) => {
    const reel = WEDDING_REELS.find((r) => r.id === id);
    if (!reel) throw new Error(`Hero reel ${id} is not on the Weddings page.`);
    return withFile(reel);
  });
  return (
    <span className={styles.stage} aria-hidden="true">
      <span className={styles.fan}>
        {reels.map((reel, i) => (
          <HeroPrint key={reel.id} reel={reel} index={i} ready={ready} />
        ))}
        <m.span
          className={styles.badge}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={ready ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 1, ease: EASE_OUT, delay: 1 }}
        >
          <RotatingBadge text="Pre-wedding · Wedding · Reels ·">
            <span className={styles.badgeCore}>
              <Rings />
            </span>
          </RotatingBadge>
        </m.span>
      </span>
    </span>
  );
}

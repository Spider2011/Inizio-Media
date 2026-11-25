'use client';

import { m } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { ReelPlayer } from '@/components/work/ReelPlayer';
import { WEDDING_REASONS, WEDDING_REELS } from '@/content/weddings';
import { pad2 } from '@/lib/format';
import { EASE_OUT, VIEW } from '@/lib/motion';
import { withFile, type ShownReel } from './reels';
import styles from './WeddingWhy.module.css';

function proofReel(id: string): ShownReel {
  const reel = WEDDING_REELS.find((r) => r.id === id);
  if (!reel) throw new Error(`Proof reel ${id} is not on the Weddings page.`);
  return withFile(reel);
}

/* Why couples pick us: three reasons, each with a reel that proves it, ready to play. */
export function WeddingWhy() {
  const [openReel, setOpenReel] = useState<ShownReel | null>(null);
  return (
    <section id="wedding-why" className={styles.section} aria-labelledby="wedding-why-title">
      <div className="container">
        <SectionTitle eyebrow="Why couples pick us" title="Not just footage. Stories." titleId="wedding-why-title" accent={['Stories.']} />
        <ol className={styles.list}>
          {WEDDING_REASONS.map((reason, i) => {
            const reel = proofReel(reason.proof);
            return (
              <m.li
                key={reason.title}
                className={styles.row}
                data-reveal=""
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEW}
                transition={{ duration: 0.9, ease: EASE_OUT }}
              >
                <span className={styles.number} aria-hidden="true">
                  {pad2(i + 1)}
                </span>
                <div className={styles.copy}>
                  <h3 className={styles.title}>{reason.title}</h3>
                  <p className={styles.text}>{reason.text}</p>
                </div>
                <button
                  type="button"
                  className={styles.proof}
                  onClick={() => setOpenReel(reel)}
                  aria-label={`Watch the proof: “${reel.hook}”`}
                  data-cursor="Play"
                >
                  <Image className={styles.thumb} src={reel.poster} alt="" width={540} height={960} sizes="64px" />
                  <span className={styles.quote}>
                    <span className={styles.quoteText}>“{reel.hook}”</span>
                    <span className={styles.watch}>Watch the reel</span>
                  </span>
                </button>
              </m.li>
            );
          })}
        </ol>
      </div>
      <ReelPlayer
        reel={openReel ? { src: openReel.src, poster: openReel.poster, label: openReel.hook } : null}
        onClose={() => setOpenReel(null)}
      />
    </section>
  );
}

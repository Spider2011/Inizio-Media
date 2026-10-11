'use client';

import { m, type Variants } from 'motion/react';
import { Fragment, useState, type CSSProperties } from 'react';
import { EASE_OUT, VIEW } from '@/lib/motion';

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';

type Props = {
  text: string;
  as?: Tag;
  by?: 'chars' | 'words';
  className?: string;
  style?: CSSProperties;
  id?: string;
  /** Extra class per word, keyed by the word exactly as written (e.g. { 'presence.': styles.accent }). */
  classFor?: Readonly<Record<string, string>>;
  delay?: number;
  stagger?: number;
  /** Controlled play (e.g. after the intro); omit to play when scrolled into view. */
  play?: boolean;
};

const unit: Variants = {
  hidden: { y: '115%', rotate: 7 },
  show: { y: '0%', rotate: 0, transition: { duration: 1.05, ease: EASE_OUT } }
};

/* Headline that rises out of masks letter by letter (or word by word). Screen readers get the sentence once. */
export function SplitText({
  text,
  as: Tag = 'p',
  by = 'words',
  className,
  style,
  id,
  classFor = {},
  delay = 0,
  stagger,
  play
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const step = stagger ?? (by === 'chars' ? 0.022 : 0.07);
  const trigger = play === undefined ? { whileInView: 'show', viewport: VIEW } : { animate: play ? 'show' : 'hidden' };
  const lines = text.split('\n');

  return (
    <Tag className={className} style={style} id={id}>
      <span className="sr-only">{lines.join(' ')}</span>
      <m.span
        aria-hidden="true"
        className={revealed ? 'split-done' : undefined}
        initial="hidden"
        {...trigger}
        onAnimationComplete={(definition) => {
          if (definition === 'show') setRevealed(true);
        }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: step, delayChildren: delay } } }}
      >
        {lines.map((line, li) => (
          <Fragment key={li}>
            {li > 0 && <br />}
            {line.split(' ').map((word, wi, words) => (
              <Fragment key={wi}>
                <span className={classFor[word] ? `split-word ${classFor[word]}` : 'split-word'}>
                  {(by === 'chars' ? [...word] : [word]).map((piece, pi) => (
                    <span key={pi} className="split-mask">
                      <m.span
                        className="split-unit"
                        variants={unit}
                        data-reveal=""
                        style={{ '--i': pi } as CSSProperties}
                      >
                        {piece}
                      </m.span>
                    </span>
                  ))}
                </span>
                {wi < words.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </m.span>
    </Tag>
  );
}

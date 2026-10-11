'use client';

import { m, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { Art } from '@/components/ui/Art';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { PROCESS_STEPS, type ProcessStep } from '@/content/process';
import type { PlaceholderTone } from '@/content/types';
import { cx } from '@/lib/cx';
import { pad2 } from '@/lib/format';
import styles from './Process.module.css';

const ART_TONES: readonly PlaceholderTone[] = ['navy', 'blue', 'butter', 'navy'];

/* Cards stick one over another; each shrinks back a little as the next arrives. */
export function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <section className={styles.process} id="process" aria-labelledby="process-title">
      <div className="container">
        <SectionTitle
          eyebrow="How we work"
          title="Our process"
          titleId="process-title"
          accent={['process']}
          lead="Four steps from brief to launch, then round again: every launch is the next beginning."
        />
        <ol ref={ref} className={styles.stack}>
          {PROCESS_STEPS.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} total={PROCESS_STEPS.length} progress={scrollYProgress} />
          ))}
        </ol>
      </div>
    </section>
  );
}

type CardProps = { step: ProcessStep; index: number; total: number; progress: MotionValue<number> };

function StepCard({ step, index, total, progress }: CardProps) {
  const scale = useTransform(progress, [index / total, 1], [1, 1 - (total - 1 - index) * 0.05]);
  return (
    <li className={styles.slot} style={{ top: `calc(96px + ${index * 28}px)` }}>
      <m.article className={cx(styles.card, styles[`tone${index}`])} style={{ scale }}>
        <span className={styles.index}>{pad2(index + 1)}</span>
        <div className={styles.text}>
          <h3 className={styles.title}>{step.title}</h3>
          <p className={styles.desc}>{step.description}</p>
        </div>
        <div className={styles.art}>
          <Art tone={ART_TONES[index]} seed={index + 7} glyph={pad2(index + 1)} />
        </div>
      </m.article>
    </li>
  );
}

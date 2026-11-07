'use client';

import { m, useScroll, useTransform, type MotionValue } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { PROCESS_STEPS, type ProcessStep } from '@/content/process';
import { cx } from '@/lib/cx';
import { pad2 } from '@/lib/format';
import { photoSource } from '@/lib/unsplash';
import styles from './Process.module.css';

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
  const { link } = step;
  return (
    <li className={styles.slot} style={{ top: `calc(96px + ${index * 28}px)` }}>
      <m.article className={cx(styles.card, styles[`tone${index}`], link && styles.linked)} style={{ scale }}>
        <span className={styles.index}>{pad2(index + 1)}</span>
        {link && (
          <span className={styles.cta} aria-hidden="true">
            {link.cta}
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        <div className={styles.text}>
          <h3 className={styles.title}>
            {link ? (
              /* Its ::after covers the whole card, so the card is one link. */
              <Link href={link.href} className={styles.cardLink} aria-label={link.label} data-cursor={link.cta}>
                {step.title}
              </Link>
            ) : (
              step.title
            )}
          </h3>
          <p className={styles.desc}>{step.description}</p>
        </div>
        <div className={styles.art}>
          <Image
            {...photoSource(step.photo)}
            alt={step.photo.alt}
            fill
            sizes="(min-width: 900px) 40vw, 90vw"
            className={styles.photo}
          />
        </div>
      </m.article>
    </li>
  );
}

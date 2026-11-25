'use client';

import {
  m,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue
} from 'motion/react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react';
import { getLenis } from '@/components/fx/SmoothScroll';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Arrow } from '@/components/ui/Arrow';
import { ReelPlayer } from '@/components/work/ReelPlayer';
import { WEDDING_CHAPTERS, type WeddingChapter } from '@/content/weddings';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { serviceLink } from '@/lib/enquiry';
import { activeChapter, filmGeometry, progressToCentre, scrollForProgress } from '@/lib/film';
import { pad2 } from '@/lib/format';
import { ReelCard } from './ReelCard';
import { withFile, type ShownReel } from './reels';
import styles from './WeddingFilm.module.css';

/* Wide screens get the pinned, sideways strip; phones and tablets swipe each chapter instead. */
const PIN_QUERY = '(min-width: 900px)';
/* Where a chapter "starts" for the tabs: its card just inside the left edge. */
const CHAPTER_LEAD_PX = 48;

type Chapter = WeddingChapter & { shown: readonly ShownReel[]; firstFrame: number };

/* Each chapter with its reels' files and the frame number its first reel carries. */
const CHAPTERS: readonly Chapter[] = WEDDING_CHAPTERS.map((chapter, i) => ({
  ...chapter,
  shown: chapter.reels.map(withFile),
  firstFrame: 1 + WEDDING_CHAPTERS.slice(0, i).reduce((sum, c) => sum + c.reels.length, 0)
}));

function scrollWindowTo(top: number, smooth: boolean) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(top, smooth ? { duration: 1.2 } : { immediate: true, force: true });
  else window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
}

/* The Weddings page's reels as one roll of film, in the order a wedding happens. On wide screens the
   strip is pinned and runs sideways as the page scrolls (leaning with the scroll's speed), with
   chapter tabs underneath; on phones each chapter is its own swipeable strip. Any frame opens the
   reel with sound. */
export function WeddingFilm() {
  const chapters = CHAPTERS;
  const pinned = useMediaQuery(PIN_QUERY);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const chapterRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [height, setHeight] = useState<number | null>(null);
  const [starts, setStarts] = useState<readonly number[]>(() => chapters.map((_, i) => i / chapters.length));
  const [active, setActive] = useState(0);
  const [openReel, setOpenReel] = useState<ShownReel | null>(null);

  const travel = useMotionValue(0);
  const { scrollYProgress, scrollY } = useScroll({ target: pinRef, offset: ['start start', 'end end'] });
  const x = useTransform(() => -scrollYProgress.get() * travel.get());
  const lean = useTransform(useVelocity(scrollY), [-2500, 2500], [4, -4], { clamp: true });
  const skewX = useSpring(lean, { stiffness: 220, damping: 32 });

  /* Measure the strip: how far it travels, so how tall the pinned stretch is, and where each chapter starts. */
  useEffect(() => {
    const track = trackRef.current;
    if (!pinned || !track) {
      travel.set(0);
      setHeight(null);
      return;
    }
    const measure = () => {
      const geometry = filmGeometry(track.scrollWidth, window.innerWidth, window.innerHeight);
      travel.set(geometry.travel);
      setHeight(geometry.height);
      setStarts(
        chapterRefs.current.map((el) =>
          el && geometry.travel > 0 ? Math.min(1, Math.max(0, (el.offsetLeft - CHAPTER_LEAD_PX) / geometry.travel)) : 0
        )
      );
    };
    measure();
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    resize?.observe(track);
    window.addEventListener('resize', measure);
    return () => {
      resize?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pinned, travel]);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => setActive(activeChapter(progress, starts)));

  const pinTop = useCallback(() => (pinRef.current ? pinRef.current.getBoundingClientRect().top + window.scrollY : 0), []);

  /* Tabbing along the strip: bring the focused frame to the middle of the screen. (The browser cannot
     scroll a transformed, clipped strip by itself.) Pointer clicks also focus, so only keyboard focus moves it. */
  const onCardFocus = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      const track = trackRef.current;
      const card = event.currentTarget;
      if (!pinned || !track || !card.matches(':focus-visible')) return;
      const rect = card.getBoundingClientRect();
      const pointX = rect.left - track.getBoundingClientRect().left + rect.width / 2;
      scrollWindowTo(scrollForProgress(progressToCentre(pointX, window.innerWidth, travel.get()), pinTop(), travel.get()), false);
    },
    [pinned, pinTop, travel]
  );

  const jumpTo = (index: number) => scrollWindowTo(scrollForProgress(starts[index] ?? 0, pinTop(), travel.get()), true);

  return (
    <section id="wedding-film" className={styles.film} aria-labelledby="film-title">
      <div className="container">
        <SectionTitle
          eyebrow="The reels"
          title="Every ritual, a reel."
          titleId="film-title"
          accent={['reel.']}
          lead="Real weddings we’ve filmed, in the order a wedding happens. Tap any frame to watch it with sound."
        />
      </div>

      <div ref={pinRef} className={styles.pin} data-pinned={pinned ? '' : undefined} style={height ? { height } : undefined}>
        <div className={styles.sticky}>
          <m.ol ref={trackRef} className={styles.track} style={pinned ? { x, skewX } : undefined}>
            {chapters.map((chapter, i) => (
              <li
                key={chapter.id}
                ref={(el) => {
                  chapterRefs.current[i] = el;
                }}
                className={styles.chapter}
              >
                <ChapterCard chapter={chapter} number={i + 1} />
                <ul className={styles.reels} aria-label={`${chapter.title}: ${chapter.shown.length} reels`}>
                  {chapter.shown.map((reel, j) => (
                    <li key={reel.id}>
                      <ReelCard reel={reel} frame={chapter.firstFrame + j} onOpen={setOpenReel} onFocus={onCardFocus} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <li className={styles.end}>
              <EndCard onFocus={onCardFocus} />
            </li>
          </m.ol>

          {pinned && (
            <nav className={styles.tabs} aria-label="Chapters">
              <ol>
                {chapters.map((chapter, i) => (
                  <ChapterTab
                    key={chapter.id}
                    chapter={chapter}
                    number={i + 1}
                    from={starts[i] ?? 0}
                    to={starts[i + 1] ?? 1}
                    progress={scrollYProgress}
                    current={active === i}
                    onSelect={() => jumpTo(i)}
                  />
                ))}
              </ol>
            </nav>
          )}
        </div>
      </div>

      <ReelPlayer
        reel={openReel ? { src: openReel.src, poster: openReel.poster, label: openReel.hook } : null}
        onClose={() => setOpenReel(null)}
      />
    </section>
  );
}

/* The title card that opens each chapter, set like a wedding card. */
function ChapterCard({ chapter, number }: { chapter: Chapter; number: number }) {
  return (
    <div className={styles.chapterCard}>
      <p className={styles.chapterKicker}>
        <span>Chapter {pad2(number)}</span>
        <span className={styles.kind}>{chapter.kind}</span>
      </p>
      <h3 className={styles.chapterTitle}>{chapter.title}</h3>
      <ul className={styles.rituals}>
        {chapter.rituals.map((ritual) => (
          <li key={ritual}>{ritual}</li>
        ))}
      </ul>
      <p className={styles.count}>
        {chapter.shown.length} reels
        <span className={styles.swipe} aria-hidden="true">
          <Arrow direction="right" />
        </span>
      </p>
    </div>
  );
}

function EndCard({ onFocus }: { onFocus: (event: FocusEvent<HTMLElement>) => void }) {
  return (
    <div className={styles.endCard}>
      <p className={styles.endKicker}>The next reel can be</p>
      <p className={styles.endTitle}>Yours.</p>
      <p className={styles.endText}>Tell us your dates and functions, and we’ll plan the reels with you.</p>
      <Link className={styles.endCta} href={serviceLink('wedding')} onFocus={onFocus}>
        Book your dates
        <Arrow direction="up-right" />
      </Link>
    </div>
  );
}

type TabProps = {
  chapter: Chapter;
  number: number;
  from: number;
  to: number;
  progress: MotionValue<number>;
  current: boolean;
  onSelect: () => void;
};

/* A chapter under the strip: its name, and a bar that fills while that chapter passes. */
function ChapterTab({ chapter, number, from, to, progress, current, onSelect }: TabProps) {
  const fill = useTransform(progress, [from, Math.max(to, from + 0.0001)], [0, 1], { clamp: true });
  return (
    <li>
      <button type="button" className={styles.tab} aria-current={current ? 'step' : undefined} onClick={onSelect}>
        <span className={styles.tabLabel}>
          <span className={styles.tabNumber}>{pad2(number)}</span>
          {chapter.title}
        </span>
        <span className={styles.tabRail} aria-hidden="true">
          <m.span className={styles.tabFill} style={{ scaleX: fill }} />
        </span>
      </button>
    </li>
  );
}

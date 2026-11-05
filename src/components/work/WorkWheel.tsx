'use client';

import { animate, m, useMotionValue, type AnimationPlaybackControls, type MotionValue } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import inizioLogo from '@/assets/logos/inizio-logo.png';
import { useIntroDone } from '@/components/fx/Intro';
import type { PageInfo } from '@/content/pages';
import { coverSrc, isExternal, type WorkProject } from '@/data/work';
import { holdHeader } from '@/lib/header-hold';
import { EASE_OUT } from '@/lib/motion';
import {
  activeSlot,
  canonicalSlots,
  cardPose,
  cardTransform,
  DESIGN,
  DRIFT_DEG_PER_S,
  fitScale,
  follow,
  glide,
  pivotFor,
  pxToDegrees,
  ringLayout,
  scaleFor,
  sceneOriginY,
  SLOTS,
  STALE_RELEASE_MS,
  turnFor,
  wrapAngle
} from '@/lib/wheel';
import styles from './WorkWheel.module.css';

const DEAL_SECONDS = 2.6;
const LIFT_SECONDS = 1.9;
const LIFT_EASE = [0.5, 0, 0.15, 1] as const;
const REVEAL_AFTER_MS = 450; // header + headline start ~1s into the lift once their own easing is added
const PLAY_WITHIN_DEG = 40;
const ASSET_TIMEOUT_MS = 6000;
const DRAG_THRESHOLD_PX = 6;
const SEEN_KEY = 'inizio:work-wheel-dealt';

type Phase = 'waiting' | 'deal' | 'lift' | 'done';

/* ---------- small helpers ---------- */

function readSeen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false; // Storage blocked (private mode, policies): treat as a first visit.
  }
}

function markSeen() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* Storage blocked: the full deal simply plays again next time. */
  }
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function withTimeout(task: Promise<unknown>): Promise<void> {
  return Promise.race([task, new Promise((resolve) => setTimeout(resolve, ASSET_TIMEOUT_MS))]).then(
    () => undefined,
    () => undefined // A failed image or clip must not hold the reveal back; the card keeps its fallback.
  );
}

function decodeImage(src: string): Promise<void> {
  const img = new window.Image();
  img.src = src;
  return withTimeout(typeof img.decode === 'function' ? img.decode() : Promise.resolve());
}

function warmVideo(src: string): Promise<void> {
  const video = document.createElement('video');
  video.muted = true;
  video.preload = 'auto';
  video.src = src;
  return withTimeout(
    new Promise<void>((resolve) => {
      video.addEventListener('canplaythrough', () => resolve(), { once: true });
      video.addEventListener('error', () => resolve(), { once: true });
    })
  );
}

/** Decodes every card face and warms the clips that will play first, reporting 0–100. */
async function loadAssets(projects: readonly WorkProject[], firstPlaying: readonly number[], onProgress: (pct: number) => void) {
  const faces = [...new Set(projects.map((p) => coverSrc(p.cover) ?? p.logo?.src).filter(Boolean) as string[])];
  const clips = [...new Set(firstPlaying.map((i) => projects[i]?.preview).filter(Boolean) as string[])];
  const jobs = [...faces.map(decodeImage), ...clips.map(warmVideo)];
  if (jobs.length === 0) return onProgress(100);
  let done = 0;
  await Promise.all(jobs.map((job) => job.then(() => onProgress(Math.round((++done / jobs.length) * 100)))));
}

/* ---------- the component ---------- */

type Props = { page: PageInfo; projects: readonly WorkProject[] };

/* The Our Work hero: a deck of 9:16 project cards dealt into a fan while the page loads, then lifted
   into a slowly turning wheel the visitor can drag, swipe, scroll sideways or step with the arrows. */
export function WorkWheel({ page, projects }: Props) {
  const introDone = useIntroDone();
  const layout = useMemo(() => ringLayout(projects.length), [projects.length]);
  const canonical = useMemo(() => canonicalSlots(layout), [layout]);

  const deal = useMotionValue(0);
  const lift = useMotionValue(0);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);

  const frameRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const wheelRef = useRef<WheelState>(newWheelState());
  const skipRef = useRef<() => void>(() => {});

  /* The entrance: deal (first visit this session) → wait for assets → lift → reveal header + headline. */
  useEffect(() => {
    if (!introDone || layout.length === 0) return;
    if (prefersReducedMotion()) {
      deal.set(1);
      lift.set(1);
      /* Settle on the next frame, from a callback rather than during the effect itself. */
      const id = requestAnimationFrame(() => {
        setProgress(100);
        setRevealed(true);
        setPhase('done');
      });
      return () => cancelAnimationFrame(id);
    }
    const release = holdHeader();
    const running: AnimationPlaybackControls[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    let finished = false;

    const reveal = () => {
      setRevealed(true);
      release();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      running.forEach((c) => c.stop());
      timers.forEach(clearTimeout);
      deal.set(1);
      lift.set(1);
      reveal();
      setPhase('done');
    };
    skipRef.current = finish;

    const seen = readSeen();
    markSeen();
    const firstPlaying = nearTop(layout, 1, PLAY_WITHIN_DEG);
    const assets = loadAssets(projects, firstPlaying, setProgress);
    const dealt = seen
      ? (deal.set(1), Promise.resolve())
      : new Promise<void>((resolve) => {
          setPhase('deal');
          running.push(animate(deal, 1, { duration: DEAL_SECONDS, ease: 'linear', onComplete: resolve }));
        });

    Promise.all([dealt, assets]).then(() => {
      if (finished) return;
      setPhase('lift');
      running.push(animate(lift, 1, { duration: LIFT_SECONDS, ease: LIFT_EASE, onComplete: finish }));
      timers.push(setTimeout(reveal, REVEAL_AFTER_MS));
    });

    return () => {
      finished = true;
      running.forEach((c) => c.stop());
      timers.forEach(clearTimeout);
      release();
    };
  }, [introDone, layout, projects, deal, lift]);

  /* Escape or Tab end the entrance at once. */
  const entering = phase === 'deal' || phase === 'lift' || phase === 'waiting';
  useEffect(() => {
    if (!entering) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Tab') skipRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entering]);

  useWheelLoop({ frameRef, headlineRef, sceneRef, backdropRef, cardRefs, videoRefs, deal, lift, wheelRef, layout, onActive: setActive });
  useWheelGestures(frameRef, wheelRef, lift);

  /* Roving tab stop: the real (non-repeat) card nearest the top is the one Tab lands on. */
  const tabStop = useMemo(() => nearestCanonical(layout, canonical, active), [layout, canonical, active]);

  /* Arrow keys: one real card at a time, then focus follows it to the top. */
  const step = (direction: 1 | -1) => {
    let slot = activeSlot(wheelRef.current.target, lift.get());
    for (let i = 0; i < SLOTS; i++) {
      slot = (slot + direction + SLOTS) % SLOTS;
      if (canonical[slot]) break;
    }
    wheelRef.current.velocity = 0;
    wheelRef.current.target = turnFor(slot, lift.get(), wheelRef.current.target);
    cardRefs.current[slot]?.focus({ preventScroll: true });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      step(event.key === 'ArrowRight' ? 1 : -1);
    }
  };

  /* A drag must never open a card: only a clean tap or click does. */
  const onCardClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (wheelRef.current.suppressClick) {
      event.preventDefault();
      wheelRef.current.suppressClick = false;
    }
  };

  return (
    <section
      ref={frameRef}
      id="top"
      className={styles.frame}
      data-phase={phase}
      aria-labelledby="page-title"
      onKeyDown={onKeyDown}
    >
      <div ref={backdropRef} className={styles.backdrop} aria-hidden="true" />

      <Headline page={page} revealed={revealed} headlineRef={headlineRef} />

      <div className={styles.stage} role="group" aria-roledescription="carousel" aria-label="Projects. Use the left and right arrow keys to turn the wheel.">
        <div ref={sceneRef} className={styles.scene}>
          {layout.map((projectIndex, slot) => {
            const project = projects[projectIndex];
            const isReal = canonical[slot];
            return (
              <Card
                key={slot}
                slot={slot}
                project={project}
                isReal={isReal}
                tabbable={slot === tabStop}
                cardRef={(el) => (cardRefs.current[slot] = el)}
                videoRef={(el) => (videoRefs.current[slot] = el)}
                onClick={onCardClick}
                onPointerEnter={(e) => e.pointerType === 'mouse' && (wheelRef.current.hovered = slot)}
                onPointerLeave={() => wheelRef.current.hovered === slot && (wheelRef.current.hovered = -1)}
                onFocus={() => {
                  wheelRef.current.focused = slot;
                  wheelRef.current.target = turnFor(slot, lift.get(), wheelRef.current.target);
                }}
                onBlur={() => wheelRef.current.focused === slot && (wheelRef.current.focused = -1)}
              />
            );
          })}
        </div>
      </div>


      <div className={styles.loader} aria-hidden={!entering}>
        <span className={styles.counter} role="progressbar" aria-label="Loading projects" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          {String(progress).padStart(3, '0')}
        </span>
        {entering && (
          <button type="button" className={styles.skip} onClick={() => skipRef.current()}>
            Skip intro
          </button>
        )}
      </div>
    </section>
  );
}

/* ---------- pieces ---------- */

function Headline({ page, revealed, headlineRef }: { page: PageInfo; revealed: boolean; headlineRef: RefObject<HTMLDivElement | null> }) {
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 40 },
    animate: revealed ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, ease: EASE_OUT, delay }
  });
  return (
    <div ref={headlineRef} className={`container ${styles.headline}`}>
      <m.nav aria-label="Breadcrumb" className={styles.crumbs} data-reveal="" {...rise(0)}>
        <ol>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li aria-current="page">{page.label}</li>
        </ol>
      </m.nav>
      <div className={styles.titleMask}>
        <m.h1 id="page-title" className={`${styles.title} fx-depth`} data-reveal="" {...rise(0.08)}>
          {page.title}
        </m.h1>
      </div>
      <m.p className={styles.lead} data-reveal="" {...rise(0.2)}>
        {page.lead}
      </m.p>
    </div>
  );
}

type CardProps = {
  slot: number;
  project: WorkProject;
  isReal: boolean;
  tabbable: boolean;
  cardRef: (el: HTMLAnchorElement | null) => void;
  videoRef: (el: HTMLVideoElement | null) => void;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onPointerEnter: (event: ReactPointerEvent<HTMLAnchorElement>) => void;
  onPointerLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
};

function Card({ slot, project, isReal, tabbable, cardRef, videoRef, ...handlers }: CardProps) {
  const external = isExternal(project.href);
  const cover = coverSrc(project.cover);
  return (
    <a
      ref={cardRef}
      className={styles.card}
      href={project.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={isReal ? `${project.client}, ${project.title}, ${project.category}${external ? ' (opens in a new tab)' : ''}` : undefined}
      aria-hidden={isReal ? undefined : true}
      tabIndex={isReal && tabbable ? 0 : -1}
      data-card={slot}
      data-cursor="Open"
      draggable={false}
      {...handlers}
    >
      <span className={styles.front}>
        {cover ? (
          <Image className={styles.cover} src={cover} alt="" fill sizes="240px" unoptimized draggable={false} />
        ) : (
          <span className={styles.logoFace}>
            {project.logo && <Image className={styles.logo} src={project.logo} alt="" sizes="160px" unoptimized draggable={false} />}
            <span className={styles.faceName}>{project.client}</span>
          </span>
        )}
        {project.preview && (
          <video
            ref={videoRef}
            className={styles.video}
            src={project.preview}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onPlaying={(e) => e.currentTarget.parentElement?.setAttribute('data-playing', '')}
            onPause={(e) => e.currentTarget.parentElement?.removeAttribute('data-playing')}
          />
        )}
        <span className={styles.tag}>{project.category}</span>
      </span>
      <span className={styles.back} aria-hidden="true">
        <Image className={styles.backLogo} src={inizioLogo} alt="" sizes="120px" draggable={false} />
      </span>
    </a>
  );
}


/* ---------- wheel state, loop and gestures ---------- */

type WheelState = {
  current: number;
  target: number;
  velocity: number;
  dragging: boolean;
  hovered: number;
  focused: number;
  suppressClick: boolean;
  k: number;
  height: number;
  /** Where the lifted top card's top edge goes: just under the headline. */
  topEdge: number;
};

function newWheelState(): WheelState {
  return { current: 0, target: 0, velocity: 0, dragging: false, hovered: -1, focused: -1, suppressClick: false, k: 1, height: 900, topEdge: 270 };
}

/** Slots within `within` degrees of the top once the wheel has turned by `lift`'s opening turn. */
function nearTop(layout: readonly number[], liftValue: number, within: number): number[] {
  return layout.flatMap((project, slot) => (Math.abs(cardPose(slot, 0, 1, liftValue, 1).angle) <= within ? [project] : []));
}

function nearestCanonical(layout: readonly number[], canonical: readonly boolean[], from: number): number {
  for (let d = 0; d < layout.length; d++) {
    for (const s of [from + d, from - d]) {
      const slot = (s + layout.length) % layout.length;
      if (canonical[slot]) return slot;
    }
  }
  return 0;
}

type LoopArgs = {
  frameRef: RefObject<HTMLElement | null>;
  headlineRef: RefObject<HTMLDivElement | null>;
  sceneRef: RefObject<HTMLDivElement | null>;
  backdropRef: RefObject<HTMLDivElement | null>;
  cardRefs: RefObject<(HTMLAnchorElement | null)[]>;
  videoRefs: RefObject<(HTMLVideoElement | null)[]>;
  deal: MotionValue<number>;
  lift: MotionValue<number>;
  wheelRef: RefObject<WheelState>;
  layout: readonly number[];
  onActive: (slot: number) => void;
};

/* One requestAnimationFrame loop poses every card. It only writes a style when its value changed, and
   stops while the hero is off screen. */
function useWheelLoop({ frameRef, headlineRef, sceneRef, backdropRef, cardRefs, videoRefs, deal, lift, wheelRef, layout, onActive }: LoopArgs) {
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof requestAnimationFrame !== 'function') return;
    const reduce = prefersReducedMotion();
    const written = new Map<HTMLElement, Record<string, string>>();
    const write = (el: HTMLElement | null, prop: string, value: string) => {
      if (!el) return;
      const cache = written.get(el) ?? {};
      if (cache[prop] === value) return;
      cache[prop] = value;
      written.set(el, cache);
      el.style.setProperty(prop, value);
    };
    const playing: boolean[] = [];

    /* Size from the frame: cards follow its width, then shrink if the space between the headline and
       the bottom of the frame is short, so the whole top reel is always in view. */
    const measure = () => {
      const { width, height } = frame.getBoundingClientRect();
      const head = headlineRef.current;
      const top = head ? head.offsetTop + head.offsetHeight + 20 : height * 0.3;
      const bottomRoom = Math.max(48, height * 0.07);
      const k = fitScale(scaleFor(width, height), top, height - bottomRoom);
      wheelRef.current.k = k;
      wheelRef.current.height = height;
      wheelRef.current.topEdge = top;
      write(frame, '--card-w', `${Math.round(DESIGN.cardWidth * k)}px`);
    };
    measure();
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    resize?.observe(frame);

    let raf = 0;
    let last = performance.now();
    let lastActive = -1;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const w = wheelRef.current;
      const d = deal.get();
      const l = lift.get();

      if (!w.dragging) {
        if (w.velocity) {
          w.target += w.velocity * dt;
          w.velocity = glide(w.velocity, dt);
        } else if (!reduce && w.hovered < 0 && w.focused < 0) {
          w.target -= DRIFT_DEG_PER_S * l * dt; // the same way the wheel turned as it opened
        }
      }
      w.current = follow(w.current, w.target, dt);

      const k = w.k;
      write(sceneRef.current, 'transform', `translate3d(0px, ${sceneOriginY(l, k, w.height, w.topEdge).toFixed(1)}px, 0px) rotateX(${(DESIGN.tilt * l).toFixed(2)}deg) scale(${(1 + DESIGN.sceneGrow * l).toFixed(4)})`);
      write(backdropRef.current, 'opacity', l.toFixed(3));

      const pivot = pivotFor(l, k);
      layout.forEach((_, slot) => {
        const card = cardRefs.current[slot];
        const pose = cardPose(slot, w.current, d, l, k);
        write(card, 'visibility', pose.visible ? 'visible' : 'hidden');
        if (pose.visible) write(card, 'transform', cardTransform(pose, pivot));
        const video = videoRefs.current[slot];
        if (!video) return;
        const wanted = reduce
          ? w.hovered === slot || w.focused === slot
          : l > 0.6 && pose.visible && Math.abs(wrapAngle(pose.angle)) <= PLAY_WITHIN_DEG;
        if (wanted !== !!playing[slot]) {
          playing[slot] = wanted;
          if (wanted) video.play().catch(() => (playing[slot] = false)); // Autoplay refused: stay on the cover.
          else video.pause();
        }
      });

      const top = activeSlot(w.current, l);
      if (top !== lastActive) {
        lastActive = top;
        onActive(top);
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const seen = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    seen.observe(frame);
    start();
    return () => {
      stop();
      seen.disconnect();
      resize?.disconnect();
    };
  }, [frameRef, headlineRef, sceneRef, backdropRef, cardRefs, videoRefs, deal, lift, wheelRef, layout, onActive]);
}

/* Drag, swipe and sideways scrolling turn the wheel. A vertical mouse wheel turns it only while the
   pointer is on a card, so the page can always be scrolled past the hero. */
function useWheelGestures(frameRef: RefObject<HTMLElement | null>, wheelRef: RefObject<WheelState>, lift: MotionValue<number>) {
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const w = wheelRef.current;
    const degrees = (px: number) => pxToDegrees(px, lift.get(), w.k);
    let pointerId = -1;
    let lastX = 0;
    let travelled = 0;
    let samples: { t: number; target: number }[] = [];

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 || pointerId !== -1) return;
      if ((event.target as Element).closest('button, nav')) return;
      pointerId = event.pointerId;
      lastX = event.clientX;
      travelled = 0;
      samples = [{ t: performance.now(), target: w.target }];
      w.dragging = true;
      w.velocity = 0;
      w.suppressClick = false;
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - lastX;
      lastX = event.clientX;
      travelled += Math.abs(dx);
      if (travelled > DRAG_THRESHOLD_PX) {
        w.suppressClick = true;
        frame.setAttribute('data-dragging', '');
      }
      w.target += degrees(dx);
      const now = performance.now();
      samples.push({ t: now, target: w.target });
      samples = samples.filter((s) => now - s.t < 120);
    };
    const end = (keepVelocity: boolean) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      frame.removeAttribute('data-dragging');
      pointerId = -1;
      w.dragging = false;
      const now = performance.now();
      const lastSample = samples[samples.length - 1];
      const first = samples[0];
      const fresh = lastSample && now - lastSample.t <= STALE_RELEASE_MS;
      w.velocity = keepVelocity && fresh && first && lastSample.t > first.t ? ((lastSample.target - first.target) / (lastSample.t - first.t)) * 1000 : 0;
      /* A tap leaves no drag behind; a real drag swallows the click that follows it. */
      if (!w.suppressClick) return;
      setTimeout(() => (w.suppressClick = false), 350); // long enough for the click a touch release fires
    };
    const onUp = (event: PointerEvent) => event.pointerId === pointerId && end(true);
    const onCancel = (event: PointerEvent) => event.pointerId === pointerId && end(false);

    const onWheel = (event: WheelEvent) => {
      const sideways = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const overCard = !!(event.target as Element).closest('[data-card]');
      if (!sideways && !event.shiftKey && !overCard) return; // Let the page scroll on.
      event.preventDefault();
      event.stopPropagation(); // Keep smooth scrolling (Lenis) from also moving the page.
      w.velocity = 0;
      w.target -= degrees(sideways ? event.deltaX : event.deltaY);
    };

    frame.addEventListener('pointerdown', onDown);
    frame.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      frame.removeEventListener('pointerdown', onDown);
      frame.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [frameRef, wheelRef, lift]);
}

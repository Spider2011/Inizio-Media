'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { isSidewaysWheel, loopScroll, loopSpeed } from '@/lib/auto-scroll';

type Props = {
  children: ReactNode;
  className?: string;
  /** Drift right-to-left content the other way. */
  reverse?: boolean;
  /** Seconds for one full copy of the content to drift past. */
  loopSeconds?: number;
};

/* After a visitor drags, swipes or scrolls the strip, it waits this long before drifting again. */
const RESUME_AFTER_MS = 2000;
/* A press that moves further than this is a drag, not a click on a logo. */
const DRAG_THRESHOLD_PX = 6;

/* A horizontal strip that drifts on its own and can also be scrolled by hand: dragged with the mouse,
   swiped on touch screens, or scrolled sideways with a trackpad or shift + wheel. Its child must hold
   two identical copies of the content side by side, so the loop is seamless in both directions. */
export function AutoScroller({ children, className, reverse = false, loopSeconds = 55 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return attachAutoScroll(el, reverse ? -1 : 1, loopSeconds);
  }, [reverse, loopSeconds]);

  return (
    <div ref={ref} className={className} data-state="running" data-cursor="Drag">
      {children}
    </div>
  );
}

type Strip = {
  el: HTMLDivElement;
  half: number;
  /** Where the strip should be, kept unrounded so slow drifting stays smooth. */
  pos: number;
  /** The scrollLeft this code last set, to tell its own scrolling from the visitor's. */
  lastSet: number;
  hovering: boolean;
  visible: boolean;
  resumeAt: number;
};

function setScroll(strip: Strip, left: number) {
  strip.pos = loopScroll(left, strip.half);
  strip.el.scrollLeft = strip.pos;
  strip.lastSet = strip.el.scrollLeft;
}

function holdFor(strip: Strip, ms = RESUME_AFTER_MS) {
  strip.resumeAt = performance.now() + ms;
}

/* Tabbing onto a logo holds the strip so the link can be reached. Keyboard focus only: a mouse click
   also focuses the link, and that would leave the strip frozen after a visit to Instagram. */
function keyboardFocusInside(el: HTMLElement): boolean {
  const focused = document.activeElement;
  if (!focused || !el.contains(focused)) return false;
  try {
    return focused.matches(':focus-visible');
  } catch {
    return false; // Engines without :focus-visible (test DOMs) have no keyboard focus ring to honour.
  }
}

function isPaused(strip: Strip, now: number): boolean {
  return strip.hovering || keyboardFocusInside(strip.el) || now < strip.resumeAt;
}

function canAnimate(): boolean {
  return (
    typeof requestAnimationFrame === 'function' &&
    typeof ResizeObserver === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function attachAutoScroll(el: HTMLDivElement, direction: 1 | -1, loopSeconds: number): () => void {
  if (!canAnimate()) return () => {};
  const track = el.firstElementChild as HTMLElement | null;
  if (!track) return () => {};

  const strip: Strip = { el, half: 0, pos: 0, lastSet: 0, hovering: false, visible: true, resumeAt: 0 };
  const measure = () => {
    strip.half = track.scrollWidth / 2;
    setScroll(strip, strip.pos);
  };
  measure();

  const resize = new ResizeObserver(measure);
  resize.observe(track);
  const seen = new IntersectionObserver(([entry]) => (strip.visible = entry.isIntersecting));
  seen.observe(el);

  let frame = 0;
  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const paused = isPaused(strip, now);
    const state = paused ? 'paused' : 'running';
    if (el.dataset.state !== state) el.dataset.state = state;
    if (!paused && strip.visible && strip.half > 1) {
      setScroll(strip, strip.pos + direction * loopSpeed(strip.half, loopSeconds) * dt);
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  const detachInput = attachManualInput(strip);
  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    seen.disconnect();
    detachInput();
  };
}

/* Hand scrolling: native swipes and trackpad scrolling, sideways wheel gestures, and mouse dragging. */
function attachManualInput(strip: Strip): () => void {
  const { el } = strip;

  /* Any scroll this code didn't make is the visitor's: follow it and hold the drift. */
  const onScroll = () => {
    if (Math.abs(el.scrollLeft - strip.lastSet) < 2) return;
    holdFor(strip);
    setScroll(strip, el.scrollLeft);
  };
  /* Smooth scrolling swallows wheel events page-wide, so sideways ones are applied here directly. */
  const onWheel = (event: WheelEvent) => {
    if (!isSidewaysWheel(event.deltaX, event.deltaY)) return;
    event.preventDefault();
    event.stopPropagation();
    holdFor(strip);
    setScroll(strip, el.scrollLeft + event.deltaX);
  };
  const onTouch = () => holdFor(strip);
  const onEnter = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') strip.hovering = true;
  };
  const onLeave = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') strip.hovering = false;
  };
  const detachDrag = attachMouseDrag(strip);

  el.addEventListener('scroll', onScroll, { passive: true });
  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('touchstart', onTouch, { passive: true });
  el.addEventListener('touchmove', onTouch, { passive: true });
  el.addEventListener('pointerenter', onEnter);
  el.addEventListener('pointerleave', onLeave);
  return () => {
    el.removeEventListener('scroll', onScroll);
    el.removeEventListener('wheel', onWheel);
    el.removeEventListener('touchstart', onTouch);
    el.removeEventListener('touchmove', onTouch);
    el.removeEventListener('pointerenter', onEnter);
    el.removeEventListener('pointerleave', onLeave);
    detachDrag();
  };
}

/* Click and drag with the mouse. A real drag swallows the click that follows, so letting go over a
   logo doesn't open its Instagram. */
function attachMouseDrag(strip: Strip): () => void {
  const { el } = strip;
  let lastX = 0;
  let travelled = 0;

  const onMove = (event: PointerEvent) => {
    const dx = event.clientX - lastX;
    lastX = event.clientX;
    travelled += Math.abs(dx);
    if (travelled > DRAG_THRESHOLD_PX) el.dataset.dragging = '';
    holdFor(strip);
    setScroll(strip, el.scrollLeft - dx);
  };
  const swallowClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    if (travelled > DRAG_THRESHOLD_PX) {
      el.addEventListener('click', swallowClick, { capture: true, once: true });
      setTimeout(() => el.removeEventListener('click', swallowClick, { capture: true }), 0);
    }
    delete el.dataset.dragging;
  };
  const onDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    lastX = event.clientX;
    travelled = 0;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };
  /* Stop the browser dragging a logo image or link instead of the strip. */
  const onDragStart = (event: DragEvent) => event.preventDefault();

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('dragstart', onDragStart);
  return () => {
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('dragstart', onDragStart);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
}

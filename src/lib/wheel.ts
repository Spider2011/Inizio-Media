/* Geometry for the Our Work wheel: pure functions, no DOM, so every number can be unit-tested.
   Angles are degrees, 0 = straight up, positive = clockwise (CSS rotateZ). Lengths are CSS px. */

/* Eight reels round the wheel (the brief's 34 made the reels too crowded to watch). With more projects
   than slots, the wheel shows the first eight. They sit 30° apart, so the side cards lean gently and
   stay close to the top one; the eight loop over 240° rather than a full turn, and the 40° band
   between the last visible card and the seam (past `visibleArc`) is always hidden. */
export const SLOTS = 8;
export const SLOT_STEP = 30;
/** The turn after which the ring repeats. */
export const PERIOD = SLOTS * SLOT_STEP;

/* Desktop design values (a 170px-wide card in a 1440-wide frame); `scaleFor` sizes them per frame. */
export const DESIGN = {
  cardWidth: 170,
  /* Sized so the cards stand a small gap apart (the brief had 580 → 1010): 30° of a 450px rim is
     ~236px against a ~230px lifted card. Each pivot moves with its radius (pivot − radius stays
     −80 → −196), so the top card keeps its place under the headline. */
  radius: [330, 450] as const, // before → after the lift
  pivot: [250, 254] as const, // how far the pivot sits below the scene origin
  cardGrow: 0.35,
  sceneGrow: 0.14,
  tilt: 12,
  openTurn: 28, // degrees the wheel turns left while it opens
  dealSweep: 70, // each card starts this far right of home
  dealRise: 140, // …and this far below the rim
  visibleArc: 100, // cards further than this from the top are hidden
  depthPerDegree: 1.5
} as const;

/* Halved from the brief's 7°/s so each reel stays at the top long enough to watch. */
export const DRIFT_DEG_PER_S = 3.5;
export const FOLLOW_RATE = 9;
export const GLIDE_DECAY = 3.2;
export const STALE_RELEASE_MS = 80;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOutCubic = (t: number) => 1 - (1 - clamp01(t)) ** 3;

/** A turn folded into (-PERIOD/2, PERIOD/2]: where a slot sits on the looping ring. */
export function wrapTurn(deg: number): number {
  const half = PERIOD / 2;
  const a = ((((deg + half) % PERIOD) + PERIOD) % PERIOD) - half;
  return a === -half ? half : a;
}

/** An angle folded into (-180, 180]. */
export function wrapAngle(deg: number): number {
  const a = ((((deg + 180) % 360) + 360) % 360) - 180;
  return a === -180 ? 180 : a;
}

/* ---------- The ring ---------- */

/** Which project sits in each of the `slots` slots. Projects run round in order; every later pass
    starts half the list further on (so repeats sit far from their originals), and a project is
    never placed next to itself, across the seam included, whenever there are 2+ projects. */
export function ringLayout(projects: number, slots = SLOTS): number[] {
  if (projects < 1) return [];
  const out: number[] = [];
  const passShift = Math.floor(projects / 2);
  for (let s = 0; s < slots; s++) {
    const pass = Math.floor(s / projects);
    let p = (s + pass * passShift) % projects;
    for (let tries = 0; projects > 1 && tries < projects; tries++) {
      const clashesBefore = s > 0 && p === out[s - 1];
      const clashesSeam = s === slots - 1 && p === out[0];
      if (!clashesBefore && !clashesSeam) break;
      p = (p + 1) % projects;
    }
    out.push(p);
  }
  return out;
}

/** True for the first slot of each project: the one keyboard and screen-reader users meet. */
export function canonicalSlots(layout: readonly number[]): boolean[] {
  const seen = new Set<number>();
  return layout.map((p) => (seen.has(p) ? false : (seen.add(p), true)));
}

/* ---------- Sizing ---------- */

/** Scale factor from the hero frame: cards follow the width (a phone still shows a full top card and
    part of each neighbour) but never grow past what the height can hold once lifted. */
export function scaleFor(frameWidth: number, frameHeight: number): number {
  const byWidth = Math.min(Math.max(frameWidth * 0.4, 120), DESIGN.cardWidth) / DESIGN.cardWidth;
  const byHeight = frameHeight / 900;
  return Math.max(0.3, Math.min(byWidth, byHeight));
}

/* ---------- One card ---------- */

export type CardPose = {
  /** Rotation around the pivot, after the deal sweep and opening turn. */
  angle: number;
  radius: number;
  /** Extra drop below the pivot while being dealt. */
  drop: number;
  flip: number;
  scale: number;
  depth: number;
  visible: boolean;
};

/** Where the deal has got to for a card `fromTop` degrees from the top: the top card goes first and
    the deal spreads to both sides at once. */
export function dealProgress(deal: number, fromTop: number): number {
  const order = Math.min(Math.abs(fromTop), 180) / 180;
  return easeOutCubic((deal - order * 0.6) / 0.4);
}

/** The pose of slot `slot` given the wheel's turn and the two driving values. */
export function cardPose(slot: number, wheel: number, deal: number, lift: number, k: number): CardPose {
  const home = slot * SLOT_STEP;
  const settled = wrapTurn(home + wheel - DESIGN.openTurn * lift);
  const p = dealProgress(deal, wrapTurn(home));
  const angle = settled + DESIGN.dealSweep * (1 - p);
  const fromTop = Math.abs(wrapAngle(angle));
  const radius = lerp(DESIGN.radius[0], DESIGN.radius[1], lift) * k * p;
  return {
    angle,
    radius,
    drop: DESIGN.dealRise * k * (1 - p),
    flip: 180 * (1 - p),
    scale: (0.7 + 0.3 * p) * (1 + DESIGN.cardGrow * lift),
    depth: -fromTop * DESIGN.depthPerDegree,
    visible: p > 0 && fromTop <= DESIGN.visibleArc
  };
}

/** The single transform for a card: to the pivot, round it, out along the spoke, flip, scale. */
export function cardTransform(pose: CardPose, pivot: number): string {
  const r = (v: number) => Math.round(v * 100) / 100;
  return (
    `translate3d(0px, ${r(pivot + pose.drop)}px, ${r(pose.depth)}px) rotateZ(${r(pose.angle)}deg) ` +
    `translate3d(0px, ${r(-pose.radius)}px, 0px) rotateY(${r(pose.flip)}deg) scale(${r(pose.scale * 1000) / 1000})`
  );
}

export function pivotFor(lift: number, k: number): number {
  return lerp(DESIGN.pivot[0], DESIGN.pivot[1], lift) * k;
}

/* ---------- The scene ---------- */

const CARD_ASPECT = 16 / 9;

/** On-screen height of the top card once lifted (card growth × scene growth). */
export function liftedCardHeight(k: number): number {
  return DESIGN.cardWidth * CARD_ASPECT * k * (1 + DESIGN.cardGrow) * (1 + DESIGN.sceneGrow);
}

/** Largest scale whose lifted top card fits between `top` and `bottom` (px) of the frame. */
export function fitScale(k: number, top: number, bottom: number): number {
  return Math.max(0.3, Math.min(k, (bottom - top) / liftedCardHeight(1)));
}

/** Where the scene origin sits in the frame (px from the top): lowered as the wheel opens, so the
    lifted top card's top edge lands at `topEdge` and the dealt deck starts near the middle. */
export function sceneOriginY(lift: number, k: number, frameHeight: number, topEdge = frameHeight * 0.3): number {
  const cardH = DESIGN.cardWidth * CARD_ASPECT;
  const rim = (l: number) => (lerp(DESIGN.pivot[0], DESIGN.pivot[1], l) - lerp(DESIGN.radius[0], DESIGN.radius[1], l)) * k;
  const dealt = frameHeight * 0.56 - (rim(0) - (cardH * k) / 2);
  const lifted = topEdge - (rim(1) - cardH * k * (1 + DESIGN.cardGrow)) * (1 + DESIGN.sceneGrow);
  return lerp(dealt, lifted, lift);
}

/* ---------- Turning ---------- */

/** The slot nearest the top for a wheel turn. */
export function activeSlot(wheel: number, lift: number, slots = SLOTS): number {
  const step = PERIOD / slots;
  const raw = Math.round(-(wheel - DESIGN.openTurn * lift) / step);
  return ((raw % slots) + slots) % slots;
}

/** The wheel turn that brings `slot` to the top, choosing the one nearest `from`. */
export function turnFor(slot: number, lift: number, from: number, slots = SLOTS): number {
  const base = -slot * (PERIOD / slots) + DESIGN.openTurn * lift;
  return base + Math.round((from - base) / PERIOD) * PERIOD;
}

/** One frame of the exponential follow toward a target. */
export function follow(current: number, target: number, dt: number, rate = FOLLOW_RATE): number {
  return current + (target - current) * (1 - Math.exp(-dt * rate));
}

/** One frame of glide decay for a released flick. */
export function glide(velocity: number, dt: number): number {
  const v = velocity * Math.exp(-dt * GLIDE_DECAY);
  return Math.abs(v) < 0.5 ? 0 : v;
}

/** Degrees the wheel turns for `px` of horizontal drag at the current size, so the top card tracks
    the finger. */
export function pxToDegrees(px: number, lift: number, k: number): number {
  const radius = lerp(DESIGN.radius[0], DESIGN.radius[1], lift) * k * (1 + DESIGN.sceneGrow * lift);
  return (px / (2 * Math.PI * radius)) * 360;
}

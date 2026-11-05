import { describe, expect, it } from 'vitest';
import {
  activeSlot,
  canonicalSlots,
  cardPose,
  cardTransform,
  dealProgress,
  DESIGN,
  fitScale,
  follow,
  liftedCardHeight,
  glide,
  pxToDegrees,
  ringLayout,
  scaleFor,
  sceneOriginY,
  SLOTS,
  SLOT_STEP,
  turnFor,
  wrapAngle,
  wrapTurn
} from './wheel';

describe('wrapAngle', () => {
  it('folds any angle into (-180, 180]', () => {
    expect(wrapAngle(0)).toBe(0);
    expect(wrapAngle(190)).toBe(-170);
    expect(wrapAngle(-190)).toBe(170);
    expect(wrapAngle(540)).toBe(180);
    expect(wrapAngle(-180)).toBe(180);
  });
});

describe('wrapTurn', () => {
  it('folds a turn onto the 240° ring: eight slots 30° apart', () => {
    expect(SLOT_STEP * SLOTS).toBe(240);
    expect(wrapTurn(0)).toBe(0);
    expect(wrapTurn(130)).toBe(-110);
    expect(wrapTurn(-130)).toBe(110);
    expect(wrapTurn(-120)).toBe(120);
    expect(wrapTurn(480)).toBe(0);
  });
});

describe('ringLayout', () => {
  it('fills every slot and never puts a project next to itself, seam included', () => {
    for (let projects = 2; projects <= 40; projects++) {
      const ring = ringLayout(projects);
      expect(ring).toHaveLength(SLOTS);
      ring.forEach((p, i) => expect(p, `${projects} projects, slot ${i}`).not.toBe(ring[(i + 1) % SLOTS]));
    }
  });

  it('shows the first eight projects when there are more projects than slots', () => {
    expect(SLOTS).toBe(8);
    expect(ringLayout(23)).toEqual(Array.from({ length: 8 }, (_, i) => i));
  });

  it('keeps the lifted cards a small gap apart, never overlapping', () => {
    const rimArc = DESIGN.radius[1] * ((SLOT_STEP * Math.PI) / 180);
    const cardWidth = DESIGN.cardWidth * (1 + DESIGN.cardGrow);
    expect(rimArc - cardWidth).toBeGreaterThan(0);
    expect(rimArc - cardWidth).toBeLessThan(40);
  });

  it('places every project at least once, in order, before any repeat', () => {
    const ring = ringLayout(24, 34);
    expect(ring.slice(0, 24)).toEqual(Array.from({ length: 24 }, (_, i) => i));
  });

  it('offsets the repeats so they sit far from their originals', () => {
    const ring = ringLayout(24, 34);
    const gaps = ring.map((p, slot) => {
      const first = ring.indexOf(p);
      const d = slot - first;
      return d === 0 ? Infinity : Math.min(d, 34 - d);
    });
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(12);
    /* Fewer projects than ten slots repeat too, never side by side. */
    const small = ringLayout(4);
    small.forEach((p, i) => expect(p).not.toBe(small[(i + 1) % SLOTS]));
  });

  it('copes with none or one project', () => {
    expect(ringLayout(0)).toEqual([]);
    expect(ringLayout(1)).toEqual(Array(SLOTS).fill(0));
  });

  it('marks only the first slot of each project as the real one', () => {
    const real = canonicalSlots(ringLayout(24, 34));
    expect(real.filter(Boolean)).toHaveLength(24);
    expect(real.slice(0, 24).every(Boolean)).toBe(true);
  });
});

describe('the deal', () => {
  it('deals the top card first and spreads to both sides at once', () => {
    expect(dealProgress(0.4, 0)).toBe(1);
    expect(dealProgress(0.2, 30)).toBeCloseTo(dealProgress(0.2, -30));
    expect(dealProgress(0.2, 0)).toBeGreaterThan(dealProgress(0.2, 30));
    expect(dealProgress(1, 180)).toBe(1);
    expect(dealProgress(0, 0)).toBe(0);
  });

  it('sweeps a card in from the right, face down, small and low, to its home face up', () => {
    const start = cardPose(0, 0, 0, 0, 1);
    expect(start).toMatchObject({ angle: DESIGN.dealSweep, radius: 0, flip: 180, scale: 0.7, visible: false });
    expect(start.drop).toBe(DESIGN.dealRise);
    const home = cardPose(0, 0, 1, 0, 1);
    expect(home).toMatchObject({ angle: 0, radius: DESIGN.radius[0], drop: 0, flip: 0, scale: 1, visible: true });
  });

  it('hides cards far round the wheel so it never shows a seam', () => {
    expect(cardPose(Math.round(70 / SLOT_STEP), 0, 1, 0, 1).visible).toBe(true);
    expect(cardPose(4, 0, 1, 0, 1).visible).toBe(false); // at the seam, 120° round
    /* Every turn of the wheel shows seven cards at most, so the seam never comes into view. */
    for (let wheel = 0; wheel < 240; wheel += 5) {
      const shown = Array.from({ length: SLOTS }, (_, s) => cardPose(s, wheel, 1, 1, 1)).filter((c) => c.visible);
      expect(shown.length, `turn ${wheel}`).toBeLessThanOrEqual(7);
    }
  });

  it('pushes cards back by their distance from the top so the top card overlaps evenly', () => {
    const topSlot = Math.round(DESIGN.openTurn / SLOT_STEP);
    const left = cardPose((topSlot - 1 + SLOTS) % SLOTS, 0, 1, 1, 1);
    const right = cardPose(topSlot + 1, 0, 1, 1, 1);
    const top = cardPose(topSlot, 0, 1, 1, 1);
    expect(left.depth).toBeLessThan(top.depth);
    expect(right.depth).toBeLessThan(top.depth);
  });
});

describe('the lift', () => {
  it('grows cards 35%, widens the wheel and turns it left as it opens', () => {
    const lifted = cardPose(0, 0, 1, 1, 1);
    expect(lifted.scale).toBeCloseTo(1.35);
    expect(lifted.radius).toBe(DESIGN.radius[1]);
    expect(lifted.angle).toBe(-DESIGN.openTurn);
  });

  it('keeps the lifted top card inside the frame', () => {
    for (const [w, h] of [[1440, 900], [1920, 1080], [390, 844], [768, 1024]]) {
      const k = scaleFor(w, h);
      const top = sceneOriginY(1, k, h) - (DESIGN.radius[1] - DESIGN.pivot[1] + DESIGN.cardWidth * (16 / 9) * 1.35) * k * 1.14;
      expect(top, `${w}x${h}`).toBeGreaterThan(h * 0.25);
    }
  });

  it('writes one transform in the brief’s order', () => {
    const t = cardTransform(cardPose(0, 0, 1, 1, 1), DESIGN.pivot[1]);
    expect(t).toBe(`translate3d(0px, ${DESIGN.pivot[1]}px, -42px) rotateZ(-28deg) translate3d(0px, -${DESIGN.radius[1]}px, 0px) rotateY(0deg) scale(1.35)`);
  });
});

describe('fitting the frame', () => {
  it('lands the lifted top card exactly on the requested top edge', () => {
    const k = 0.9;
    const top = sceneOriginY(1, k, 800, 260) + (DESIGN.pivot[1] - DESIGN.radius[1]) * k * 1.14 - liftedCardHeight(k);
    expect(top).toBeCloseTo(260);
  });

  it('shrinks the cards when the height between headline and caption is short', () => {
    expect(fitScale(1, 250, 250 + liftedCardHeight(1))).toBeCloseTo(1);
    expect(fitScale(1, 250, 250 + liftedCardHeight(0.5))).toBeCloseTo(0.5);
    expect(fitScale(0.8, 0, 2000)).toBe(0.8);
  });
});

describe('sizing', () => {
  it('uses full-size cards on desktop and slightly smaller ones on a phone', () => {
    expect(scaleFor(1440, 900)).toBe(1);
    expect(scaleFor(375, 812)).toBeCloseTo(150 / 170, 2);
    expect(scaleFor(812, 375)).toBeCloseTo(375 / 900, 2);
  });
});

describe('turning', () => {
  it('finds the card at the top, before and after the opening turn', () => {
    expect(activeSlot(0, 0)).toBe(0);
    expect(activeSlot(-SLOT_STEP * 3, 0)).toBe(3);
    expect(activeSlot(0, 1)).toBe(Math.round(DESIGN.openTurn / SLOT_STEP));
    expect(activeSlot(SLOT_STEP, 0)).toBe(SLOTS - 1);
  });

  it('turns to bring a slot to the top by the shortest way', () => {
    const turn = turnFor(5, 1, 720);
    expect(activeSlot(turn, 1)).toBe(5);
    expect(Math.abs(turn - 720)).toBeLessThanOrEqual(SLOT_STEP * SLOTS / 2);
  });

  it('eases toward its target and lets a flick die away', () => {
    expect(follow(0, 100, 1 / 60)).toBeCloseTo(100 * (1 - Math.exp(-9 / 60)));
    expect(glide(100, 1)).toBeCloseTo(100 * Math.exp(-3.2));
    expect(glide(0.4, 0.016)).toBe(0);
  });

  it('turns by the drag distance measured along the rim', () => {
    expect(pxToDegrees(2 * Math.PI * DESIGN.radius[0], 0, 1)).toBeCloseTo(360);
  });
});

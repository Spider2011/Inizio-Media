import { describe, expect, it } from 'vitest';
import { isSidewaysWheel, loopScroll, loopSpeed } from './auto-scroll';

describe('loopScroll', () => {
  it('leaves offsets inside the loop alone', () => {
    expect(loopScroll(1, 1000)).toBe(1);
    expect(loopScroll(500.5, 1000)).toBe(500.5);
    expect(loopScroll(999, 1000)).toBe(999);
  });

  it('jumps back by one copy when scrolled past it', () => {
    expect(loopScroll(1000, 1000)).toBe(0);
    expect(loopScroll(1250, 1000)).toBe(250);
  });

  it('jumps forward by one copy at the start, so the strip can keep moving left', () => {
    expect(loopScroll(0, 1000)).toBe(1000 - 0);
    expect(loopScroll(-30, 1000)).toBe(970);
  });

  it('does nothing before the strip has a size', () => {
    expect(loopScroll(0, 0)).toBe(0);
    expect(loopScroll(5, Number.NaN)).toBe(5);
  });
});

describe('loopSpeed', () => {
  it('moves one copy per loop', () => {
    expect(loopSpeed(3300, 55)).toBe(60);
    expect(loopSpeed(3300, 0)).toBe(0);
  });
});

describe('isSidewaysWheel', () => {
  it('only takes gestures that are mostly horizontal', () => {
    expect(isSidewaysWheel(40, 3)).toBe(true);
    expect(isSidewaysWheel(-40, 0)).toBe(true);
    expect(isSidewaysWheel(0, 100)).toBe(false);
    expect(isSidewaysWheel(10, 10)).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { largestFitting, sizeToFitWidest } from './fit';

describe('sizeToFitWidest', () => {
  it('keeps the size when the widest word already fits', () => {
    expect(sizeToFitWidest({ size: 48.4, available: 358, widest: 358 }, 24)).toBe(48.4);
  });

  it('scales the size down in proportion so the widest word fits, rounding down', () => {
    // "beginnings." at 48.4px is 408px wide; the column is 358px.
    expect(sizeToFitWidest({ size: 48.4, available: 358, widest: 408 }, 24)).toBe(42);
  });

  it('never goes below the minimum', () => {
    expect(sizeToFitWidest({ size: 48, available: 100, widest: 400 }, 24)).toBe(24);
  });

  it('keeps the size when nothing can be measured yet', () => {
    expect(sizeToFitWidest({ size: 48, available: 0, widest: 0 }, 24)).toBe(48);
  });
});

describe('largestFitting', () => {
  it('finds the largest size that still fits, to the nearest pixel', () => {
    expect(largestFitting((size) => size <= 87.4, 20, 200)).toBe(87);
  });

  it('returns the maximum when everything fits', () => {
    expect(largestFitting(() => true, 20, 132)).toBe(132);
  });

  it('never goes below the minimum', () => {
    expect(largestFitting(() => false, 24, 132)).toBe(24);
  });
});

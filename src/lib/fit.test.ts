import { describe, expect, it } from 'vitest';
import { largestFitting } from './fit';

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

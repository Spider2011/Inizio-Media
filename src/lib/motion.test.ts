import { describe, expect, it } from 'vitest';
import { distribute, wrap } from './motion';

describe('wrap', () => {
  it('keeps a value inside [min, max) so marquees loop seamlessly', () => {
    expect(wrap(-25, 0, -10)).toBe(-10);
    expect(wrap(-25, 0, -30)).toBe(-5);
    expect(wrap(-25, 0, 5)).toBe(-20);
    expect(wrap(-25, 0, -25)).toBe(-25);
  });
});

describe('distribute', () => {
  it('deals items into columns round-robin, keeping order within each column', () => {
    expect(distribute([1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6]
    ]);
  });

  it('does not mutate its input', () => {
    const items = Object.freeze([1, 2, 3]);
    expect(() => distribute(items, 2)).not.toThrow();
  });
});

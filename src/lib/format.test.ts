import { describe, expect, it } from 'vitest';
import { decimalsOf, formatCount, pad2 } from './format';

describe('pad2', () => {
  it('numbers steps, services and photos the brochure way', () => {
    expect(pad2(1)).toBe('01');
    expect(pad2(14)).toBe('14');
  });
});

describe('decimalsOf', () => {
  it('counts the decimals written in the stat value', () => {
    expect(decimalsOf('10.2')).toBe(1);
    expect(decimalsOf('15')).toBe(0);
    expect(decimalsOf('3.25')).toBe(2);
  });
});

describe('formatCount', () => {
  it('rounds whole numbers and keeps the written precision', () => {
    expect(formatCount(7.6, 0)).toBe('8');
    expect(formatCount(10.16, 1)).toBe('10.2');
    expect(formatCount(0, 1)).toBe('0.0');
  });
});

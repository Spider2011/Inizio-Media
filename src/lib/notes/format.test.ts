import { describe, expect, it } from 'vitest';
import { formatNoteDate, holderFor, stampDate, tiltFor } from './format';

describe('note dates', () => {
  it('formats the readable date in en-GB, Mumbai time', () => {
    expect(formatNoteDate('2026-11-08T10:00:00.000Z')).toBe('8 Nov 2026');
    // 20:00 UTC on the 7th is already the 8th in Mumbai.
    expect(formatNoteDate('2026-11-07T20:00:00.000Z')).toBe('8 Nov 2026');
  });

  it('formats the stamp with a two-digit day and capitals', () => {
    expect(stampDate('2026-11-08T10:00:00.000Z')).toBe('08 NOV 2026');
    expect(stampDate('2026-09-21T10:00:00.000Z')).toBe('21 SEP 2026');
  });

  it('accepts Date objects', () => {
    expect(stampDate(new Date('2026-01-02T06:00:00Z'))).toBe('02 JAN 2026');
  });
});

describe('note looks', () => {
  const ids = Array.from({ length: 200 }, (_, i) => `note-${i}-${(i * 7919).toString(36)}`);

  it('gives every id the same tilt every time, between -4 and 4 degrees', () => {
    ids.forEach((id) => {
      const tilt = tiltFor(id);
      expect(tilt).toBe(tiltFor(id));
      expect(tilt).toBeGreaterThanOrEqual(-4);
      expect(tilt).toBeLessThanOrEqual(4);
    });
    expect(new Set(ids.map(tiltFor)).size).toBeGreaterThan(10);
  });

  it('alternates the holder by position: pins and tape', () => {
    expect([0, 1, 2, 3].map(holderFor)).toEqual(['pin-butter', 'tape', 'pin-red', 'tape']);
  });
});

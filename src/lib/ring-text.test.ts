import { describe, expect, it } from 'vitest';
import { ringLayout, RING_SEPARATOR } from './ring-text';

/* The badge's real measurements: a 490-unit ring, 15px type, ~12.5 units a letter at 15px. */
const RING = 490;
const OPTIONS = { baseSize: 15, maxSize: 20, advancePerPx: 12.5 / 15 };

const copiesOf = (text: string, phrase: string) => text.split(phrase).length - 1;

describe('ringLayout', () => {
  it('repeats a short phrase as many times as fits, each copy followed by a bullet', () => {
    const { text, fontSize } = ringLayout('Start a project', RING, OPTIONS);
    expect(text).toBe(`Start a project${RING_SEPARATOR}Start a project${RING_SEPARATOR}`);
    expect(fontSize).toBeGreaterThanOrEqual(15);
    expect(fontSize).toBeLessThan(16);
  });

  it('shows a long phrase once, never a second copy that would be cut off', () => {
    const { text } = ringLayout('Inizio means beginning', RING, OPTIONS);
    expect(text).toBe(`Inizio means beginning${RING_SEPARATOR}`);
    expect(copiesOf(text, 'Inizio means')).toBe(1);
  });

  it('grows the type to fill the ring rather than spreading the letters, up to the limit', () => {
    const once = ringLayout('Inizio means beginning', RING, OPTIONS);
    /* One copy fills only ~64% of the ring at 15px; it would need ~22px, so it stops at the 20px limit. */
    expect(once.fontSize).toBe(20);
    /* A very short phrase simply repeats more, so it needs no growth at all. */
    expect(ringLayout('Hi', RING, OPTIONS).fontSize).toBeLessThan(17);
  });

  it('never shrinks below the designed size, even when one copy overfills the ring', () => {
    expect(ringLayout('Digital marketing and branding agency', RING, OPTIONS).fontSize).toBe(15);
  });

  it('ignores stray spaces around the phrase', () => {
    expect(ringLayout('  Book a call  ', RING, OPTIONS).text.startsWith(`Book a call${RING_SEPARATOR}`)).toBe(true);
  });
});

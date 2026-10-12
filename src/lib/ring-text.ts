/* Text for a circular badge: the phrase repeated as many times as fits once round the ring, each copy
   followed by a bullet, so the last bullet sits at the seam and nothing is cut off or overlaps. When the
   copies would leave a lot of ring empty, the type grows (up to a limit) instead of the gaps widening. */

export const RING_SEPARATOR = ' • ';

export type RingOptions = {
  /** Font size the badge is designed at, and the smallest it may be. */
  baseSize: number;
  /** Largest font size allowed when a phrase needs filling out. */
  maxSize: number;
  /** Width of one character (letter-spacing included) per pixel of font size, in ring units. */
  advancePerPx: number;
};

export type RingLayout = { text: string; fontSize: number };

/* Leave a little slack so the final spacing adjustment only ever stretches slightly. */
const FILL = 0.94;

export function ringLayout(phrase: string, circumference: number, { baseSize, maxSize, advancePerPx }: RingOptions): RingLayout {
  const unit = `${phrase.trim()}${RING_SEPARATOR}`;
  const unitWidth = unit.length * advancePerPx * baseSize;
  const copies = Math.max(1, Math.floor(circumference / unitWidth));
  const text = unit.repeat(copies);
  const natural = copies * unitWidth;
  const fontSize = Math.min(maxSize, Math.max(baseSize, (baseSize * circumference * FILL) / natural));
  return { text, fontSize: Math.round(fontSize * 10) / 10 };
}

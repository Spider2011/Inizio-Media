/* Shared motion language for the site: one strong ease-out for entrances, one in-out for wipes. */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;

/* Reveal once, when the element's top passes 88% of the viewport (works for any element height). */
export const VIEW = { once: true, margin: '0px 0px -12% 0px' } as const;

/* Wraps v into [min, max): used to loop marquee tracks without a visible jump. */
export function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/* Deals items into `columns` lists round-robin (masonry columns that keep reading order). */
export function distribute<T>(items: readonly T[], columns: number): T[][] {
  return Array.from({ length: columns }, (_, column) => items.filter((_, i) => i % columns === column));
}

import type { CSSProperties } from 'react';

/* Inline CSS custom properties, typed: cssVars({ d: '120ms' }) → { '--d': '120ms' }. */
export function cssVars(vars: Record<string, string | number>): CSSProperties {
  return Object.fromEntries(Object.entries(vars).map(([key, value]) => [`--${key}`, value])) as CSSProperties;
}

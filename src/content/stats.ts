/* Real figures from the brochure. `value` keeps the written precision ("10.2"). */

export type Stat = { value: string; suffix: string; label: string };

export const HERO_STATS: readonly Stat[] = [
  { value: '8', suffix: '+', label: 'Years' },
  { value: '100', suffix: '+', label: 'Projects delivered' }
];

export const RESULT_STATS: readonly Stat[] = [
  { value: '15', suffix: 'M', label: 'Organic views' },
  { value: '10.2', suffix: 'M', label: 'Total reach' },
  { value: '100', suffix: 'K', label: 'Page engagement' }
];

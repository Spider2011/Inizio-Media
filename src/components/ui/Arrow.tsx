import { cx } from '@/lib/cx';

type Props = { direction?: 'right' | 'up-right' | 'left' | 'up' | 'down'; className?: string };

const PATHS = {
  right: 'M3 12h17M14 6l6 6-6 6',
  left: 'M21 12H4M10 6l-6 6 6 6',
  'up-right': 'M7 17L17 7M8 7h9v9',
  up: 'M12 21V4M6 10l6-6 6 6',
  down: 'M12 3v17M6 14l6 6 6-6'
} as const;

/* The arrow is the site's one directional glyph: 24px grid, 1.5px stroke, square caps. */
export function Arrow({ direction = 'right', className }: Props) {
  return (
    <svg className={cx('arrow', className)} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d={PATHS[direction]} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

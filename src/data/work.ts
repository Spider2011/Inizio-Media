/* The cards on the Our Work wheel, in wheel order: the eight reels built by `npm run reels`
   (scripts/build-reels.mjs picks them from /REELS). Each card shows its still, loops a few silent
   seconds while near the top, and opens the full reel with sound when clicked. */
import type { StaticImageData } from 'next/image';
import { REELS } from '@/data/reels';

export type WorkProject = {
  slug: string;
  client: string;
  title: string;
  /** A short tag on the card: Reel, Branding, Ad film… */
  category: string;
  /** 9:16 still for the card face. */
  cover?: StaticImageData | string;
  /** Short silent 9:16 loop shown on the card. */
  preview?: string;
  /** Where the card goes: the case study, or for a reel its video file (the fallback without scripts). */
  href: string;
  /** The full reel with sound: when present, a click opens it in the player. */
  video?: string;
  /** Shown on the card face when there is no cover. */
  logo?: StaticImageData;
};

export const WORK_PROJECTS: readonly WorkProject[] = REELS.map((reel, i) => ({
  slug: `reel-${i + 1}`,
  client: 'Inizio Media',
  title: `Reel ${i + 1}`,
  category: 'Reel',
  cover: reel.poster,
  preview: reel.preview,
  href: reel.src,
  video: reel.src
}));

/** Links that leave the site open in a new tab. */
export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

export function coverSrc(cover: StaticImageData | string | undefined): string | undefined {
  if (!cover) return undefined;
  return typeof cover === 'string' ? cover : cover.src;
}

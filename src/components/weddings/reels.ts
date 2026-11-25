import type { WeddingReel } from '@/content/weddings';
import type { ReelFile } from '@/data/reels';
import { WEDDING_REEL_FILES } from '@/data/wedding-reels';

export type ShownReel = WeddingReel & ReelFile;

/* A reel's words joined to its encoded files. A missing file is a build mistake (the reel was added
   to the page but not to scripts/build-reels.mjs), so it fails loudly. */
export function withFile(reel: WeddingReel): ShownReel {
  const file = WEDDING_REEL_FILES[reel.id];
  if (!file) throw new Error(`Wedding reel ${reel.id} has no encoded file: run \`npm run reels -- weddings\`.`);
  return { ...reel, ...file };
}

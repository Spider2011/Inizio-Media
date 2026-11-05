import type { ImageLoader } from 'next/image';

/* Stock photography comes from Unsplash (free licence, commercial use, no attribution required;
   "Unsplash+" images are excluded because they need a paid licence). Unsplash's CDN resizes on
   request, so images are hotlinked at exactly the width each slot needs, as Unsplash recommends. */

export type StockPhoto = {
  /** Unsplash image id, e.g. "photo-1590102425828-07f1fa2ed1f6". */
  id: string;
  /** What the photo shows (used where the photo carries meaning; decorative slots use alt=""). */
  alt: string;
  /** The studio's own image in /public; used instead of the Unsplash photo when set. */
  local?: string;
};

export function unsplashSrc(photo: StockPhoto): string {
  return `https://images.unsplash.com/${photo.id}`;
}

export const unsplashLoader: ImageLoader = ({ src, width, quality }) =>
  `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 70}`;

/** Props for next/image: the local file when there is one, otherwise the Unsplash photo via its CDN. */
export function photoSource(photo: StockPhoto): { src: string; loader?: ImageLoader } {
  return photo.local ? { src: photo.local } : { src: unsplashSrc(photo), loader: unsplashLoader };
}

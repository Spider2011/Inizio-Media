import { Caveat, Space_Mono } from 'next/font/google';

/* Only the beginnings wall uses these (handwriting and the date stamp), so they are not preloaded:
   other pages never download them. */

export const handFont = Caveat({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-hand',
  display: 'swap',
  preload: false
});

export const stampFont = Space_Mono({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-stamp',
  display: 'swap',
  preload: false
});

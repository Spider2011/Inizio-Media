import { Manrope, Syne } from 'next/font/google';

/* Syne (display, avant-garde and wide) + Manrope (body): the "Fashion Forward" pairing from UI/UX Pro Max.
   next/font self-hosts both at build time. */

export const displayFont = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

export const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

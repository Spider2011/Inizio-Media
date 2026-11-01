import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { KeywordBand } from '@/components/sections/KeywordBand';
import { PageIndex } from '@/components/sections/PageIndex';

/* Title and description come from the root layout's defaults; the home page adds its canonical URL. */
export const metadata: Metadata = {
  alternates: { canonical: '/' }
};

/* The home page stays short: the hero, a moving band of what we do, and the way into every page.
   Everything else lives on its own page, reached from here or the menu. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <KeywordBand />
      <PageIndex />
    </>
  );
}

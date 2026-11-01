import { Hero } from '@/components/sections/Hero';
import { KeywordBand } from '@/components/sections/KeywordBand';
import { PageIndex } from '@/components/sections/PageIndex';

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

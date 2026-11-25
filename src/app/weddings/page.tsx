import type { Metadata } from 'next';
import { PageHero } from '@/components/site/PageHero';
import { PageShell } from '@/components/site/PageShell';
import { HeroReels } from '@/components/weddings/HeroReels';
import { WeddingBook } from '@/components/weddings/WeddingBook';
import { WeddingFilm } from '@/components/weddings/WeddingFilm';
import { WeddingServices } from '@/components/weddings/WeddingServices';
import { WeddingWhy } from '@/components/weddings/WeddingWhy';
import { getPage } from '@/content/pages';
import { SHARE_IMAGE } from '@/lib/share-image';

const page = getPage('weddings');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href, images: [SHARE_IMAGE] }
};

/* Weddings: the reels first (as a roll of film, in the order a wedding happens), then the two things
   couples book us for, why they pick us, and the way to book. */
export default function WeddingsPage() {
  return (
    <PageShell id="weddings" hero={<PageHero page={page} visual={<HeroReels />} />}>
      <WeddingFilm />
      <WeddingServices />
      <WeddingWhy />
      <WeddingBook />
    </PageShell>
  );
}

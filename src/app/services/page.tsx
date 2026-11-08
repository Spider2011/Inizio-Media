import type { Metadata } from 'next';
import { Collaborate } from '@/components/sections/Collaborate';
import { KeywordBand } from '@/components/sections/KeywordBand';
import { Process } from '@/components/sections/Process';
import { Services } from '@/components/sections/Services';
import { PageShell } from '@/components/site/PageShell';
import { getPage } from '@/content/pages';
import { SHARE_IMAGE } from '@/lib/share-image';

const page = getPage('services');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href, images: [SHARE_IMAGE] }
};

export default function ServicesPage() {
  return (
    <PageShell id="services">
      <Services />
      <Process />
      <KeywordBand />
      <Collaborate />
    </PageShell>
  );
}

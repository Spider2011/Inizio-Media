import type { Metadata } from 'next';
import { About } from '@/components/sections/About';
import { Collaborate } from '@/components/sections/Collaborate';
import { Process } from '@/components/sections/Process';
import { Results } from '@/components/sections/Results';
import { PageShell } from '@/components/site/PageShell';
import { getPage } from '@/content/pages';
import { SHARE_IMAGE } from '@/lib/share-image';

const page = getPage('about');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href, images: [SHARE_IMAGE] }
};

export default function AboutPage() {
  return (
    <PageShell id="about">
      <About />
      <Results />
      <Process />
      <Collaborate />
    </PageShell>
  );
}

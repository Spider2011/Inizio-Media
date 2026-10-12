import type { Metadata } from 'next';
import { Collaborate } from '@/components/sections/Collaborate';
import { KeywordBand } from '@/components/sections/KeywordBand';
import { Process } from '@/components/sections/Process';
import { Services } from '@/components/sections/Services';
import { PageShell } from '@/components/site/PageShell';
import { getPage } from '@/content/pages';

const page = getPage('services');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href }
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

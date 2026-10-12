import type { Metadata } from 'next';
import { Collaborate } from '@/components/sections/Collaborate';
import { Results } from '@/components/sections/Results';
import { Work } from '@/components/sections/Work';
import { PageShell } from '@/components/site/PageShell';
import { getPage } from '@/content/pages';

const page = getPage('work');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href }
};

export default function WorkPage() {
  return (
    <PageShell id="work">
      <Work />
      <Results />
      <Collaborate />
    </PageShell>
  );
}

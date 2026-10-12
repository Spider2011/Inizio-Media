import type { Metadata } from 'next';
import { Clients } from '@/components/sections/Clients';
import { Testimonials } from '@/components/sections/Testimonials';
import { PageShell } from '@/components/site/PageShell';
import { getPage } from '@/content/pages';

const page = getPage('clientele');

export const metadata: Metadata = {
  title: page.label,
  description: page.description,
  alternates: { canonical: page.href },
  openGraph: { title: `${page.label} · Inizio Media`, description: page.description, url: page.href }
};

export default function ClientelePage() {
  return (
    <PageShell id="clientele">
      <Clients />
      <Testimonials />
    </PageShell>
  );
}
